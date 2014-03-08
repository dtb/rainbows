var DragDrop = function(target) {
	this.target = target;

	this.registerDragDrop();
};

DragDrop.prototype.registerDragDrop = function() {
	this.target.addEventListener('dragover', this.handleDragOver.bind(this));
	this.target.addEventListener('dragenter', this.handleDragEnter.bind(this));
	this.target.addEventListener('dragleave', this.handleDragLeave.bind(this));
	this.target.addEventListener('drop', this.handleDrop.bind(this));
};

DragDrop.prototype.handleDragOver = function(ev) {
	ev.preventDefault();

	ev.dataTransfer.dropEffect = "copy";
};

DragDrop.prototype.handleDragEnter = function(ev) {
	ev.target.classList.add('hover');
};

DragDrop.prototype.handleDragLeave = function(ev) {
	ev.target.classList.remove('hover');
};

DragDrop.prototype.handleDrop = function(ev) {
	var file = ev.dataTransfer.files[0],
		reader = new FileReader();

	ev.preventDefault();
	ev.target.classList.remove('hover');

	if (ev.dataTransfer.files.length) {
		if (!file.type.match(/image\//)) {
			return;
		}

		reader.onload = function(ev) {
			this.onFile({ url: ev.target.result });
		}.bind(this);
		reader.readAsDataURL(file);
	}
};

DragDrop.prototype.onFile = function() { };

