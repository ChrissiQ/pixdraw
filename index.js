var mouseDown;
var mouseButton;

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function pixel(x,y,colour){
	this.x = x ? x : 0;
	this.y = y ? y : 0;
	this.colour = colour ? colour : "#0099FF";
}

function box(x,y,width,height,colour){
	this.x = x ? x : 0;
	this.y = y ? y : 0;
	this.width = width ? width : 0;
	this.height = height ? height : 0;
	this.colour = colour ? colour : "#FFFFFF";
}

// Assumes two boxes, or item1 a coordinate and item2 a box.
// Takes a item1 and compares it to an item with x/y and width/height.
// Checks if item1 is inside item2.
// This is sugar - makes the rest of the code more readable.
function isIn(item1,item2){
	
	// If item1 is a box (if it has width and height).
	if (item1.x && item1.y && item1.width && item1.height){
		
				// If the top left corner is inside
		if ( 	(	item1.x > item2.x && 
					item1.y > item2.y &&
					item1.x < item2.x + item2.width && 
					item1.y < item2.y + item2.height) ||
		
				// Or the top right corner is inside
				(	item1.x + item1.width > item2.x && 
					item1.y > item2.y &&
					item1.x + item1.width < item2.x + item2.width &&
					item1.y < item2.y + item2.height) ||
					
				// Or the bottom left corner is inside
				(	item1.x > item2.x && 
					item1.y + item1.height > item2.y &&
					item1.x < item2.x + item2.width &&
					item1.y + item1.height < item2.y + item2.height) ||
					
				// Or the bottom right corner is inside
				(	item1.x + item1.width > item2.x &&
					item1.y + item1.height > item2.y &&
					item1.x + item1.width < item2.x + item2.width &&
					item1.y + item1.height < item2.y + item2.height)){
					
			return true;
		} else {
			return false;
		}
		
	// If item1 is not a box, but a coordinate.
	} else if (item1.x && item1.y){
	
		// Check whether the coordinate is inside the item2.
		if (	item1.x > item2.x && 
				item1.y > item2.y && 
				item1.x < item2.x + item2.width &&
				item1.y < item2.y + item2.height){
			return true;
		} else {
			return false;
		}
	
	// If it's neither, oops!
	} else {
		return null;
	}
}


var view = new function(){
	this.scale = 25;
	this.width = $(window).width();
	this.height = $(window).height();
	this.canvas = document.getElementById('pixdraw');
	this.canvas.width = this.width-1;
	this.canvas.height = this.height-5;
	this.ctx = this.canvas.getContext('2d');
	this.ctx.strokeStyle="#888888";
	
	this.grid = {};
	this.grid.origin = {};
	
	
	// Palette.
	this.palette = document.getElementById('palette');
	this.palette.width = 61;
	this.palette.height = 401;
	this.palette.x = 49;
	this.palette.y = 49;
	$(this.palette).css('top', this.palette.x);
	$(this.palette).css('left', this.palette.y);
	this.palette.backColour = "#FFFFFF";
	this.palette.foreColour = "#0000FF";
	this.palette.tiles = new Array;
	this.palette.mode = "draw";
	this.palette.tiles.push(new box(
		5,
		5,
		50,
		50,
		"#FF0000"));
	this.palette.tiles.push(new box(
		5,
		55,
		50,
		50,
		"#0099FF"));
	
	this.draw = function draw(){	

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
				view.ctx.fillStyle = image.map[k].colour;
				view.ctx.fillRect((image.origin.x + image.map[k].x)*view.scale,
					(image.origin.y + image.map[k].y)*view.scale,
					view.scale - 1,
					view.scale - 1)
			}
		}
	}
}
view.draw();

var image = new function(){
	this.map = new Array;
	this.origin = {};
}

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

$("#pixdraw").bind("contextmenu", function(e) {
    return false;
});


$('#pixdraw').mousedown(function(event){
	mouseDown = true;
	mouseButton = event.which;
	// Click event location.
	var click = {};
	click.x = event.clientX;
	click.y = event.clientY;
	// Top left corner of pixel square.
	var pix = {};
	pix.x = Math.floor(click.x/view.scale)*view.scale;
	pix.y = Math.floor(click.y/view.scale)*view.scale;

	if (view.palette.mode === "draw"){

		// If no pixels have been drawn, this is the origin.
		if (!image.map[0]){
			image.origin.x = Math.floor(pix.x/view.scale);
			image.origin.y = Math.floor(pix.y/view.scale);
		}
		if (mouseButton === 1){
			pix.colour = view.palette.foreColour;
		} else if (mouseButton === 3){
			pix.colour = view.palette.backColour;
		}

		// Add pixel to the map.
		image.map.push(new pixel(
			Math.floor((click.x-(image.origin.x*view.scale))/view.scale),
			Math.floor((click.y-(image.origin.y*view.scale))/view.scale),
			pix.colour));

		// Draw pixel inside the grid bounds (1 pixel inside).
		view.ctx.fillStyle = pix.colour;
		view.ctx.fillRect(
			pix.x,
			pix.y,
			view.scale-1,
			view.scale-1);
	} else if (view.palette.mode === "move"){
	
	}

});

$('#pixdraw').mouseup(function(){
	mouseDown = false;
	mouseButton = false;
});

$('#pixdraw').mousemove(function(event){
	if (mouseDown === true){
		// Click event location.
		var click = {};
		click.x = event.clientX;
		click.y = event.clientY;
		// Top left corner of pixel square.
		var pix = {};
		pix.x = Math.floor(click.x/view.scale)*view.scale;
		pix.y = Math.floor(click.y/view.scale)*view.scale;

		if (view.palette.mode === "draw"){

			// If no pixels have been drawn, this is the origin.
			if (!image.map[0]){
				image.origin.x = Math.floor(pix.x/view.scale);
				image.origin.y = Math.floor(pix.y/view.scale);
			}
			if (mouseButton === 1){
				pix.colour = view.palette.foreColour;
			} else if (mouseButton === 3){
				pix.colour = view.palette.backColour;
			}

			// Add pixel to the map.
			image.map.push(new pixel(
				Math.floor((click.x-(image.origin.x*view.scale))/view.scale),
				Math.floor((click.y-(image.origin.y*view.scale))/view.scale),
				pix.colour));

			// Draw pixel inside the grid bounds (1 pixel inside).
			view.ctx.fillStyle = pix.colour;
			view.ctx.fillRect(
				pix.x,
				pix.y,
				view.scale-1,
				view.scale-1);
		} else if (view.palette.mode === "move"){
	
		}

	}
});

$('#mover').mousedown(function(){

	view.palette.mode = "move";

});

$('#drawer').mousedown(function(){

	view.palette.mode = "draw";
	
});

$('#fore').CanvasColorPicker({onColorChange: function(RGB, HSB){
	  // RGB, current color in rgb format: {r,g,b}
      // HSB: current color in hsb format: {h,s,b}
      view.palette.foreColour = rgbToHex(RGB.r,RGB.g,RGB.b);
      
}});

$('#back').CanvasColorPicker({onColorChange: function(RGB, HSB){
	  // RGB, current color in rgb format: {r,g,b}
      // HSB: current color in hsb format: {h,s,b}
      view.palette.backColour = rgbToHex(RGB.r,RGB.g,RGB.b);
}});

$(window).resize(function(){
	view.width = $(window).width();
	view.height = $(window).height();
	view.canvas.width = view.width-1;
	view.canvas.height = view.height-5;
	view.draw();
});
