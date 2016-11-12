/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var DragDrop = __webpack_require__(1);
	var Editor = __webpack_require__(2);

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


/***/ },
/* 1 */
/***/ function(module, exports) {

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

	module.exports = DragDrop;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Rainbowifier = __webpack_require__(3);

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

	module.exports = Editor;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var rgbhsl = __webpack_require__(4);

	var Rainbowifier = function(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext('2d');

		this.imData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height); 
		this.rgb32View = new Uint32Array(this.imData.data.buffer);
	};

	Rainbowifier.prototype.getHsl = function() {
		var hslBuff = new ArrayBuffer(this.imData.data.buffer.byteLength),
			hsl8View = new Uint8ClampedArray(hslBuff),
			i,
			asHsl;

		for (i = 0; i < this.imData.data.length; i += 4) {
			asHsl = rgbhsl.rgbToHsl(this.imData.data[i], this.imData.data[i + 1], this.imData.data[i + 2]);

			hsl8View[i]     = Math.floor(asHsl[0] * 255);
			hsl8View[i + 1] = Math.floor(asHsl[1] * 255);
			hsl8View[i + 2] = Math.floor(asHsl[2] * 255);
		}

		return new Uint32Array(hslBuff);
	};

	Rainbowifier.prototype.sort = function() {
		var hslData = this.getHsl(),
			rgb,
			h,
			s,
			l,
			rgb32,
			i;

		Array.prototype.sort.call(hslData, function(a, b) {
			var aH = a       & 0xFF,
				aS = a >>  8 & 0xFF,
				aL = a >> 16 & 0xFF,
				bH = b       & 0xFF,
				bS = b >>  8 & 0xFF,
				bL = b >> 16 & 0xFF;
				//diffs = [
					//aH - bH,
					//bS - aS,
					//aL - bL,
				//],
				//maxDiff = 0,
				//maxDiffIdx = 0;

			//for (var i = 0; i < diffs.length; i++) {
				//if (Math.abs(diffs[i]) > maxDiff) {
					//maxDiff = Math.abs(diffs[i]);
					//maxDiffIdx = i;
				//}
			//}

			//return diffs[maxDiffIdx];

			return aH - bH;
		});

		for (var i = 0; i < this.rgb32View.length; i++) {
			h = hslData[i]       & 0xFF;
			s = hslData[i] >>  8 & 0xFF;
			l = hslData[i] >> 16 & 0xFF;

			rgb = rgbhsl.hslToRgb(h / 255, s / 255, l / 255);

			rgb32 = rgb[0] |
				rgb[1] << 8 |
				rgb[2] << 16 |
				255 << 24;

			this.rgb32View[i] = rgb32;
		}
	};

	module.exports = Rainbowifier;


/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Converts an RGB color value to HSL. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and l in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSL representation
	 */
	function rgbToHsl(r, g, b){
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return [h, s, l];
	}

	/**
	 * Converts an HSL color value to RGB. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
	 * Assumes h, s, and l are contained in the set [0, 1] and
	 * returns r, g, and b in the set [0, 255].
	 *
	 * @param   Number  h       The hue
	 * @param   Number  s       The saturation
	 * @param   Number  l       The lightness
	 * @return  Array           The RGB representation
	 */
	function hslToRgb(h, s, l){
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	module.exports = {
		rgbToHsl: rgbToHsl,
		hslToRgb: hslToRgb
	}


/***/ }
/******/ ]);