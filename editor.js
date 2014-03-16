var Editor = function(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
};

Editor.withImg = function(img) {
	var canvas = document.createElement('canvas'),
		context = canvas.getContext('2d'),
		editor;

	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;

	context.drawImage(img, 0, 0);

	editor = new Editor(canvas);

	return editor;
};

Editor.prototype.rainbowify = function() {
	var rainbowifier = new Rainbowifier(this.canvas);

	rainbowifier.sort();
	this.context.putImageData(rainbowifier.imData, 0, 0);
};

