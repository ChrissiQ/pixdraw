function objToRGBA(obj){
	return 'rgba(' + obj.r + ',' + obj.g + ',' + obj.b + ',' + obj.a + ')';
}

// Takes RGBA string and turns it into object (with r,g,b,a properties).
// Assumes RGB [0,255] and A [0,1] and returns object RGBA [0,1].
function RGBAToObj(rgba){
	var obj = {};
	var sliced = rgba.concat("");
	sliced = sliced.substr(sliced.indexOf('(')+1, ((sliced.indexOf(')'))-5));	
	obj.r = (sliced.substr(0, sliced.indexOf(',')))/255;

	sliced = sliced.substr(sliced.indexOf(',')+1);
	obj.g = (sliced.substr(0, sliced.indexOf(',')))/255;

	sliced = sliced.substr(sliced.indexOf(',')+1);
	obj.b = (sliced.substr(0, sliced.indexOf(',')))/255;

	sliced = sliced.substr(sliced.indexOf(',')+1);
	obj.a = sliced;
	
	return obj;
}

// Adds two pixels together based on opacity.
// Assumes two objects with r,g,b,a properties.
function aOverB(a,b){
	var aObj = {};
	var bObj = {};
	
	if (typeof a == 'string'){
		aObj = RGBAToObj(a);
	} else if (typeof a == 'object'){
		aObj.r = a.r/255;
		aObj.g = a.g/255;
		aObj.b = a.b/255;
		aObj.a = a.a;
	};
	
	if (typeof b == 'string'){
		bObj = RGBAToObj(b);
	} else {
		bObj.r = b.r/255;
		bObj.g = b.g/255;
		bObj.b = b.b/255;
		bObj.a = b.a;
	};
	var alpha = 1 - (1 - aObj.a) * (1 - bObj.a);
	return objToRGBA({
		a: alpha,
		r: Math.round((aObj.r * aObj.a / alpha + bObj.r * bObj.a * (1 - aObj.a) / alpha)*255),
		g: Math.round((aObj.g * aObj.a / alpha + bObj.g * bObj.a * (1 - aObj.a) / alpha)*255),
		b: Math.round((aObj.b * aObj.a / alpha + bObj.b * bObj.a * (1 - aObj.a) / alpha)*255)
	});
}
var mouse = {
	down: false,
	button: 0
};
var image = {map: [], origin: {}};	
var view = {
	scale: 25,
	width: $(window).width(),
	height: $(window).height(),
	
	palette: {
		x: 49,
		y: 49,
		backColour: "rgba(0,0,0,0.2)",
		foreColour: "rgba(255,0,0,0.2)",
		mode: "draw"
	}
};

// Set the size of the canvas element.  Literally.
view.canvas = document.getElementById('pixdraw');
view.canvas.width = view.width-1;
view.canvas.height = view.height-5;

// Get the context of the canvas.  So we can draw!
view.ctx = view.canvas.getContext('2d');
view.ctx.strokeStyle = "#888888";

// Set the size of the palette element.  Again, literally.
view.palette.elem = document.getElementById('palette');
view.palette.elem.width = 61;
view.palette.elem.height = 401;

// Set the location of the palette element... literally.  Like on the page.
$(view.palette.elem).css('top', view.palette.x);
$(view.palette.elem).css('left', view.palette.y);

view.draw = function(){	
view.ctx.strokeStyle = "#888888";
	// Draw grid: vertical lines
	for (i=-0.5;i<view.canvas.width-0.5;i+=view.scale){
		view.ctx.beginPath();
		view.ctx.moveTo(i,-0.5);
		view.ctx.lineTo(i,view.canvas.height-0.5);
		view.ctx.closePath();
		view.ctx.stroke();
	}
	// Draw grid: horizontal lines
	for (j=-0.5;j<view.canvas.height-0.5;j+=view.scale){
		view.ctx.beginPath();
		view.ctx.moveTo(-0.5,j);
		view.ctx.lineTo(view.canvas.width-0.5,j);
		view.ctx.closePath();
		view.ctx.stroke();
	}
	// Draw pixels.
	if (image && image.map){
		for (k=0;k<image.map.length;k++){
			view.drawPixel({
				x: (image.origin.x + image.map[k].x)*view.scale,
				y: (image.origin.y + image.map[k].y)*view.scale,
				colour: image.map[k].colour});
		}
	}
};

