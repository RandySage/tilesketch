function Sketcher( canvasID, colorType ) {
    this.renderFunction =  this.updateCanvasByLine;
    this.nTiles = 16;
    this.maxNLines = 1000;

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
	this.nTiles = 50;
    } 
    else if (colorType == 'color0' || 
	     colorType == 'color1' || 
	     colorType == 'color2' ) {
	this.colorType = colorType;
	this.nTiles = 50;
    }
    else{
	// Default to blackWhite
	this.colorType = 'color0';
	this.nTiles = 13;
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

    //    this.canvas.onselectstart = function () { return false; } // ie
    //    this.canvas.onmousedown = function () { return false; } // mozilla
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

// Function that returns triangle wave with following characteristics (for period=6):
//   - slopes from 0 to 1 as x goes from 0 to 1
//   - constant 1 as x goes from 1 to 3
//   - slopes from 1 to 0 as x goes from 3 to 4
//   - constant 0 as x goes from 4 to 6
//   - repeats for x < 0 or > 6 (input is modulus 6)
Sketcher.prototype.clippedTriangleWave = function ( x, period ) {
    var y;
    var xModPeriod = x % period;
    var xModPeriodNormalized = xModPeriod * 6 / period;

    if ( xModPeriodNormalized >= 0 && xModPeriodNormalized < 1 ){
	y = xModPeriodNormalized;
    } else if ( xModPeriodNormalized >= 1 && xModPeriodNormalized < 3 ){ 
	y = 1;
    } else if ( xModPeriodNormalized >= 3 && xModPeriodNormalized < 4 ){ 
	y = 1 - (xModPeriodNormalized-3);
    } else if ( xModPeriodNormalized >= 4 && xModPeriodNormalized < 6 ){ 
	y = 0;
    } else {
	y = 0;
	console.log('Logic error in Sketcher.clippedTriangleWave()'); 
    }
    return y;
}

Sketcher.prototype.getColor = function ( i, colorPeriod, colorType) {
    var frequency;
    var offset;
    var amplitude;

    var redOffset;
    var blueOffset;
    var greenOffset;
    var red  ;
    var green;
    var blue ;
    var colorString = "rgb(0, 0, 0)"; // Fall back to black

    if (this.colorType == 'color0' ) {
	frequency = 2*Math.PI / colorPeriod;
	offset = 128;
	amplitude = 127;

	redOffset = 0;
	greenOffset = 5;
	blueOffset = 3;

	red   = Math.round( Math.sin(this.redMult*frequency*i + redOffset) * amplitude + offset );
	green = Math.round( Math.sin(this.greenMult*frequency*i + greenOffset) * amplitude + offset );
	blue  = Math.round( Math.sin(this.blueMult*frequency*i + blueOffset) * amplitude + offset );
	    
	colorString = "rgb(" + red + "," + green + "," + blue + ")";
    }
    else if (this.colorType == 'color1') {
	frequency = 2*Math.PI / colorPeriod;
	amplitude = 255*1.5 / 2;
	offset = 255 - amplitude;

	redOffset =   2*Math.PI * 0/3;
	greenOffset = 2*Math.PI * 2/3;
	blueOffset =  2*Math.PI * 1/3;

	red   = Math.round( Math.sin(this.redMult*frequency*i + redOffset) * amplitude + offset );
	green = Math.round( Math.sin(this.greenMult*frequency*i + greenOffset) * amplitude + offset );
	blue  = Math.round( Math.sin(this.blueMult*frequency*i + blueOffset) * amplitude + offset );
	    
	red = (red > 0) ? red : 0;
	green = (green > 0) ? green : 0;
	blue = (blue > 0) ? blue : 0;

	colorString = "rgb(" + red + "," + green + "," + blue + ")";
    } 
    else if (this.colorType == 'color2') {
	redOffset   = colorPeriod * 0/3;
	greenOffset = colorPeriod * 1/3;
	blueOffset  = colorPeriod * 2/3;

	red   = Math.round( 255 * this.clippedTriangleWave(i+redOffset,   colorPeriod) );
	green = Math.round( 255 * this.clippedTriangleWave(i+greenOffset, colorPeriod) );
	blue  = Math.round( 255 * this.clippedTriangleWave(i+blueOffset,  colorPeriod) );

	colorString = "rgb(" + red + "," + green + "," + blue + ")";
    }
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
	    else if (this.colorType.substring(0,5) == 'color') {
		// This is a randomly selected function - fairly arbitrary
		var colorPeriodInitial = 1.5 * Math.sqrt(this.nTiles);

		// However the value is selected, I want to enforce that there 
		// is an integer number of cycles through the colors in order to
		// achieve the desired look
		var nColorCyclesInt = Math.round(this.nTiles / colorPeriodInitial);

		// Need to re-calculate the period with the number of cycles
		var colorPeriod = this.nTiles / nColorCyclesInt;

		strokeStyle = this.getColor(i, colorPeriod, this.colorType);
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
    //alert(this.maxNLines);
    if (inputNTiles > 0){
	if (inputNTiles > this.maxNLines){
	    alert(inputNTiles);
    	    inputNTiles = this.maxNLines;
	    alert(inputNTiles);
	}
	this.nTiles = inputNTiles;
    }
}
			
Sketcher.prototype.getNTiles = function () {
    return this.nTiles;
}
