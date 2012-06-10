function pixel(x,y,colour){
	this.x = x ? x : 0;
	this.y = y ? y : 0;
	this.colour = colour ? colour : "#0099FF";
	
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
		
		// Draw palette
		this.palette = {};
		this.palette.x = 50;
		this.palette.y = 50;
		this.palette.width = 200;
		this.palette.height = 400;
		this.palette.bgcolour = "#FFFFFF";
		view.ctx.fillStyle = "#FFFFFF";
		view.ctx.fillRect(50,50,200,400);
		view.ctx.strokeStyle = "#000000";
		view.ctx.strokeRect(49.5,49.5,200,400);
		
		
	}
}
view.draw();

var image = new function(){
	this.map = new Array;
	this.origin = {};
}

$(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
// Determine which way the mouse wheel spun, and scale the page.
	if (event.wheelDelta > 0){
		if (view.scale<100) view.scale++;
		if (view.scale > 6) view.ctx.strokeStyle = "#AAAAAA";
		if (view.scale > 10) view.ctx.strokeStyle="#888888";
	} else if (event.wheelDelta < 0){
		if (view.scale>5) view.scale--;
		if (view.scale<10) view.ctx.strokeStyle="#AAAAAA";
		if (view.scale == 5) view.ctx.strokeStyle="#DDDDDD";
	}

	view.ctx.clearRect(0,0,view.canvas.width,view.canvas.height);
	view.draw();
});

$(document).mousedown(function(event){

	// Click event location.
	clickX = event.clientX;
	clickY = event.clientY;
	
	// Top left corner of pixel square.
	pixelX = Math.floor(clickX/view.scale)*view.scale;
	pixelY = Math.floor(clickY/view.scale)*view.scale;
	
	// If we are inside the palette box...
	
	
	
		
	// If no pixels have been drawn, this is the origin.
	if (!image.map[0]){
		image.origin.x = Math.floor(pixelX/view.scale);
		image.origin.y = Math.floor(pixelY/view.scale);
	}
	
	// Add pixel to the map.
	image.map.push(new pixel(
		Math.floor((clickX-(image.origin.x*view.scale))/view.scale),
		Math.floor((clickY-(image.origin.y*view.scale))/view.scale),
		"#0099FF"));
	
	// Draw pixel inside the grid bounds (1 pixel inside).
	view.ctx.fillStyle = "#0099FF";
	view.ctx.fillRect(
		pixelX,
		pixelY,
		view.scale-1,
		view.scale-1);	
});

$(window).resize(function(){
	view.width = $(window).width();
	view.height = $(window).height();
	view.canvas.width = view.width-1;
	view.canvas.height = view.height-5;
	view.draw();
});
