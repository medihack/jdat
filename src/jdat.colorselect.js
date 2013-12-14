!function($) { "use strict";

	/*
	 * ColorSelectField
	 */
	JDat.ColorSelectField = (function() {
		var defaults = {
			label: "Color Select",
			value: "#ffffff",
		}

		var ColorSelectField = function(el, options, eventBus) {
			el.addClass("jdat-colorselect");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindInput();
			this._bindSelector();

			this._initialize();
		}

		JDat.extend(ColorSelectField, JDat.BaseField, {
			_render: function() {
				this._template()
					.append($('<input type="text">')
						.attr("spellcheck", "false"))
					.append(function() {
						return $('<div class="jdat-colorpicker">')
							.append($('<div class="jdat-saturation-field">')
								.append($('<div class="jdat-saturation-inner">'))
								.append($('<div class="jdat-saturation-knob">')))
							.append($('<div class="jdat-hue-field">')
								.append($('<div class="jdat-hue-knob">')))
							.append($('<button class="jdat-colorpicker-close">×</button>'));
					});
			},
			_bindInput: function() {
				var self = this;

				var picker = this._el.find(".jdat-colorpicker");

				this._el.find("input")
					.change(function(e) {
						var color = $(e.currentTarget).val();
						self.value(color, true, true);

						return false;
					})
					.mousedown(function(e) {
						// hide other colorpickers in this widget
						$(this).parents(".jdat-widget")
							.find(".jdat-colorpicker")
							.hide();

						picker.show();

						self._selectColor(self.hex, self.hsv);

						$(document).one("mousedown", function() {
							picker.hide();
						});

						e.stopPropagation();
					});
			},
			_bindSelector: function() {
				this._bindHue();
				this._bindSaturation();

				var picker = this._el.find(".jdat-colorpicker");

				// dummy, so it does not close the picker
				picker.mousedown(function() { return false });

				picker.find(".jdat-colorpicker-close")
					.click(function() {
						picker.hide();
					});
			},
			_bindHue: function() {
				var self = this;

				this._el.find(".jdat-hue-field")
					.mousedown(function(e) {
						if (e.which !== 1) return;

						var hf = $(this);
						var hfTop = hf.offset().top;
						var hfHeight = hf.height();

						var calcH = function(y) {
							var h = 1 - y / hfHeight;
							if (h > 1) { h = 1 };
							if (h < 0) { h = 0 };
							return h *= 360;
						}

						var adjustValue = function(pageY, finishChange) {
							var y = pageY - hfTop;
							self.hsv[0] = calcH(y);
							self._value("hsv", self.hsv, true, finishChange);
						}

						adjustValue(e.pageY, false);

						$(window).on("mousemove.jdatDrag", function(e) {
							adjustValue(e.pageY, false);

							return false;
						});

						$(window).one("mouseup", function(e) {
							adjustValue(e.pageY, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_bindSaturation: function() {
				var self = this;

				this._el.find(".jdat-saturation-field")
					.mousedown(function(e) {
						if (e.which !== 1) return;

						var sf = $(this);
						var sfOffset = sf.offset();
						var sfWidth = sf.width();
						var sfHeight = sf.height();

						var calcS = function(x) {
							var s = x / sfWidth;
							if (s > 1) s = 1;
							if (s < 0) s = 0;
							return s;
						}

						var calcV = function(y) {
							var v = 1 - y / sfHeight;
							if (v > 1) v = 1;
							if (v < 0) v = 0;
							return v;
						}

						var adjustValue = function(pageX, pageY, finishChange) {
							var x = pageX - sfOffset.left;
							var y = pageY - sfOffset.top;
							self.hsv[1] = calcS(x);
							self.hsv[2] = calcV(y);
							self._value("hsv", self.hsv, true, finishChange);
						}

						adjustValue(e.pageX, e.pageY, false);

						$(window).on("mousemove.jdatDrag", function(e) {
							adjustValue(e.pageX, e.pageY, false);

							return false;
						});

						$(window).one("mouseup", function(e) {
							adjustValue(e.pageX, e.pageY, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_setInput: function(hex, hsv) {
				var bgColor = hex;
				var fgColor = (hsv[2] > 0.5 && hsv[1] < 0.5) ? "#000" : "#fff";

				this._el.find("input")
					.val(hex)
					.css("backgroundColor", bgColor)
					.css("color", fgColor);
			},
			_selectColor: function(hex, hsv) {
				var self = this;

				// TODO: tweak performance
				var sat = this._el.find(".jdat-saturation-field");
				var adjustSaturation = function(h) {
					var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
					var satHex = JDat.ColorHelper.hsv2hex([h, 1, 1]);
					var background = "linear-gradient(left, #fff 0%, " + satHex + " 100%)";
					$.each(vendors, function(i, vendor) {
						sat.css("background", vendor + background);
					});
				}

				// TODO: tweak performance
				var hfHeight = this._el.find(".jdat-hue-field").height();
				var hk = this._el.find(".jdat-hue-knob");
				var adjustHueKnob = function(h) {
					var y = (1 - h / 360) * hfHeight;
					if (y < 0) y = 0;
					if (y >= hfHeight) y = hfHeight - 1;
					hk.css("top", y + "px");
				}

				// TODO: tweak performance
				var sf = this._el.find(".jdat-saturation-field");
				var sfWidth = sf.width();
				var sfHeight = sf.height();
				var sk = self._el.find(".jdat-saturation-knob");
				var adjustSaturationKnob = function(s, v) {
					var x = sfWidth * s;
					var y = (1 - v) * sfHeight;
					if (x < 0) x = 0;
					if (y < 0) y = 0;
					if (x >= sfWidth) x = sfWidth - 1;
					if (y >= sfHeight) y = sfHeight - 1;
					sk.css("left", x + "px");
					sk.css("top", y + "px");
					sk.css("backgroundColor", hex);
				}

				adjustSaturation(hsv[0]);
				adjustHueKnob(hsv[0]);
				adjustSaturationKnob(hsv[1], hsv[2]);
			},
			_value: function(format, color, trigger, finishChange) {
				var hex, hsv;
				if (format == "hex") {
					hex = color;
					hsv = JDat.ColorHelper.hex2hsv(hex);
				}
				else { // format == "hsv"
					hsv = color;
					hex = JDat.ColorHelper.hsv2hex(hsv);
				}

				this.hex = hex;
				this.hsv = hsv;

				this._setInput(hex, hsv);

				this._selectColor(hex, hsv);

				var prevHex = this._options.value;
				this._options.value = hex;

				if (trigger) {
					var data = {value: hex, previous: prevHex};
					this._trigger(data, finishChange);
				}
			},
			value: function(hex, trigger, finishChange) {
				if (hex === undefined) {
					return this._options.value;
				}
				else {
					hex = hex.replace(/^\s+|\s+$/g, '');
					hex = hex.toLowerCase();

					var rShort = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
					var rLong = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;

					var match;
					if ((match = hex.match(rShort)) !== null) {
						hex = "#";
						hex += match[1] + match[1];
						hex += match[2] + match[2];
						hex += match[3] + match[3];
					}
					if ((match = hex.match(rLong)) === null) {
						hex = this._options.value;
						trigger = false;
					}

					this._value("hex", hex, trigger, finishChange);
				}
			}
		});

		return ColorSelectField;
	})();

}(jQuery);
