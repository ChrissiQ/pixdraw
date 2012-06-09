scale = 25;
width = $(window).width();
height = $(window).height();

var image = new function(){
	this.map = new Array();
	this.width = Math.floor(width/scale);
	this.height = Math.floor(height/scale);
}

canvas = document.getElementById('pixdraw');
canvas.width = width;
canvas.height = height;
ctx = canvas.getContext('2d');
for (i=0.5;i<width-0.5;i+=scale){
	console.log(i);
	ctx.beginPath();
	ctx.moveTo(i,0.5);
	ctx.lineTo(i,height-0.5);
	ctx.closePath();
	ctx.stroke();
}

$(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
// Determine which way the mouse wheel spun, and scale the page.
	if (event.wheelDelta > 0){
		if (scale<100) scale++;
		if (scale > 6) ctx.strokeStyle = "#999999";
		if (scale > 10) ctx.strokeStyle="#000000";
	} else if (event.wheelDelta < 0){
		if (scale>5) scale--;
		if (scale<10) ctx.strokeStyle="#999999";
		if (scale == 5) ctx.strokeStyle="#DDDDDD";
	}

	ctx.clearRect(0,0,canvas.width,canvas.height);
	for (i=0.5;i<width-0.5;i+=scale){
		ctx.beginPath()
		ctx.moveTo(i,0.5);
		ctx.lineTo(i,height-0.5);
		ctx.closePath();
		ctx.stroke();
	}
});

$(document).click(function(event){
	clickX = event.clientX;
	clickY = event.clientY;
	ctx.fillRect(clickX,clickY,scale,scale);
});
