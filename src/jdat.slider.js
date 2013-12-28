!function($) { "use strict";

	/*
	 * SliderField
	 */
	JDat.SliderField = (function() {
		var defaults = {
			label: "Slider",
			max: 100,
			min: 1,
			step: 1,
			value: 50,
		}

		var SliderField = function(el, options) {
			el.addClass("jdat-slider");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts);

			this._bindSlide();
			this._bindInput();

			this._initialize();
		}

		JDat.extend(SliderField, JDat.BaseField, {
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
					.mousedown(function(e) {
						if (e.which !== 1) return;

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

						adjustValue(e.pageX, false);

						$(window).on("mousemove.jdatDrag", function(e) {
							adjustValue(e.pageX, false);

							return false;
						});

						$(window).one("mouseup", function(e) {
							adjustValue(e.pageX, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});

						return false;
					});
			},
			_bindInput: function() {
				var self = this;

				this._el.find("input")
					.change(function(e) {
						var value = $(e.currentTarget).val();
						self.value(value, true, true);

						return false;
					})

					.mousedown(function(e) {
						if (e.which !== 1) return;

						var startY = e.pageY;

						var step = self._options.step;
						var value = self._options.value;

						var newValue = value;

						$(window).on("mousemove.jdatDrag", function(e) {
							var dy = startY - e.pageY;
							newValue = dy / 10 * step + value;
							self.value(newValue, true, false);

							return false;
						});

						$(window).one("mouseup", function() {
							self.value(newValue, true, true);

							$(window).off("mousemove.jdatDrag");

							return false;
						});
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
			max: function(max, trigger, finishChange) {
				if (max === undefined) {
					return this._options.max;
				}
				else {
					this._options.max = max;

					// only adjust value if outside range
					if (this._options.value > max) {
						this.value(this._options.value, trigger, finishChange);
					}
				}
			},
			min: function(min, trigger, finishChange) {
				if (min === undefined) {
					return this._options.min;
				}
				else {
					this._options.min = min;

					// only adjust value if outside range
					if (this._options.value < min) {
						this.value(this._options.value, trigger, finishChange);
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

					var prevValue = this._options.value;
					this._options.value = value;

					this._setSlider();
					this._setInput();

					if (trigger) {
						var data = {value: value, previous: prevValue};
						this._trigger(data, finishChange);
					}
				}
			}
		});

		return SliderField;
	})();

}(jQuery);
