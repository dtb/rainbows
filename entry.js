var DragDrop = require('./dragdrop.js');
var Editor = require('./editor.js');

var tgt = document.getElementById('drop-target'),
	dragger = new DragDrop(tgt),
	img = tgt.querySelectorAll('img')[0];

dragger.onFile = function(args) {
	img.src = args.url;
};

document.querySelectorAll('#controls .go')[0].addEventListener('click', function() {
	var editor = Editor.withImg(img);
	img.style.display = 'none';
	img.parentNode.appendChild(editor.canvas);
	editor.rainbowify();
});
