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
	this.palette.width = 201;
	this.palette.height = 401;
	this.palette.ctx = this.palette.getContext('2d');
	this.palette.x = 49;
	this.palette.y = 49;
	$(this.palette).css('top', this.palette.x);
	$(this.palette).css('left', this.palette.y);
	this.palette.bgcolour = "#FFFFFF";
	this.palette.currentColour = "#0099FF";
	this.palette.tiles = new Array;
	this.palette.tiles.push(new box(
		5,
		5,
		25,
		25,
		"#FF0000"));
	this.palette.tiles.push(new box(
		5,
		35,
		25,
		25,
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
	
	this.palette.draw = function paletteDraw(){
		
		
		// Draw palette background.
		view.palette.ctx.fillStyle = view.palette.bgcolour;
		view.palette.ctx.fillRect(
			0,
			0,
			view.palette.width,
			view.palette.height);
		
		// Draw black border.	
		view.palette.ctx.strokeStyle = "#000000";
		view.palette.ctx.strokeRect(
			0.5,
			0.5,
			view.palette.width-1,
			view.palette.height-1);
		
		
		// Draw palette tiles.
		
		for (m=0;m<view.palette.tiles.length;m++){
			currentTile = view.palette.tiles[m];
			// Draw rectangular bound.
			view.palette.ctx.strokeStyle = "#000000";
			view.palette.ctx.strokeRect(
				currentTile.x + 0.5,
				currentTile.y + 0.5,
				currentTile.width,
				currentTile.height);
			// Fill with shade.
			view.palette.ctx.fillStyle = currentTile.colour;
			view.palette.ctx.fillRect(
				currentTile.x +1,
				currentTile.y + 1,
				currentTile.width-1,
				currentTile.height-1);	
		}	
	}
}
view.draw();
view.palette.draw();

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

$('#pixdraw').mousedown(function(event){

	// Click event location.
	var click = {};
	click.x = event.clientX;
	click.y = event.clientY;
	
	// Top left corner of pixel square.
	var pix = {};
	pix.x = Math.floor(click.x/view.scale)*view.scale;
	pix.y = Math.floor(click.y/view.scale)*view.scale;
	pix.width = view.scale;
	pix.height = view.scale;

	// If no pixels have been drawn, this is the origin.
	if (!image.map[0]){
		image.origin.x = Math.floor(pix.x/view.scale);
		image.origin.y = Math.floor(pix.y/view.scale);
	}

	// Add pixel to the map.
	image.map.push(new pixel(
		Math.floor((click.x-(image.origin.x*view.scale))/view.scale),
		Math.floor((click.y-(image.origin.y*view.scale))/view.scale),
		view.palette.currentColour));
	
	// Draw pixel inside the grid bounds (1 pixel inside).
	view.ctx.fillStyle = view.palette.currentColour;
	view.ctx.fillRect(
		pix.x,
		pix.y,
		view.scale-1,
		view.scale-1);	
});

$('#palette').mousedown(function(event){
	console.log(event);
	var click = {}
	click.x = event.offsetX;
	click.y = event.offsetY;
	
	for (i=0;i<view.palette.tiles.length;i++){
		if (isIn(click, view.palette.tiles[i])){
			view.palette.currentColour = view.palette.tiles[i].colour;
		}
	}
		
});

$('#colourpicker').CanvasColorPicker({flat: true});

$(window).resize(function(){
	view.width = $(window).width();
	view.height = $(window).height();
	view.canvas.width = view.width-1;
	view.canvas.height = view.height-5;
	view.draw();
});
