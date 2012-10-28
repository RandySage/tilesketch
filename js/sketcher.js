function Sketcher( canvasID, colorType ) {
    this.renderFunction =  this.updateCanvasByLine;
    this.nTiles = 16;

    // Used only for color0
    this.redMult = 1;
    this.blueMult = 1;
    this.greenMult = 1;
    // end color0
    
    if (colorType == 'blackWhite' || colorType == undefined){
	this.colorType = 'blackWhite';
    } 
    else if (colorType == 'grayScale') {
	this.colorType = 'grayScale';
	this.nTiles = 160;
    } 
    else if (colorType == 'color0') {
	this.colorType = 'color0';
	this.nTiles = 160;
    }
    else{
	// Default to blackWhite
	this.colorType = 'blackWhite';
    }
	this.touchSupported = Modernizr.touch;
	this.canvasID = canvasID;
	this.canvas = $("#"+canvasID);
	//this.canvas.width = window.innerWidth;
	//this.canvas.height = window.innerHeight;
    
	this.context = this.canvas.get(0).getContext("2d");	
	this.context.strokeStyle = "#000000";
	this.context.lineWidth = 3;
	this.lastMousePoint = {x:0, y:0};
	this.prevLastMousePoint = {x:0, y:0};
	
    
	if (this.touchSupported) {
		this.mouseDownEvent = "touchstart";
		this.mouseMoveEvent = "touchmove";
		this.mouseUpEvent = "touchend";
	}
	else {
		this.mouseDownEvent = "mousedown";
		this.mouseMoveEvent = "mousemove";
		this.mouseUpEvent = "mouseup";
	}
	
	this.canvas.bind( this.mouseDownEvent, this.onCanvasMouseDown() );
}

Sketcher.prototype.onCanvasMouseDown = function () {
	var self = this;
	return function(event) {
		self.mouseMoveHandler = self.onCanvasMouseMove()
		self.mouseUpHandler = self.onCanvasMouseUp()

		$(document).bind( self.mouseMoveEvent, self.mouseMoveHandler );
		$(document).bind( self.mouseUpEvent, self.mouseUpHandler );
		
		self.updateMousePosition( event );
		self.renderFunction( event );
	}
}

Sketcher.prototype.onCanvasMouseMove = function () {
	var self = this;
	return function(event) {

		self.renderFunction( event );
     	event.preventDefault();
    	return false;
	}
}

Sketcher.prototype.onCanvasMouseUp = function (event) {
	var self = this;
	return function(event) {

		$(document).unbind( self.mouseMoveEvent, self.mouseMoveHandler );
		$(document).unbind( self.mouseUpEvent, self.mouseUpHandler );
		
		self.mouseMoveHandler = null;
		self.mouseUpHandler = null;
	}
}

Sketcher.prototype.updateMousePosition = function (event) {
 	var target;
	if (this.touchSupported) {
		target = event.originalEvent.touches[0]
	}
	else {
		target = event;
	}

	// Update prevLastMousePoint before updating lastMousePoint
	this.prevLastMousePoint.x = this.lastMousePoint.x;
	this.prevLastMousePoint.y = this.lastMousePoint.y;

	var offset = this.canvas.offset();
	this.lastMousePoint.x = target.pageX - offset.left;
	this.lastMousePoint.y = target.pageY - offset.top;

}

Sketcher.prototype.getColor0 = function ( i, m) {
    var frequency = 2*Math.PI / m;
    var offset = 128;
    var amplitude = 127;

    var redOffset = 0;
    var blueOffset = 3;
    var greenOffset = 5;

    var red   = Math.round( Math.sin(this.redMult*frequency*i + redOffset) * amplitude + offset );
    var green = Math.round( Math.sin(this.greenMult*frequency*i + greenOffset) * amplitude + offset );
    var blue  = Math.round( Math.sin(this.blueMult*frequency*i + blueOffset) * amplitude + offset );
	    
    var colorString = "rgb(" + red + "," + green + "," + blue + ")";
    return colorString;
}

Sketcher.prototype.updateCanvasByLine = function (event) {
	this.context.moveTo( this.lastMousePoint.x, this.lastMousePoint.y );
	this.updateMousePosition( event );
	var tileAngle = 2*Math.PI / this.nTiles;
	var xCent = this.canvas.width() / 2;
	var yCent = this.canvas.height() / 2;
	var strokeStyle;
	for (var i = 0; (i < this.nTiles); i++){
	    if (this.colorType == 'blackWhite'){
		strokeStyle = "rgb(0, 0, 0)";
	    } 
	    else if (this.colorType == 'grayScale') {
		var colorVal = 255 - ((15*i) % 256);
		this.context.strokeStyle = "rgb(" + colorVal + "," + colorVal + "," + colorVal + ")"
	    } 
	    else if (this.colorType == 'color0') {
		this.colorFreq = 1.5 * Math.sqrt(this.nTiles);

		strokeStyle = this.getColor0(i,this.colorFreq);
	    }

		var angle = i*tileAngle;
		var x0 = Math.cos(angle)*(this.prevLastMousePoint.x-xCent) + 
			-Math.sin(angle)*(this.prevLastMousePoint.y-yCent);
		var y0 = Math.sin(angle)*(this.prevLastMousePoint.x-xCent) + 
		    Math.cos(angle)*(this.prevLastMousePoint.y-yCent);
		var x1 = Math.cos(angle)*(this.lastMousePoint.x-xCent) + 
		    -Math.sin(angle)*(this.lastMousePoint.y-yCent);
		var y1 = Math.sin(angle)*(this.lastMousePoint.x-xCent) + 
		    Math.cos(angle)*(this.lastMousePoint.y-yCent);
		this.context.beginPath();
		this.context.moveTo( x0+xCent, y0+yCent );
		this.context.lineTo( x1+xCent, y1+yCent );
		this.context.strokeStyle = strokeStyle;
		this.context.stroke();
	}

	this.updateMousePosition( event );
//	this.context.moveTo( this.lastMousePoint.x, this.lastMousePoint.y );
}

Sketcher.prototype.toString = function () {

	var dataString = this.canvas.get(0).toDataURL("image/png");
	var index = dataString.indexOf( "," )+1;
	dataString = dataString.substring( index );
	
	return dataString;
}

Sketcher.prototype.toDataURL = function () {

	var dataString = this.canvas.get(0).toDataURL("image/png");
	return dataString;
}

Sketcher.prototype.clear = function () {

	var c = this.canvas[0];
	this.context.clearRect( 0, 0, c.width, c.height );
}
			
Sketcher.prototype.save = function () {

    var oCanvas = document.getElementById("sketch");

    bRes = Canvas2Image.saveAsPNG(oCanvas);

    if (!bRes) {
	alert("Sorry, this browser is not capable of saving " + strType + " files!");
	return false;
    }

}

Sketcher.prototype.export = function () {

    var oCanvas = document.getElementById("sketch");

     var oImg = Canvas2Image.saveAsPNG(oCanvas, true);
     Canvas2Image.saveAsPNG(oCanvas, true);

     if (!oImg) {
     	alert("Sorry, this browser is not capable of saving " + strType + " files!");
     	return false;
     }

     oImg.id = "canvasimage";

     oImg.style.border = oCanvas.style.border;
        oCanvas.parentNode.replaceChild(oImg, oCanvas);
}
			
Sketcher.prototype.setNTiles = function (inputNTiles) {
    //alert(inputNTiles);
    this.nTiles = inputNTiles;
}