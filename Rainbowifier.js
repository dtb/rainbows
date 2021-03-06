var rgbhsl = require('./rgbhsl.js');

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
