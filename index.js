// Helper function that converts an object with r,g,b,a properties to a string
// of rgba(r,g,b,a) format
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
// Can handle objects or strings of rgba.
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
// Current status of the mouse.  Only updated when needed.
var mouse = {
	down: false,
	button: 0,
	moving: false,
	position: {}
};

// Holds data about the image being constructed by the user.
var image = {
	map: [], 
	buffer: [],
	stateLog: [],
	state: -1,
	origin: {}, 
	topLeft: {x: 1, y: 1}, 
	bottomRight: {x: 0, y: 0}
};


// Takes a pixel object with properties x, y, colour and undoColour.
image.addToStateLog = function(pixel){
	var existsInCurrentState = false;
	// If the state is empty, prep it for adding pixels.
	if (!image.stateLog[image.state]) {
		image.stateLog[image.state] = [];
		
	// If it is not empty, check if it already exists and just change colour if so.
	} else {
		for (var j=0;j<image.stateLog[image.state].length;j++){
			if (
				image.stateLog[image.state][j].x == pixel.x && 
				image.stateLog[image.state][j].y == pixel.y
			){
				existsInCurrentState = true;	
						
				// If the pixel colour is false, erase it.
				if (pixel.colour === false){
					image.stateLog[image.state][j].colour = false;			
				// If the pixel has a colour, combine with previous colour.
				} else {
					image.stateLog[image.state][j].colour = 
						aOverB(pixel.colour, image.stateLog[image.state][j].colour);
				}
	
				image.stateLog[image.state][j].undoColour = pixel.undoColour;
				break;
			}
		}
	}
	
	// If it does not exist yet, add it.
	if (!existsInCurrentState) {
		image.stateLog[image.state].push({
			"x": pixel.x, "y": pixel.y, 
			"colour": pixel.colour, "undoColour": pixel.undoColour
		});
	}
};

image.undo = function(){
	// For each pixel in the current state,
	for (var i=0;i<image.stateLog[image.state].length;i++){
		
		var mapElement = image.existsIn(image.stateLog[image.state][i], image.map);
		
		// If it doesn't exist, add a new one.
		if (mapElement === -1){
			if (image.stateLog[image.state][i].undoColour != false){
				image.map.push({
					"x": image.stateLog[image.state][i].x,
					"y": image.stateLog[image.state][i].y,
					"colour": image.stateLog[image.state][i].undoColour
				});
				view.drawPixel(image.map[image.map.length-1]);
			}
			
		// If the pixel can be found on the map
		} else {
			// If the colour was changed, change it on the map.
			if (image.stateLog[image.state][i].undoColour){
				image.map[mapElement].colour = image.stateLog[image.state][i].undoColour;
				view.clearPixel(image.map[mapElement]);
				view.drawPixel(image.map[mapElement]);
				
			// If it was erased, erase it on the map.
			} else {
				view.clearPixel({"x": image.map[mapElement].x, "y": image.map[mapElement].y});
				image.map.splice(mapElement,1);
			}
		}
	}
}

image.redo = function(){
	// For each pixel in the current state
	for (var i=0;i<image.stateLog[image.state].length;i++){
	
		var mapElement = image.existsIn(image.stateLog[image.state][i], image.map);
		
		// If the pixel is already on the map, just modify it.
		if (mapElement != -1){
		
			image.map[mapElement].colour = image.stateLog[image.state][i].colour;
			
		// If the pixel is not on the map, add it.
		} else {
			image.map.push({
				"x": image.stateLog[image.state][i].x,
				"y": image.stateLog[image.state][i].y,
				"colour": image.stateLog[image.state][i].colour
			});
			mapElement = image.map.length-1;
		}
		
		view.clearPixel(image.map[mapElement]);
		view.drawPixel(image.map[mapElement]);
		
	}
}

