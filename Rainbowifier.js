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
		asHsl = rgbToHsl(this.imData.data[i], this.imData.data[i + 1], this.imData.data[i + 2]);

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

		if (aS < 90 || bS < 90) {
			return bS - aS;
		}

		return aH - bH;
	});

	for (var i = 0; i < this.rgb32View.length; i++) {
		h = hslData[i]       & 0xFF;
		s = hslData[i] >>  8 & 0xFF;
		l = hslData[i] >> 16 & 0xFF;

		rgb = hslToRgb(h / 255, s / 255, l / 255);

		rgb32 = rgb[0] |
			rgb[1] << 8 |
			rgb[2] << 16 |
			255 << 24;

		this.rgb32View[i] = rgb32;
	}
};

Rainbowifier.prototype.sortFrom = function(i) {
	var j,
		tmp,
		minIndex = i;

	for (j = i; j < this.view.length; j++) {
		if (this.view[j] < this.view[minIndex]) {
			minIndex = j;
		}
	}

	tmp = this.view[i];
	this.view[i] = this.view[minIndex];
	this.view[minIndex] = tmp;
};