view.drawClick = function(event){

	// Coordinates of click.
	var click = {x: event.clientX, y: event.clientY};
	// Top left corner of pixel square.
	var pix = {	x: Math.floor(click.x/view.scale)*view.scale,
				y: Math.floor(click.y/view.scale)*view.scale};
	var coord;
	var oldCoord = {};

	// Our program has different modes.  If the mode is drawing, we are
	// going to draw pixels.
	if (view.palette.mode === "draw"){

		// If no pixels have been drawn, this is the origin.
		if (!image.map[0]){
			image.origin.x = Math.floor(pix.x/view.scale);
			image.origin.y = Math.floor(pix.y/view.scale);
		}
		
		// After origin is found, we can find out what coord the
		// new pixel has.
		coord = {
			x: Math.floor((click.x-(image.origin.x*view.scale))/view.scale),
			y: Math.floor((click.y-(image.origin.y*view.scale))/view.scale),
			exists: false
		};
	
		// We have two drawing colours depending on mouse button.
		if (mouse.button === 1){
			pix.colour = view.palette.foreColour;
		} else if (mouse.button === 3){
			pix.colour = view.palette.backColour;
		}

		// Find out whether the pixel exists already.  We don't want
		// to have multiple of the same pixel when it is clicked again.
		for (i=0;i<image.map.length;i++){
			if (image.map[i].x == coord.x && image.map[i].y == coord.y){				
				coord.exists = true;
				view.clearPixel(pix);
				image.map[i].colour = aOverB(pix.colour,image.map[i].colour);
				view.drawPixel({
					x: pix.x,
					y: pix.y,
					colour: image.map[i].colour});
				break;
			}
		}
		
		// If it doesn't exist, create a new one!
		if (coord.exists == false){
			image.map.push({x: coord.x, y: coord.y, colour: pix.colour});
			view.drawPixel(pix);
		}
	} else if (view.palette.mode === "move"){

	}
}	

view.drawPixel = function(pix){
	view.ctx.fillStyle = pix.colour;
	// Draw pixel inside the grid bounds (1 pixel inside).
	view.ctx.fillRect(pix.x, pix.y, view.scale-1, view.scale-1);
}	
view.clearPixel = function(pix){
	// Erase pixel, not grid.
	view.ctx.clearRect(pix.x, pix.y, view.scale-1, view.scale-1);
}
view.draw();

$("#pixdraw").bind('mousewheel', function(event, delta) {
// Determine which way the mouse wheel spun, and scale the page.
	if (delta > 0){
		if (view.scale<100) view.scale++;
	} else if (delta < 0){
		if (view.scale>5) view.scale--;
	}

	view.ctx.clearRect(0,0,view.canvas.width,view.canvas.height);
	view.draw();
});

// This enables you to draw in the background colour without the context menu getting in the way when you right-click.
$("#pixdraw").bind("contextmenu", function(e) {
    return false;
});


$('#pixdraw').mousedown(function(event){
	mouse.down = true;
	mouse.button = event.which;
	view.drawClick(event);
});

$('#pixdraw').mouseup(function(){
	mouse.down = false;
	mouse.button = false;
});

$('#pixdraw').mousemove(function(event){
	if (mouse.down === true){
		view.drawClick(event);
	}
});

$('#mover').mousedown(function(){

	view.palette.mode = "move";

});

$('#drawer').mousedown(function(){

	view.palette.mode = "draw";
	
});

$('#fore').css({'background-color': view.palette.foreColour});
$('#back').css({'background-color': view.palette.backColour});

$('#fore').colorpicker({format: 'rgba'}).on('changeColor', function(event){
	view.palette.foreColour = objToRGBA(event.color.toRGB());
	$('#fore').css({'background-color': objToRGBA(event.color.toRGB())});
});

$('#back').colorpicker({format: 'rgba'}).on('changeColor', function(event){
	view.palette.backColour = objToRGBA(event.color.toRGB());
	$('#back').css({'background-color': objToRGBA(event.color.toRGB())});
});

$(window).resize(function(){
	view.width = $(window).width();
	view.height = $(window).height();
	view.canvas.width = view.width-1;
	view.canvas.height = view.height-5;
	view.draw();
});