image.existsIn = function(pixel, array){
	for (var element in array){
		if (array[element].x === pixel.x && array[element].y === pixel.y){
			return element;
		}
	}
	// Return -1 if not found in array
	return -1;
}
image.addBufferToMap = function(){

	for (var i=0; i<image.buffer.length; i++){
		var mapElement = image.existsIn({"x": image.buffer[i].x, "y": image.buffer[i].y}, image.map);
		var undoColour;	
		// If the pixel doesn't exist on the map, push it to the map.
		if (mapElement === -1){
			undoColour = false;
			image.map.push({
				"x": image.buffer[i].x,
				"y": image.buffer[i].y,
				"colour": image.buffer[i].colour
			});
			
		// If it does exist, change the colour.
		} else {
			undoColour = image.map[mapElement].colour;
			image.map[mapElement].colour = aOverB(image.buffer[i].colour, image.map[mapElement].colour);
		};
		
		// In all cases, add it to the state log.
		image.addToStateLog({
			"x": image.buffer[i].x,
			"y": image.buffer[i].y,
			"colour": image.buffer[i].colour,
			"undoColour": undoColour
		});
	}
	image.buffer = [];
}


image.addPixelToBuffer = function(pixel){
	var pixelInBuffer = image.existsIn(pixel, image.buffer);
	if (pixelInBuffer >= 0){
		image.buffer[pixelInBuffer].colour = 
			aOverB(pixel.colour, image.buffer[pixelInBuffer].colour);
	} else {
		image.buffer.push(pixel);
	}
}
	
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
	toolbar: {
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

// Set the size of the toolbar element.  Again, literally.
view.toolbar.elem = document.getElementById('toolbar');
view.toolbar.elem.width = 61;
view.toolbar.elem.height = 401;

// Set the location of the toolbar element... literally.  Like on the page.
$(view.toolbar.elem).css('top', view.toolbar.x);
$(view.toolbar.elem).css('left', view.toolbar.y);

view.redraw = function(){	
	view.ctx.clearRect(0,0,view.width, view.height);

	if (view.grid){
	
		// Draw grid: vertical lines
		for (var i=-0.5;i<view.canvas.width-0.5;i+=view.scale){
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
		for (var j=-0.5;j<view.canvas.height-0.5;j+=view.scale){
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
	// Draw pixels from map.
	if (image && image.map){
		for (var k=0;k<image.map.length;k++){
			view.drawPixel(image.map[k]);
		}
	}
	// Draw pixels from buffer.
	if (image.buffer){
		for (var m=0;m<image.buffer.length;m++){
			view.drawPixel(image.buffer[m]);
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

view.draw = function(event){
	// Round down, then multiply back up to find the screen coordinates of the box.
	var clickBox = {
		"x": 
			Math.floor(
				(event.pageX - view.movementOffset.x)/view.scale
			) * view.scale 
			- view.topLeft.x,
		"y": 
			Math.floor(
				(event.pageY - view.movementOffset.y)/view.scale
			) * view.scale 
			- view.topLeft.y
	};

	// If no pixels have been drawn, the origin becomes the location of this box,
	// relative to the rest of the boxes on the screen.
	if (!image.origin.x){
		image.origin = {
			"x": Math.floor(clickBox.x/view.scale),
			"y": Math.floor(clickBox.y/view.scale)
		};
	}
	
	// After origin is found, we can find out what coord the pixel has.
	var pixel = {
		"x": 
			Math.floor(
				(
					(event.pageX - view.movementOffset.x) 
					- (image.origin.x * view.scale)
				) / view.scale
			),
		"y": 
			Math.floor(
				(
					(event.pageY - view.movementOffset.y) 
					- (image.origin.y * view.scale)
				) / view.scale
			)
	};

	// We have two drawing colours depending on mouse button.
	if (view.mode === "draw"){
		if (mouse.button === 1){
			pixel.colour = view.toolbar.foreColour;
		} else if (mouse.button === 3){
			pixel.colour = view.toolbar.backColour;
		}
	} else if (view.mode === "erase"){
		pixel.colour = false;
	}
	
	// Add the pixel to the buffer, then draw it.
	image.addPixelToBuffer({"x": pixel.x, "y": pixel.y, "colour": pixel.colour});
	view.drawPixel(pixel);
}

view.move = function(event){
	if (mouse.moving === "grid"){
		// Move the view!
		view.movementOffset.x += event.clientX - mouse.position.x;
		view.movementOffset.y += event.clientY - mouse.position.y;
		view.redraw();
		
		mouse.position = {x: event.clientX, y: event.clientY};
	}
}
view.drawPixel = function(pixel){
	if (pixel.colour === false){
		view.clearPixel(pixel);
	} else {
		view.ctx.fillStyle = pixel.colour;
		var grid = 1;
		if (view.grid == false) grid = 0;
		view.ctx.fillRect(
			(image.origin.x + pixel.x)*view.scale - view.topLeft.x  + view.movementOffset.x,
			(image.origin.y + pixel.y)*view.scale - view.topLeft.y + view.movementOffset.y,
			view.scale-grid, view.scale-grid
		);
	}
}
view.clearPixel = function(pixel){
	var grid = 1
	if (view.grid == false) grid = 0;
	view.ctx.clearRect(
		(image.origin.x + pixel.x)*view.scale - view.topLeft.x  + view.movementOffset.x,
		(image.origin.y + pixel.y)*view.scale - view.topLeft.y + view.movementOffset.y,
		view.scale-grid, view.scale-grid
	);
}
view.share = function(){

	// Reset the corner finder, as we are about to re-search for corners.
	image.topLeft = {x: 1, y: 1};
	image.bottomRight = {x: 0, y: 0};
	for (var i=0;i<image.map.length;i++){
		if (image.topLeft.x > image.map[i].x) image.topLeft.x = image.map[i].x;
		if (image.topLeft.y > image.map[i].y) image.topLeft.y = image.map[i].y;
		if (image.bottomRight.x < image.map[i].x) image.bottomRight.x = image.map[i].x;
		if (image.bottomRight.y < image.map[i].y) image.bottomRight.y = image.map[i].y;
	}
	
	// Find the size of the image so we can crop to it.
	var size = {
		x: image.bottomRight.x - image.topLeft.x + 1,
		y: image.bottomRight.y - image.topLeft.y + 1
	};
	if (view.sharing){
		$('body').append('<div id="dimmer"></div>');
		$('div#dimmer').css({'width': view.width, 'height': view.height});
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
		view.width = $(window).width();
		view.height = $(window).height();
		view.canvas.width = view.width-1;
		view.canvas.height = view.height-5;
		view.redraw();
		$('#pixdraw').css({
			'top':0,'left':0,
			'position':'absolute','border':0
		});
		view.topLeft = {x:0,y:0};
		$('div#dimmer').remove();
	}
	view.redraw();
	/*if (view.sharing){
		share.upload(view.canvas.toDataURL('image/png').split(',')[1]);
	}*/
}

share = {
	upload: function(image){
	
	 $.ajax({
        url: 'http://api.imgur.com/2/upload.json',
        type: 'POST',
        data: {
        	type: 'image/png;base64',
            key: '24d00bbfcd3d433095c97d48a4b10ebd',
            name: 'neon.jpg',
            title: 'test title',
            caption: 'test caption',
            'image': image
        },
        dataType: 'json'
    }).success(function(data) {
    	console.log(data);
    }).error(function(data) {
        console.log(data);
    });
	}
}

view.redraw();


// This enables you to draw in the background colour without the 
// context menu getting in the way when you right-click.
$("#pixdraw").bind("contextmenu", function(e) {
    return false;
});

// Colour picker!
$('#fore').css({'background-color': view.toolbar.foreColour});
$('#back').css({'background-color': view.toolbar.backColour});

$('#fore').colorpicker({format: 'rgba'}).on('changeColor', function(event){
	view.toolbar.foreColour = objToRGBA(event.color.toRGB());
	$('#fore').css({'background-color': objToRGBA(event.color.toRGB())});
});

$('#back').colorpicker({format: 'rgba'}).on('changeColor', function(event){
	view.toolbar.backColour = objToRGBA(event.color.toRGB());
	$('#back').css({'background-color': objToRGBA(event.color.toRGB())});
});



// Mousedown bindings.

$('#share').mousedown(function(){
	view.sharing = !view.sharing; 
	view.share();
});

$('#mover').mousedown(function(){view.mode = "move";});
$('#drawer').mousedown(function(){view.mode = "draw";});
$('#eraser').mousedown(function(){view.mode = "erase";});
$('#toggle-grid').mousedown(function(){view.grid = !view.grid; view.redraw();});

$('#pixdraw').mousedown(function(event){
	mouse.position = {x: event.clientX, y: event.clientY};
	mouse.down = true;
	mouse.button = event.which;
	mouse.moving = "grid";
	
	if (view.mode === "move"){
		view.move(event);
	} else if (view.mode === "draw" || view.mode === "erase"){	
		view.draw(event);
	}
	/*
	if (view.mode == "draw"){
		image.state++;
		view.drawClick(event);
	} else if (view.mode == "move"){
		view.move(event);
	} else if (view.mode == "erase"){
		image.state++;
		view.erase(event);
	};
	*/
});
$('#toolbar').mousedown(function(event){
	mouse.position = {x: event.clientX, y: event.clientY};
	mouse.down = true;
	if (view.mode == "move"){
		mouse.moving = "toolbar";
	}
	
});
$('#undo').mousedown(function(event){
	if (image.state >= 0) {
		image.undo();
		image.state--;
	}
});

$('#redo').mousedown(function(event){
	if (image.state < image.stateLog.length-1){
		image.state++;
		image.redo();
	}
});

// Mouseup bindings.
$('#pixdraw').mouseup(function(){
	mouse.down = false;
	mouse.button = false;
	mouse.moving = false;
	if (view.mode === "draw" || view.mode === "erase"){
		image.stateLog = image.stateLog.slice(0, image.state+1);
		image.state++;
		image.addBufferToMap();
	}
	
});
$('#toolbar').mouseup(function(){
	mouse.down = false;	
	mouse.moving = false;
	
});

// Mousemove binding.
$(window).mousemove(function(event){

	if (mouse.down === true){
	

		if (view.mode === "move"){
			if (mouse.moving === "toolbar"){
				view.toolbar.x+= event.clientX - mouse.position.x;
				view.toolbar.y+= event.clientY - mouse.position.y;
			
				mouse.position = {x: event.clientX, y: event.clientY};
			
				$('#toolbar').css({'top': view.toolbar.y, 'left': view.toolbar.x});
			}
			if (mouse.moving === "grid"){	
				view.move(event);
			}
		}
		
		
		if (view.mode === "draw" || view.mode === "erase"){
			if (mouse.moving === "grid"){
				view.draw(event);
				mouse.position = {x: event.clientX, y: event.clientY};
			}
		}
	
	}

});

// Mousewheel binding.
$("#pixdraw").bind('mousewheel', function(event, delta) {
// Determine which way the mouse wheel spun, and scale the page.
	if (!view.sharing){
		if (delta > 0){
			if (view.scale<100) view.scale++;
		} else if (delta < 0){
			if (view.scale>1) view.scale--;
		}

		view.ctx.clearRect(0,0,view.canvas.width,view.canvas.height);
		view.redraw();
	}
});

// Resize binding.
$(window).resize(function(){
	if (!view.sharing){
		view.width = $(window).width();
		view.height = $(window).height();
		view.canvas.width = view.width-1;
		view.canvas.height = view.height-5;
		view.redraw();
	}
});
