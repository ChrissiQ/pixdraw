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

// Addditive colouring between background and new colour.
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
	} else if (typeof b == 'object'){
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
	button: 0,
	moving: false,
	position: {}
};
var image = {
	map: [], 
	origin: {}, 
	topLeft: {x: 1, y: 1}, 
	bottomRight: {x: 0, y: 0}
};
	
var view = {
	scale: 25,
	width: $(window).width(),
	height: $(window).height(),
	grid: true,
	mode: "draw",
	movementOffset: {	// Used when mouse moves.
		x: 0,
		y: 0
	},	
	palette: {
		x: 49,
		y: 49,
		backColour: "rgba(0,0,0,0.2)",
		foreColour: "rgba(255,0,0,0.2)",
	},
	canvas: document.getElementById('pixdraw'),
	sharing: false,
	topLeft: {x: 0, y: 0}
};

// Set the size of the canvas element.  Literally.
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
	view.ctx.clearRect(0,0,view.width, view.height);
	view.ctx.strokeStyle = "#888888";

	if (view.grid){
	
		// Draw grid: vertical lines
		for (i=-0.5;i<view.canvas.width-0.5;i+=view.scale){
			view.drawLine(
				{
					x:i+(view.movementOffset.x % view.scale),
					y:-0.5
				},
				{
					x:i+(view.movementOffset.x % view.scale),
					y:view.canvas.height-0.5
				},
				'rgba(200,200,200,1)'
			);
		}
		// Draw grid: horizontal lines
		for (j=-0.5;j<view.canvas.height-0.5;j+=view.scale){
			view.drawLine(
				{
					x:-0.5,
					y:j + (view.movementOffset.y % view.scale)
				},
				{
					x:view.canvas.width-0.5,
					y:j + (view.movementOffset.y % view.scale)
				},
				'rgba(200,200,200,1)'
			);
		}
	}
	// Draw pixels.
	if (image && image.map){
		for (k=0;k<image.map.length;k++){
			view.drawPixel({
				x: (image.origin.x + image.map[k].x)*view.scale - view.topLeft.x,
				y: (image.origin.y + image.map[k].y)*view.scale - view.topLeft.y,
				colour: image.map[k].colour});
		}
	}
};
view.drawLine = function(start,end,colour){
	view.ctx.strokeStyle = colour;
	view.ctx.beginPath();
	view.ctx.moveTo(start.x, start.y);
	view.ctx.lineTo(end.x,end.y);
	view.ctx.closePath();
	view.ctx.stroke();
};
view.drawClick = function(event){

	// Coordinates of click.
	var click = {
		x: event.clientX - view.movementOffset.x, 
		y: event.clientY - view.movementOffset.y
	};
	// Top left corner of pixel square.
	var pix = {
		x: Math.floor(click.x/view.scale)*view.scale - view.topLeft.x,
		y: Math.floor(click.y/view.scale)*view.scale - view.topLeft.y
	};
	var coord;

	// If no pixels have been drawn, the origin becomes
	// x: nth pixel from left
	// y: mth pixel from top
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
		if (image.topLeft.x > coord.x) image.topLeft.x = coord.x;
		if (image.topLeft.y > coord.y) image.topLeft.y = coord.y;
		if (image.bottomRight.x < coord.x) image.bottomRight.x = coord.x;
		if (image.bottomRight.y < coord.y) image.bottomRight.y = coord.y;
		view.drawPixel(pix);
	}
}	

view.move = function(event){
	if (mouse.moving == "grid"){
		// Move the view!
		view.movementOffset.x += event.clientX - mouse.position.x;
		view.movementOffset.y += event.clientY - mouse.position.y;
		view.draw();
		
		mouse.position = {x: event.clientX, y: event.clientY};
	}
}
view.erase = function(event){
	// Coordinates of click.
	var click = {
		x: event.clientX - view.movementOffset.x, 
		y: event.clientY - view.movementOffset.y
	};
	// Top left corner of pixel square.
	var pix = {	x: Math.floor(click.x/view.scale)*view.scale,
				y: Math.floor(click.y/view.scale)*view.scale};
	coord = {
		x: Math.floor((click.x-(image.origin.x*view.scale))/view.scale),
		y: Math.floor((click.y-(image.origin.y*view.scale))/view.scale)
	};
	
	// Reset the corner finder, as we are about to re-search for corners.
	image.topLeft = {x: 1, y: 1};
	image.bottomRight = {x: 0, y: 0};
		
	
	for (i=0;i<image.map.length;i++){
		if (image.map[i].x == coord.x && image.map[i].y == coord.y){
			image.map.splice(i,1);	
			view.clearPixel(pix);
		} else {
			if (image.topLeft.x > image.map[i].x) image.topLeft.x = image.map[i].x;
			if (image.topLeft.y > image.map[i].y) image.topLeft.y = image.map[i].y;
			if (image.bottomRight.x < image.map[i].x) image.bottomRight.x = image.map[i].x;
			if (image.bottomRight.y < image.map[i].y) image.bottomRight.y = image.map[i].y;
		}
	}
}

