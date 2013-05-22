!function($) {
  "use strict";

	var JDat = JDat || {};

	/*
	 * Helpers
	 */
	JDat.extend = function(sub, base, methods) {
		var tmp = function(){};
		tmp.prototype = base.prototype;
		sub.prototype = new tmp();
		sub.prototype.constructor = sub;
		$.extend(sub.prototype, methods);
	}

	JDat.ColorHelper = {
		hex2hsv: function(hex) {
			var bigint = parseInt(hex.slice(1), 16);

			var r = (bigint >> 16) & 255;
			var g = (bigint >> 8) & 255;
			var b = bigint & 255;

			return this.rgb2hsv([r, g, b]);
		},
		hsv2hex: function(hsv) {
			var rgb = this.hsv2rgb(hsv);
			return this.rgb2hex(rgb);
		},
		// Credits to http://www.raphaeljs.com
		hsv2rgb: function(hsv) {
			var R, G, B, X, C;
			var h = (hsv[0] % 360) / 60;

			C = hsv[2] * hsv[1];
			X = C * (1 - Math.abs(h % 2 - 1));
			R = G = B = hsv[2] - C;

			h = ~~h;
			R += [C, X, 0, 0, X, C][h];
			G += [X, C, C, X, 0, 0][h];
			B += [0, 0, X, C, C, X][h];

			var r = Math.floor(R * 255);
			var g = Math.floor(G * 255);
			var b = Math.floor(B * 255);

			return [r, g, b];
		},
		rgb2hex: function(rgb) {
			var r = rgb[0];
			var g = rgb[1];
			var b = rgb[2];

			return "#" + (16777216 | b | (g << 8) | (r << 16))
				.toString(16).slice(1);
		},
		// r, g, b can be either in <0,1> range or <0,255> range.
		// Credits to http://www.raphaeljs.com
		rgb2hsv: function(rgb) {
			var r = rgb[0];
			var g = rgb[1];
			var b = rgb[2];

			if (rgb[0] > 1 || rgb[1] > 1 || rgb[2] > 1) {
				r /= 255;
				g /= 255;
				b /= 255;
			}

			var h, s, v, c;
			v = Math.max(r, g, b);
			c = v - Math.min(r, g, b);
			h = (c == 0 ? null :
					v == r ? (g - b) / c + (g < b ? 6 : 0) :
					v == g ? (b - r) / c + 2 :
					(r - g) / c + 4);
			h = (h % 6) * 60;
			s = c == 0 ? 0 : c / v;

			return [h, s, v];
		},
	}


	/*
	 * FieldController
	 */
	JDat.FieldController = (function() {
		var defaults = {
			id: null,
			key: null,
			label: null,
			titleize: false,
			disabled: false,
			hidden: false,
			onChange: null,
			onFinishChange: null
		}

		var FieldController = function(el, options) {
			this._el = el;
			this._options = $.extend({}, defaults, options);

			this._render();

			if (this._options.disabled) {
				this.disable();
			}

			if (this._options.hidden) {
				this._el.hide();
			}
		}

		FieldController.prototype = {
			constructor: FieldController,
			_trigger: function(data, finishChange) {
				data.source = this;

				if (this._options.onChange) {
					this._options.onChange.call(this, data);
				}

				if (finishChange === undefined || finishChange) {
					if (this._options.onFinishChange) {
						this._options.onFinishChange.call(this, data);
					}
				}
			},
			_template: function() {
				var fieldContainer = $('<div class="jdat-field-container">')
					.appendTo(this._el);

				if (!this._options.label) return fieldContainer;

				var fieldPanel = $('<div class="jdat-field-panel">');

				var fieldLabel = $('<span class="jdat-field-label">');
				if (this._options.titleize) fieldLabel.addClass("jdat-title");

				fieldContainer.append(fieldLabel)
					.append(fieldPanel);

				this.label(this._options.label);

				return fieldPanel;
			},
			id: function() {
				return this._options.id;
			},
			key: function() {
				return this._options.key;
			},
			label: function(label) {
				if (label === undefined) {
					return this._options.label;
				}
				else {
					this._options.label = label;
					this._el.find(".jdat-field-label").text(label);
				}
			},
			onChange: function(func) {
				if (func === undefined) {
					return this._options.onChange;
				}
				else {
					this._options.onChange = func;
				}
			},
			show: function(complete) {
				var self = this;

				this._el.slideDown("fast", function() {
					$(this).show();

					if ($.isFunction(complete)) {
						complete.call(self);
					}
				});

				this._options.hidden = false;
			},
			hide: function(complete) {
				var self = this;

				this._el.slideUp("fast", function() {
					$(this).hide();

					if ($.isFunction(complete)) {
						complete.call(self);
					}
				});

				this._options.hidden = true;
			},
			enable: function() {
				this._el.find($(".jdat-field-disabler")
						.remove());

				this._options.disabled = false;
			},
			disable: function(loading) {
				var disabler = this._el.find(".jdat-field-disabler");

				if (!disabler.length) {
					disabler = $('<div class="jdat-field-disabler">')
						.appendTo(this._el);

					if (loading) {
						disabler.addClass("jdat-loading");
					}
				}

				this._options.disabled = true;
			},
			trigger: function(data, finishChange) {
				this._trigger(data, finishChange);
			}
		}

		return FieldController;
	})();


	/*
	 * SectionController
	 */
	JDat.SectionController = (function() {
		var defaults = {
			label: "Section",
			title: true,
			closeable: true,
			closed: false,
			indent: true
		}

		var SectionController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindClose();

			if (this._options.closed) {
				this.close();
			}
		}

		JDat.extend(SectionController, JDat.FieldController, {
			_render: function() {
				if (this._options.title) {
					this._template().remove(); // removes the field panel

					this._el.find(".jdat-field-label")
						.addClass("jdat-section-title")
						.addClass("jdat-title");

					if (this._options.closeable) {
						this._el.find(".jdat-field-container")
							.prepend($('<div class="jdat-arrow-down">'));
					}
				}

				var sectionPanel = $('<ul class="jdat-section-panel">')
					.appendTo(this._el);

				if (this._options.indent) {
					sectionPanel.addClass("jdat-indent");
				}
			},
			_bindClose: function() {
				var self = this;

				if (this._options.closeable) {
					this._el.find(".jdat-field-container:eq(0)")
						.click(function() {
							self.closed ? self.open() : self.close();

							return false;
						});
				}
			},
			_addField: function(type, controllerClazz, options) {
				var li = $("<li>")
					.addClass("jdat-field")
					.addClass("jdat-" + type)
					.appendTo(this._el.find(".jdat-section-panel:eq(0)"));

				if (options.id) li.attr("id", options.id);

				var controller = new controllerClazz(li, options);
				li.data("jdat", controller);
				return controller;
			},
			addSlider: function(options) {
				return this._addField("slider", JDat.SliderController, options);
			},
			addCheckBox: function(options) {
				return this._addField("checkbox", JDat.CheckBoxController, options);
			},
			addColorSelect: function(options) {
				return this._addField("colorselect", JDat.ColorSelectController, options);
			},
			addComboBox: function(options) {
				return this._addField("combobox", JDat.ComboBoxController, options);
			},
			addButtons: function(options) {
				return this._addField("buttons", JDat.ButtonsController, options);
			},
			addString: function(options) {
				return this._addField("string", JDat.StringController, options);
			},
			addColorBar: function(options) {
				return this._addField("colorbar", JDat.ColorBarController, options);
			},
			addProgressBar: function(options) {
				return this._addField("progressbar", JDat.ProgressBarController, options);
			},
			addCustom: function(options) {
				return this._addField("custom", JDat.CustomController, options);
			},
			addSection: function(options) {
				return this._addField("section", JDat.SectionController, options);
			},
			open: function(complete) {
				var self = this;

				this._el.find(".jdat-section-panel:eq(0)")
					.slideDown("fast", function() {
						$(this).show();

						if ($.isFunction(complete)) {
							complete.call(self);
						}
					});

				this._el.find(".jdat-arrow-right:eq(0)")
					.removeClass("jdat-arrow-right")
					.addClass("jdat-arrow-down");

				this.closed = false;
			},
			close: function(complete) {
				var self = this;

				this._el.find(".jdat-section-panel:eq(0)")
					.slideUp("fast", function() {
						$(this).hide();

						if ($.isFunction(complete)) {
							complete.call(self);
						}
					});

				this._el.find(".jdat-arrow-down:eq(0)")
					.removeClass("jdat-arrow-down")
					.addClass("jdat-arrow-right");

				this.closed = true;
			},
			empty: function() {
				this._el.find(".jdat-section-panel:eq(0)")
					.empty();
			}
		});

		return SectionController;
	})();


	/*
	 * SliderController
	 */
	JDat.SliderController = (function() {
		var defaults = {
			label: "Slider",
			max: 100,
			min: 1,
			step: 1,
			value: 50,
		}

		var SliderController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindSlide();
			this._bindInput();

			this.value(this._options.value, false);
		}

		JDat.extend(SliderController, JDat.FieldController, {
			_render: function() {
				this._template()
					.append($('<input type="text">'))
					.append(function() {
						return $('<div class="jdat-slider-bg">')
							.append($('<div class="jdat-slider-fg">'));
					});
			},
			_bindSlide: function() {
				var self = this;

				this._el.find(".jdat-slider-bg")
					.mousedown(function(event) {
						if (event.which !== 1) return;

						var bg = self._el.find(".jdat-slider-bg");
						var bgOffset = bg.offset();
						var bgWidth = bg.width();
						var min = self._options.min;
						var max = self._options.max;

						var adjustValue = function(x, finishChange) {
							var bgLeft = bgOffset.left;
							var value = min + (max - min) * ((x - bgLeft) / bgWidth);
							self.value(value, true, finishChange);
						}

						adjustValue(event.pageX, false);

						$(window).on("mousemove.jdatDrag", function(event) {
							adjustValue(event.pageX, false);

							return false;
						});

						$(window).one("mouseup", function(event) {
							adjustValue(event.pageX, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_bindInput: function() {
				var self = this;

				this._el.find("input")
					.change(function(event) {
						var value = $(event.currentTarget).val();
						self.value(value);

						return false;
					})

					.mousedown(function(event) {
						if (event.which !== 1) return;

						var startY = event.pageY;

						var step = self._options.step;
						var value = self._options.value;

						var newValue = value;

						$(window).on("mousemove.jdatDrag", function(event) {
							var dy = startY - event.pageY;
							newValue = dy / 10 * step + value;
							self.value(newValue, true, false);

							return false;
						});

						$(window).one("mouseup", function(event) {
							self.value(newValue, true, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_setSlider: function() {
				var value = this._options.value;
				var max = this._options.max;
				var min = this._options.min;
				var pct = (value - min) / (max - min);

				var width = 100 * pct + "%";
				this._el.find(".jdat-slider-fg").width(width);
			},
			_setInput: function() {
				var value = this._options.value;
				this._el.find("input").val(value);
			},
			label: function(label) {
				if (label === undefined) {
					return this._options.label;
				}
				else {
					this._options.label = label;
					this._el.find(".jdat-field-label").text(label);
				}
			},
			max: function(max) {
				if (max === undefined) {
					return this._options.max;
				}
				else {
					this._options.max = max;

					// only adjust value if outside range
					if (this._options.value > max) {
						this.value(this._options.value);
					}
				}
			},
			min: function(min) {
				if (min === undefined) {
					return this._options.min;
				}
				else {
					this._options.min = min;

					// only adjust value if outside range
					if (this._options.value < min) {
						this.value(this._options.value);
					}
				}
			},
			step: function(step) {
				if (step === undefined) {
					return this._options.step;
				}
				else {
					this._options.step = step;
				}
			},
			value: function(value, trigger, finishChange) {
				if (value === undefined) {
					return this._options.value;
				}
				else {
					value = Number(value);
					if (isNaN(value)) {
						value = this._options.value;
						trigger = false;
					}

					if (value < this._options.min) {
						value = this._options.min;
					}
					else if (value > this._options.max) {
						value = this._options.max;
					}

					var step = this._options.step;
					if (value % step != 0) {
						// TODO investigate further
						var str = String(step);
						var p = 0;
						if (str.indexOf(".") > -1) {
							p = str.length - str.indexOf(".") - 1;
						}
						var tenTo = Math.pow(10, p);
						value = Math.round(value / step) * step;
						value = Math.round(value * tenTo) / tenTo;
					}

					var oldValue = this._options.value;
					this._options.value = value;

					this._setSlider();
					this._setInput();

					if (trigger === undefined || trigger) {
						var data = {value: value, previous: oldValue};
						this._trigger(data, finishChange);
					}
				}
			}
		});

		return SliderController;
	})();


	/*
	 * CheckBoxController
	 */
	JDat.CheckBoxController = (function() {
		var defaults = {
			label: "Check Box",
			value: false,
		}

		var CheckBoxController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindInput();

			this.value(this._options.value, false);
		}

		JDat.extend(CheckBoxController, JDat.FieldController, {
			_render: function() {
				this._template()
					.append($('<input type="checkbox">'));
			},
			_bindInput: function() {
				var self = this;

				this._el.find("input")
					.change(function(event) {
						var checked = $(event.currentTarget).is(":checked");
						self.value(checked);

						return false;
					});
			},
			value: function(checked, trigger, finishChange) {
				if (checked === undefined) {
					return this._options.value;
				}
				else {
					var checked = Boolean(checked);
					this._el.find("input")
						.attr("checked", checked);
					this._options.value = checked;

					var data = {value: checked};

					if (trigger === undefined || trigger) {
						this._trigger(data, finishChange);
					}
				}

			}
		});

		return CheckBoxController;
	})();


	/*
	 * ColorSelectController
	 */
	JDat.ColorSelectController = (function() {
		var defaults = {
			label: "Color Select",
			value: "#ffffff",
		}

		var ColorSelectController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindInput();
			this._bindSelector();

			this.value(this._options.value, false);
		}

		JDat.extend(ColorSelectController, JDat.FieldController, {
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
							.append($('<button class="jdat-colorpicker-close">×</button>'))
					});
			},
			_bindInput: function() {
				var self = this;

				var picker = this._el.find(".jdat-colorpicker");

				this._el.find("input")
					.change(function(event) {
						var color = $(event.currentTarget).val();
						self.value(color);

						return false;
					})
					.mousedown(function(event) {
						// hide other colorpickers in this widget
						$(this).parents(".jdat-widget")
							.find(".jdat-colorpicker")
							.hide();

						picker.show();

						self._selectColor(self.hex, self.hsv);

						$(document).one("mousedown", function(event) {
							picker.hide();
						});

						event.stopPropagation();
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
					.mousedown(function(event) {
						if (event.which !== 1) return;

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

						adjustValue(event.pageY, false);

						$(window).on("mousemove.jdatDrag", function(event) {
							adjustValue(event.pageY, false);

							return false;
						});

						$(window).one("mouseup", function(event) {
							adjustValue(event.pageY, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_bindSaturation: function() {
				var self = this;

				this._el.find(".jdat-saturation-field")
					.mousedown(function(event) {
						if (event.which !== 1) return;

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

						adjustValue(event.pageX, event.pageY, false);

						$(window).on("mousemove.jdatDrag", function(event) {
							adjustValue(event.pageX, event.pageY, false);

							return false;
						});

						$(window).one("mouseup", function(event) {
							adjustValue(event.pageX, event.pageY, true);

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

				var oldHex = this._options.value;
				this._options.value = hex;

				if (trigger === undefined || trigger) {
					var data = {value: hex, previous: oldHex};
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

		return ColorSelectController;
	})();


	/*
	 * ComboBoxController
	 */
	JDat.ComboBoxController = (function() {
		var defaults = {
			label: "ComboBox",
			value: 1,
			selectOptions: ["alpha", "beta", "gamma"],
		}

		var ComboBoxController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindSelect();

			this.selectOptions(this._options.selectOptions);
			this.value(this._options.value, false);
		}

		JDat.extend(ComboBoxController, JDat.FieldController, {
			_render: function() {
				this._template()
					.append($('<select>'));
			},
			_fillSelect: function(select) {
				var selectOptions = this._options.selectOptions;
				$.each(selectOptions, function(i, v) {
					select.append($('<option>')
						.attr("value", v)
						.text(v));
				});
			},
			_bindSelect: function() {
				var self = this;

				this._el.find("select")
					.change(function(event) {
						var i = $(event.currentTarget).find("option:selected")
							.index();
						self.value(i);

						return false;
					});
			},
			selectOptions: function(selectOptions) {
				if (selectOptions === undefined) {
					return this._options.selectOptions;
				}
				else {
					var select = this._el.find("select")
						.empty();

					this._fillSelect(select);
				}
			},
			value: function(option, trigger, finishChange) {
				if (option === undefined) {
					return this._options.value;
				}
				else {
					option = Number(option);
					if (this._options.value == option) {
						trigger = false;
					}

					var optEl = this._el
						.find("select")
						.find("option:eq(" + option + ")")

					if (optEl.length == 0) return;

					var oldValue = this._options.value;
					optEl.attr("selected", "selected");
					this._options.value = option;

					if (trigger === undefined || trigger) {
						var data = {value: option, previous: oldValue};
						this._trigger(data, finishChange);
					}
				}
			}
		});

		return ComboBoxController;
	})();


	/*
	 * ButtonsController
	 */
	JDat.ButtonsController = (function() {
		var defaults = {
			label: "Button",
			holdTimeout: 500,
			buttons: []
		}

		var ButtonsController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindButtons();
		}

		JDat.extend(ButtonsController, JDat.FieldController, {
			_render: function() {
				var template = this._template()
				$.each(this._options.buttons, function(index, label) {
					template.append($('<button>')
						.html(label));
				});
			},
			_bindButtons: function() {
				var self = this;

				var buttons = this._el.find("button");

				// handles click and hold events
				var fireStep = 0;
				var timeoutId = 0;
				buttons.mousedown(function(event) {
					fireStep = 1;
					var index = $(event.currentTarget).index();
					var data = {value: index};
					var timeout = self._options.holdTimeout;
					var timer = function() {
						if (fireStep == 2) self._trigger(data, false);
						fireStep = 2;
						timeoutId = setTimeout(timer, timeout);
					}
					timer();

					var clearTimer = function() {
						clearTimeout(timeoutId);
						if (fireStep > 0) self._trigger(data, true);
						fireStep = 0;

						return false;
					}
					$(event.currentTarget).one("mouseup", clearTimer);
					$(event.currentTarget).one("mouseleave", clearTimer);

					return false;
				});
			}
		});

		return ButtonsController;
	})();


	/*
	 * StringController
	 */
	JDat.StringController = (function() {
		var defaults = {
			label: "String",
			value: "",
			maxLength: 100,
			minLength: 0,
			regexp: null,
			strip: false
		}

		var StringController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindInput();

			this.value(this._options.value, false);
		}

		JDat.extend(StringController, JDat.FieldController, {
			_render: function() {
				this._template()
					.append($('<input type="text">'));
			},
			_bindInput: function() {
				var self = this;
				this._el.find("input").change(function(event) {
					var value = $(event.currentTarget).val();
					self.value(value);

					return false;
				});
			},
			value: function(string, trigger, finishChange) {
				if (string === undefined) {
					return this._options.value;
				}
				else {
					var valid = true;

					if (this._options.strip) {
						string = string.replace(/^\s+|\s+$/g, '');
					}

					var l = string.length;
					if (l > this._options.maxLength || l < this._options.minLength) {
						valid = false;
					}

					var regexp = this._options.regexp;
					if (regexp && !regexp.test(string)) {
						valid = false;
					}

					if (!valid) {
						string = this._options.value;
						trigger = false;
					}

					var oldString = this._options.value;
					this._options.value = string;

					this._el.find('input').val(string);

					if (trigger === undefined || trigger) {
						var data = {value: string, previous: oldString};
						this._trigger(data, finishChange);
					}
				}
			},
			minLength: function(minLength) {
				if (minLength === undefined) {
					return this._options.minLength;
				}
				else {
					minLength = Number(minLength);
					this._options.minLength = minLength;
				}
			},
			maxLength: function(maxLength) {
				if (maxLength === undefined) {
					return this._options.maxLength;
				}
				else {
					maxLength = Number(maxLength);
					this._options.maxLength = maxLength;
				}
			},
			strip: function(strip) {
				if (strip === undefined) {
					return this._options.stip;
				}
				else {
					strip = Boolean(strip);
					this._options.strip = strip;
				}
			},
			regexp: function(regexp) {
				if (regexp === undefined) {
					return this._options.regexp;
				}
				else {
					regexp = RegExp(regexp);
					this._options.regexp = regexp;
				}
			}
		});

		return StringController;
	})();

	/*
	 * ColorBarController
	 */
	JDat.ColorBarController = (function() {
		var defaults = {
			label: "Color Bar",
			colors: [],
			onHover: function(rel, pageX, pageY, barX, barY) {}
		}

		var ColorBarController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this._bindHover();
		}

		JDat.extend(ColorBarController, JDat.FieldController, {
			_render: function() {
				var template = this._template();

				var container = $('<div class="jdat-colorbar-container">');
				template.append(container);
				this.container = container;

				var canvas = $('<canvas class="jdat-colorbar-canvas">');
				container.append(canvas);
				this.ctx = canvas[0].getContext("2d");

				var marker = $('<div class="jdat-colorbar-marker">');
				container.append(marker);
				this.marker = marker;

				var caption = $('<div class="jdat-colorbar-caption">');
				container.append(caption);
				this.caption = caption;

				var w = this.ctx.canvas.width;
				var h = this.ctx.canvas.height;
				var lingrad = this.ctx.createLinearGradient(0 ,0, w, 0);

				var colors = this._options.colors;
				$.each(colors, function(index, color) {
					var stop = index / (colors.length - 1);
					lingrad.addColorStop(stop, color);
				});

				this.ctx.fillStyle = lingrad;
				this.ctx.fillRect(0, 0, w, h);
			},
			_bindHover: function() {
				var self = this;

				this.container.mousemove(function(event) {
					var canvas = $(self.ctx.canvas);
					var offset = canvas.offset();
					var x = Math.round(event.pageX - offset.left);
					var value = x / (canvas.width() - 1);

					self.marker.show();

					if (value >= 0 && value <= 1) {
						self.marker.css("left", x + "px");
					}
					else {
						if (value < 0) value = 0;
						if (value > 1) value = 1;
					}

					var text = self._options.onHover.call(self, value);

					if (text) {
						self.caption.html(text).show();
					}
					else {
						self.caption.hide();
					}

					return false;
				});

				this.container.mouseleave(function() {
					self.marker.hide();

					self.caption.hide();

					return false;
				});
			},
			getColor: function(value, format) {
				var canvas = this.ctx.canvas;
				var canvasWidth = canvas.width;
				var x = (canvasWidth - 1) * value;
				var data = this.ctx.getImageData(x, 0, 1, 1).data;

				var rgb = [data[0], data[1], data[2]];

				if (format == "rgb") {
					return rgb;
				}
				else if (format == "hsv") {
					return JDat.ColorHelper.rgb2hsv(rgb);
				}
				else {
					return JDat.ColorHelper.rgb2hex(rgb);
				}
			}
		});

		return ColorBarController;
	})();

	/*
	 * ProgressBarController
	 */
	JDat.ProgressBarController = (function() {
		var defaults = {
			label: "Progress Bar",
			value: 0,
			text: "Loading ..."
		}

		var ProgressBarController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);

			this.value(this._options.value, false);
			this.text(this._options.text);
		}

		JDat.extend(ProgressBarController, JDat.FieldController, {
			_render: function() {
				var progressBar = $('<div class="jdat-progressbar-bg">')
					.append($('<span class="jdat-progressbar-fg">'))
					.append($('<div class="jdat-progressbar-overlay">'));
				this._template().append(progressBar);
			},
			value: function(progress, trigger, finishChange) {
				if (progress === undefined) {
					return this._options.value;
				}
				else {
					progress = parseInt(progress);

					if (isNaN(progress)) {
						progress = this._options.value;
						trigger = false;
					}
					else {
						if (progress < 0 || progress > 100) {
							progress = this._options.value;
							trigger = false;
						}
					}

					var oldValue = this._options.value;
					this._options.value = progress;

					this._el.find(".jdat-progressbar-bg span")
						.css("width", progress + "%");

					if (trigger === undefined || trigger) {
						var data = {value: progress, previous: oldValue}
						this._trigger(data, finishChange);
					}
				}
			},
			text: function(text) {
				if (text === undefined) {
					return this._options.text;
				}
				else {
					this._el.find(".jdat-progressbar-overlay")
						.text(text);
				}
			}
		});

		return ProgressBarController;
	})();

	/*
	 * CustomController
	 */
	JDat.CustomController = (function() {
		var defaults = {
			label: "Custom",
			hasLabel: true,
			classes: [],
			render: function() {}
		}

		var CustomController = function(el, options) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts);
		}

		JDat.extend(CustomController, JDat.FieldController, {
			_render: function() {
				$.each(this._options.classes, function(i, clazz) {
					this._el.addClass(clazz);
				});

				var content = this._options.render(this);
				if (this._options.hasLabel) {
					this._template().append(content);
				}
				else {
					this._el.append(content);
				}
			}
		});

		return CustomController;
	})();


	/*
	 * Widget
	 */
	JDat.Widget = (function() {
		var defaults = {
			resizeable: true,
			resizer: "right",

			closeBar: "bottom",
			openLabel: "Open",
			closeLabel: "Close",

			titleBar: true,
			title: "",
			undockable: true,
			removable: true,
			collapsible: true,

			settings: false,
			onSettings: function() {}
		}

		var Widget = function(el, options) {
			this._el = el;
			this._options = $.extend({}, defaults, options);

			this._render();

			this._bindClose();
			this._bindResize();
			this._bindRemove();
			this._bindDocking();

			if (this.closed) {
				this.close();
			}
		}

		JDat.extend(Widget, JDat.SectionController, {
			_render: function() {
				var self = this;

				this.widget = $('<div class="jdat-widget">');

				// resizer
				if (this._options.resizeable) {
					var resizer = $('<div class="jdat-resizer">')
					if (this._options.resizer == "right") {
						resizer.addClass("jdat-right");
					}
					else { // left
						resizer.addClass("jdat-left");
					}
					resizer.appendTo(this.widget);
				}

				// title bar
				if (this._options.titleBar) {
					this._createTitleBar();
				}

				// section
				this.widget.append($('<ul class="jdat-section-panel">'))

				// close bar
				if (this._options.closeBar) {
					var close = $('<a href="#" class="jdat-closebar">')
							.text(self._options.closeLabel);

					if (this._options.closeBar == "bottom") {
						this.widget.append(close);
					}
					else { // top close bar
						this.widget.prepend(close);
					}
				}

				this.widget.appendTo(this._el);
			},
			_createTitleBar: function() {
				var titleBar = $('<div class="jdat-titlebar">')
					.append($('<div class="jdat-titlebar-title jdat-title">')
							.text(this._options.title));
				if (this._options.removable) {
					titleBar.append($('<button class="jdat-remove">'));
				}
				if (this._options.collapsible) {
					titleBar.append($('<button class="jdat-collapse">'));
				}
				if (this._options.undockable) {
					titleBar.append($('<button class="jdat-undock">'));
				}
				if (this._options.settings) {
					titleBar.append($('<button class="jdat-settings">'));
				}
				titleBar.appendTo(this.widget);
			},
			_bindClose: function() {
				var self = this;

				this.widget.find(".jdat-closebar, button.jdat-collapse")
					.click(function() {
						self.closed ? self.open() : self.close();

						return false;
					});
			},
			_bindResize: function() {
				var self = this;

				this.widget.find(".jdat-resizer")
					.mousedown(function(event) {
						if (event.which !== 1) return;

						var widgetWidth = self.widget.width();
						var calcWidth = function(relPos) {
							return widgetWidth + relPos;
						}

						var startPos = [event.pageX, event.pageY];

						$(window).on("mousemove.jdatDrag", function(event) {
							var curPos = [event.pageX, event.pageY];
							var relX = curPos[0] - startPos[0];

							if (self._options.resizer == "left") relX = -relX;
							self.resize(calcWidth(relX));

							return false;
						});

						$(window).one("mouseup", function() {
							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_bindRemove: function() {
				var self = this;
				this.widget.find(".jdat-titlebar .jdat-remove")
					.click(function() {
						self.remove();

						return false;
					});
			},
			_bindDocking: function() {
				var self = this;
				this.widget.find(".jdat-titlebar .jdat-undock")
					.on("click", function() {
						if (self.undocked) {
							self.dock();
						}
						else {
							self.undock();
						}

						return false;
					});

				this.widget.find(".jdat-titlebar")
					.mousedown(function(event) {
						if (!self.undocked || event.which !== 1) return;

						var offset = self.widget.offset();
						var dx = event.pageX - offset.left;
						var dy = event.pageY - offset.top;

						$(window).on("mousemove.jdatDrag", function(event) {
							var x = event.pageX - dx;
							var y = event.pageY - dy;

							self.widget.css("left", x);
							self.widget.css("top", y);

							return false;
						});

						$(window).one("mouseup.jdatDrag", function() {
							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_bindSettings: function() {
				var self = this;

				this.widget.find(".jdat-settings")
					.click(function(event) {
						self._options.onSettings.call(self);
					});
			},
			open: function(complete) {
				var self = this;

				this.widget.find("ul:eq(0)")
					.slideDown("fast", function() {
						$(this).show();

						if ($.isFunction(complete)) {
							complete.call(self);
						}
					});

				this.widget.find(".jdat-closebar")
					.text(this._options.closeLabel);

				this.widget.find("button.jdat-expand")
					.removeClass("jdat-expand")
					.addClass("jdat-collapse");

				this.closed = false;
			},
			close: function(complete) {
				var self = this;

				this.widget.find("ul:eq(0)")
					.slideUp("fast", function() {
						$(this).hide();

						if ($.isFunction(complete)) {
							complete.call(self);
						}
					});

				this.widget.find(".jdat-closebar")
					.text(this._options.openLabel);

				this.widget.find("button.jdat-collapse")
					.removeClass("jdat-collapse")
					.addClass("jdat-expand");

				this.closed = true;
			},
			resize: function(width) {
				this.widget.width(width);
			},
			empty: function() {
				this.widget.find(".jdat-section-panel:eq(0)")
					.empty();
			},
			remove: function() {
				this.widget.fadeOut("fast", function() {
					$(this).remove();
				});
			},
			undock: function() {
				if (this.undocked) return;

				var self = this;

				var offset = this.widget.offset();
				this.widget.detach()
					.appendTo("body")
					.css("position", "absolute")
					.css("left", offset.left)
					.css("top", offset.top);

				this.widget.find("button.jdat-undock")
					.removeClass("jdat-undock")
					.addClass("jdat-dock");

				if (this._options.resizer == "left") {
					this.widget.find(".jdat-resizer")
						.removeClass("jdat-left")
						.addClass("jdat-right");
				}

				this.dockedPosition = [offset.left, offset.top];

				this.undocked = true;
			},
			dock: function() {
				if (!this.undocked) return;

				var self = this;

				var fix = function() {
					self.widget.detach()
						.appendTo(self._el)
						.css("position", "")
						.css("left", "")
						.css("top", "");

					self.widget.find("button.jdat-dock")
						.removeClass("jdat-dock")
						.addClass("jdat-undock");

					if (self._options.resizer == "left") {
						self.widget.find(".jdat-resizer")
							.removeClass("jdat-right")
							.addClass("jdat-left");
					}
				}

				var offset = this.widget.offset();
				if (offset.left !== this.dockedPosition[0] || offset.top !== this.dockedPosition[1]) {
					this.widget.animate({
						"left": this.dockedPosition[0],
						"top": this.dockedPosition[1]
					}, function() {
						fix();
					});
				}
				else {
					fix();
				}

				this.undocked = false;
			}
		});

		return Widget;
	})();


	/*
	 * jQuery Plugin
	 */
	$.fn.jdat = function(options) {
		return this.each(function() {
			var $this = $(this);
			var data = $this.data("jdat");
			if (!data) {
				$this.data("jdat", new JDat.Widget($this, options));
			}
		});
	}
}(window.jQuery);
