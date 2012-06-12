var mouseDown;
var mouseButton; // 1 is left, 3 is right (2 is middle).

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var view = new function(){
	this.scale = 25;
	this.canvas = document.getElementById('pixdraw');
	this.width = $(window).width();
	this.height = $(window).height();
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
	this.palette.backColour = "rgba(0,0,0,0.2)";
	this.palette.foreColour = "rgba(255,0,0,0.2)";
	this.palette.mode = "draw";
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
	
	this.drawClick = function drawClick(event){
		var click = { x: event.clientX, y: event.clientY };
		// Top left corner of pixel square.
		var pix = {	x: Math.floor(click.x/view.scale)*view.scale,
					y: Math.floor(click.y/view.scale)*view.scale};

		if (view.palette.mode === "draw"){

			// If no pixels have been drawn, this is the origin.
			if (!image.map[0]){
				image.origin.x = Math.floor(pix.x/view.scale);
				image.origin.y = Math.floor(pix.y/view.scale);
			}

			var coord = {	x: Math.floor((click.x-(image.origin.x*view.scale))/view.scale),
							y: Math.floor((click.y-(image.origin.y*view.scale))/view.scale),
							exists: false};
			
			if (mouseButton === 1){
				pix.colour = view.palette.foreColour;
			} else if (mouseButton === 3){
				pix.colour = view.palette.backColour;
			}

			// Add pixel to the map.
			for (i=0;i<image.map.length;i++){
				if (image.map[i].x == coord.x && image.map[i].y == coord.y){
					// If the new pixel is a different colour than the old one, remove the old one.
					if (image.map[i].colour != pix.colour){
						image.map.splice(i,1);
					} else {
						coord.exists = true;
					}
				}
			}
			if (coord.exists == false){
				image.map.push({ x: coord.x, y: coord.y, colour: pix.colour });

				// Draw pixel inside the grid bounds (1 pixel inside).
				view.ctx.fillStyle = pix.colour;
				view.ctx.fillRect(
					pix.x,
					pix.y,
					view.scale-1,
					view.scale-1);
			}
		} else if (view.palette.mode === "move"){
	
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

// This enables you to draw in the background colour without the context menu getting in the way when you right-click.
$("#pixdraw").bind("contextmenu", function(e) {
    return false;
});


$('#pixdraw').mousedown(function(event){
	mouseDown = true;
	mouseButton = event.which;
	view.drawClick(event);
});

$('#pixdraw').mouseup(function(){
	mouseDown = false;
	mouseButton = false;
});

$('#pixdraw').mousemove(function(event){
	if (mouseDown === true){
		view.drawClick(event);
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