view.drawPixel = function(pix){
	view.ctx.fillStyle = pix.colour;
	var grid = 1;
	// Draw pixel inside the grid bounds (1 pixel inside).
	if (view.grid == false) grid = 0;
	view.ctx.fillRect(
		pix.x + view.movementOffset.x, pix.y + view.movementOffset.y, 
		view.scale-grid, view.scale-grid
	);
}	
view.clearPixel = function(pix){
	var offset = 1
	if (view.grid == false) offset = 0;
	// Erase pixel, not grid.
	view.ctx.clearRect(
		pix.x + view.movementOffset.x, pix.y + view.movementOffset.y, 
		view.scale-offset, view.scale-offset
	);
}

view.share = function(){
	var size = {
		x: image.bottomRight.x - image.topLeft.x + 1,
		y: image.bottomRight.y - image.topLeft.y + 1
	};
	if (view.sharing){
		console.log((image.origin.x + image.topLeft.x) * view.scale);
		view.canvas.width = size.x*view.scale;
		view.canvas.height = size.y*view.scale;
		$('#pixdraw').css({
			'top':50,'left':150,
			'position':'absolute','border':'1px solid black'
		});
		
		view.topLeft = {
			x: (image.origin.x+ image.topLeft.x) * view.scale,
			y: (image.origin.y+ image.topLeft.y) * view.scale
		};
	} else {
		view.canvas.width = view.width;
		view.canvas.height = view.height;
		$('#pixdraw').css({
			'top':0,'left':0,
			'position':'absolute','border':0
		});
		view.topLeft = {x:0,y:0};
	}
	view.draw();
	//window.location = view.canvas.toDataURL("image/png");
}

view.draw();


// This enables you to draw in the background colour without the 
// context menu getting in the way when you right-click.
$("#pixdraw").bind("contextmenu", function(e) {
    return false;
});

// Colour picker!
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



// Mousedown bindings.
$('#share').mousedown(function(){view.sharing = !view.sharing; view.share()});
$('#mover').mousedown(function(){view.mode = "move";});
$('#drawer').mousedown(function(){view.mode = "draw";});
$('#eraser').mousedown(function(){view.mode = "erase";});
$('#toggle-grid').mousedown(function(){view.grid = !view.grid; view.draw();});
$('#pixdraw').mousedown(function(event){
	mouse.position = {x: event.clientX, y: event.clientY};
	console.log(mouse.position.x, mouse.position.y);
	mouse.down = true;
	mouse.button = event.which;
	mouse.moving = "grid";
	if (view.mode == "draw"){
		view.drawClick(event);
	} else if (view.mode == "move"){
		view.move(event);
	} else if (view.mode == "erase"){
		view.erase(event);
	};
});
$('#palette').mousedown(function(event){
	mouse.position = {x: event.clientX, y: event.clientY};
	mouse.down = true;
	if (view.mode == "move"){
		mouse.moving = "palette";
	}
	
});

// Mouseup bindings.
$('#pixdraw').mouseup(function(){
	mouse.down = false;
	mouse.button = false;
	mouse.moving = false;
});
$('#palette').mouseup(function(){
	mouse.down = false;	
	mouse.moving = false;
});

// Mousemove binding.
$(window).mousemove(function(event){

	if (mouse.down){
	

		if (view.mode === "move"){
			if (mouse.moving === "palette"){
				view.palette.x+= event.clientX - mouse.position.x;
				view.palette.y+= event.clientY - mouse.position.y;
			
				mouse.position = {x: event.clientX, y: event.clientY};
			
				$('#palette').css({'top': view.palette.y, 'left': view.palette.x});
			}
			if (mouse.moving === "grid"){	
				view.move(event);
			}
		}
		
		
		if (view.mode === "draw"){
			if (mouse.moving === "grid"){
				view.drawClick(event);
				mouse.position = {x: event.clientX, y: event.clientY};
			}
		}
		
		
		if (view.mode == "erase"){
			if (mouse.moving === "grid"){
				view.erase(event);
			}
		}
	
	}

});

// Mousewheel binding.
$("#pixdraw").bind('mousewheel', function(event, delta) {
// Determine which way the mouse wheel spun, and scale the page.
	if (delta > 0){
		if (view.scale<100) view.scale++;
	} else if (delta < 0){
		if (view.scale>1) view.scale--;
	}

	view.ctx.clearRect(0,0,view.canvas.width,view.canvas.height);
	view.draw();
});

// Resize binding.
$(window).resize(function(){
	view.width = $(window).width();
	view.height = $(window).height();
	view.canvas.width = view.width-1;
	view.canvas.height = view.height-5;
	view.draw();
});
