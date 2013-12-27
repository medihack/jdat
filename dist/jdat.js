/*! jdat - v0.1.0 - 2013-12-27
* https://github.com/medihack/jdat
* Copyright (c) 2013 Kai Schlamp; Licensed MIT */
var JDat = JDat || {};

!function($) { "use strict";

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
	 * BaseField
	 */
	JDat.BaseField = (function() {
		var defaults = {
			id: null,
			binding: null,
			label: null,
			titleize: false,
			onChange: null,
			onFinishChange: null,
			onSetup: null,
			onUpdateView: null,
			onUpdateModel: null
		}

		var BaseField = function(el, options, eventBus) {
			this._el = el;
			this._options = $.extend({}, defaults, options);
			this._eventBus = eventBus;

			this._render();

			if (this._eventBus) {
				var self = this;
				this._eventBus.bind("jdat.updateView", function() {
					if (self._options.model && self._options.binding) {
						self._options.onUpdateView.call(self,
																						self._options.model,
																						self._options.binding);
					}
				});
			}

			if (this._options.onSetup) {
				this._options.onSetup.call(this);
			}
		}

		BaseField.prototype = {
			constructor: BaseField,
			_initialize: function() {
				if (this._options.model && this._options.binding) {
					this._options.onUpdateView.call(this,
																					this._options.model,
																					this._options.binding);
				}
				else if (this._options.value) {
					this.value(this._options.value, false);
				}
			},
			_trigger: function(data, finishChange) {
				data.source = this;

				if (this._options.model && this._options.binding) {
					this._options.onUpdateModel.call(this,
																				this._options.model,
																				this._options.binding,
																				data.value,
																				finishChange);
				}

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
			},
			hide: function(complete) {
				var self = this;

				this._el.slideUp("fast", function() {
					$(this).hide();

					if ($.isFunction(complete)) {
						complete.call(self);
					}
				});
			},
			enable: function() {
				this._el.find($(".jdat-field-disabler")
						.remove());
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
			}
		}

		return BaseField;
	})();

	/*
	 * SectionField
	 */
	JDat.SectionField = (function() {
		var defaults = {
			label: "Section",
			title: true,
			closeable: true,
			closed: false,
			indent: true
		}

		var SectionField = function(el, options, eventBus) {
			el.addClass("jdat-section");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindClose();

			if (this._options.closed) {
				this.close();
			}
		}

		JDat.extend(SectionField, JDat.BaseField, {
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
			add: function(Field, options) {
				var li = $("<li>")
					.addClass("jdat-field")
					.appendTo(this._el.find(".jdat-section-panel:eq(0)"));

				if (options.id) li.attr("id", options.id);

				if (!options.model && this._options.model) {
					options.model = this._options.model;
				}

				if (!options.onUpdateView) {
					options.onUpdateView = this._options.onUpdateView;
				}

				if (!options.onUpdateModel) {
					options.onUpdateModel = this._options.onUpdateModel;
				}

				var field = new Field(li, options, this._eventBus);
				li.data("jdat", field);

				return field;
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

		return SectionField;
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
			onSettings: function() {},

			model: null,

			onUpdateView: function(model, binding) {
				this.value(model[binding], false);
			},
			onUpdateModel: function(model, binding, value, finishChange) {
				model[binding] = value;
			}
		}

		var Widget = function(el, options) {
			this._el = el;
			this._options = $.extend({}, defaults, options);

			this._eventBus = $({});

			this._render();

			this._bindClose();
			this._bindResize();
			this._bindRemove();
			this._bindDocking();

			if (this.closed) {
				this.close();
			}
		}

		JDat.extend(Widget, JDat.SectionField, {
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
				var titleBar = $('<div class="jdat-titlebar">');

				if (this._options.resizeable) {
					titleBar.append($('<div class="jdat-resize-knob">'));
				}
				if (this._options.title) {
					titleBar.append($('<div class="jdat-titlebar-title jdat-title">')
						.text(this._options.title));
				}
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
					.mousedown(function(e) {
						if (e.which !== 1) return;

						var widgetWidth = self.widget.width();
						var calcWidth = function(relPos) {
							return widgetWidth + relPos;
						}

						var startPos = [e.pageX, e.pageY];

						$(window).on("mousemove.jdatDrag", function(e) {
							var curPos = [e.pageX, e.pageY];
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
					.mousedown(function(e) {
						if (!self.undocked || e.which !== 1) return;

						var offset = self.widget.offset();
						var dx = e.pageX - offset.left;
						var dy = e.pageY - offset.top;

						$(window).on("mousemove.jdatDrag", function(e) {
							var x = e.pageX - dx;
							var y = e.pageY - dy;

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
					.click(function(e) {
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
			},
			getField: function(id) {
				var s = "#" + id + ".jdat-field";
				var field = this._el.find(s).data("jdat");
				return field;
			},
			updateView: function() {
				this._eventBus.trigger("jdat.updateView");
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

}(jQuery);

!function($) { "use strict";

	/*
	 * ButtonsField
	 */
	JDat.ButtonsField = (function() {
		var defaults = {
			label: "Button",
			holdTimeout: 500,
			buttons: [] // array of strings or array of hashes {buttonId, buttonContent}
		}

		var ButtonsField = function(el, options, eventBus) {
			el.addClass("jdat-buttons");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindButtons();
		}

		JDat.extend(ButtonsField, JDat.BaseField, {
			_render: function() {
				var template = this._template()
				$.each(this._options.buttons, function(index, button) {
					if (typeof button === "string") {
						template.append($('<button>')
							.html(button));
					}
					else {
						// assumes an array of hashes (with one key each)
						// e.g. [{"button1": "<span>Button 1</span>"}, {"button2": "<span>Button 2</span>"}]
						for (var buttonId in button) break;
						template.append($('<button>')
							.data("jdat-buttonId", buttonid)
							.html(button["buttonId"]));
					}
				});
			},
			_bindButtons: function() {
				var self = this;

				var buttons = this._el.find("button");

				// handles click and hold events
				var fireStep = 0;
				var timeoutId = 0;
				buttons.mousedown(function(e) {
					fireStep = 1;

					// if array of hashes were used for buttons option then the hash
					// key of the pressed button is returned, otherwise the button itself
					var button = $(e.currentTarget);
					var value = button.data("jdat-buttonId");
					if (!value) {
						value = button;
					}
					var data = {value: value};

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
					$(e.currentTarget).one("mouseup", clearTimer);
					$(e.currentTarget).one("mouseleave", clearTimer);

					return false;
				});
			}
		});

		return ButtonsField;
	})();

}(jQuery);

!function($) { "use strict";

	/*
	 * CheckBoxField
	 */
	JDat.CheckBoxField = (function() {
		var defaults = {
			label: "Check Box",
			value: false,
		}

		var CheckBoxField = function(el, options, eventBus) {
			el.addClass("jdat-combobox");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindInput();

			this._initialize();
		}

		JDat.extend(CheckBoxField, JDat.BaseField, {
			_render: function() {
				this._template()
					.append($('<input type="checkbox">'));
			},
			_bindInput: function() {
				var self = this;

				this._el.find("input")
					.change(function(e) {
						var checked = $(e.currentTarget).is(":checked");
						self.value(checked, true, true);

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

					if (trigger) {
						this._trigger(data, finishChange);
					}
				}
			}
		});

		return CheckBoxField;
	})();

}(jQuery);

!function($) { "use strict";

	/*
	 * ColorBarField
	 */
	JDat.ColorBarField = (function() {
		var defaults = {
			label: "Color Bar",
			colors: [],
			onHover: function(rel, pageX, pageY, barX, barY) {}
		}

		var ColorBarField = function(el, options, eventBus) {
			el.addClass("jdat-colorbar");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindHover();
		}

		JDat.extend(ColorBarField, JDat.BaseField, {
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

				this.container.mousemove(function(e) {
					var canvas = $(self.ctx.canvas);
					var offset = canvas.offset();
					var x = Math.round(e.pageX - offset.left);
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

		return ColorBarField;
	})();

}(jQuery);

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

!function($) { "use strict";

	/*
	 * ComboBoxField
	 */
	JDat.ComboBoxField = (function() {
		var defaults = {
			label: "ComboBox",
			selectOptions: [], // array of strings or array of hashes {value, text}
			value: ""
		}

		var ComboBoxField = function(el, options, eventBus) {
			el.addClass("jdat-combobox");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindSelect();

			// TODO maybe check if value is in select options
			// and if not add value as first select option
			this.selectOptions(this._options.selectOptions);

			this._initialize();
		}

		JDat.extend(ComboBoxField, JDat.BaseField, {
			_render: function() {
				this._template()
					.append($('<select>'));
			},
			_fillSelect: function(select) {
				var selectOptions = this._options.selectOptions;
				$.each(selectOptions, function(i, option) {
					var value, text;
					if (typeof option === "string") {
						value = option;
						text = option;
					}
					else {
						// assumes an array of hashes (with one key each)
						// e.g. [{"myoption1", "My Option 1"}, {"myoption2": "My Option 2"}]
						for (value in option) break;
						text = option[value];
					}

					select.append($('<option>')
						.attr("value", value)
						.text(text));
				});
			},
			_bindSelect: function() {
				var self = this;

				this._el.find("select")
					.change(function() {
						var selection = this.value;
						self.value(selection, true, true);

						return false;
					});
			},
			selectOptions: function(selectOptions) {
				if (selectOptions === undefined) {
					return this._options.selectOptions;
				}
				else {
					this._options.selectOptions = selectOptions;
					var select = this._el.find("select").empty();
					this._fillSelect(select);

					select.prop("disabled", selectOptions.length == 0);
				}
			},
			value: function(selection, trigger, finishChange) {
				if (selection === undefined) {
					return this._options.value;
				}
				else {
					var selectOption = this._el
						.find('select option[value="' + selection + '"]');

					if (selectOption.length == 0) return;

					if (!selectOption.is(":selected")) {
						selectOption.attr("selected", "selected");
					}

					var prevSelection = this._options.value;
					this._options.value = selection;

					if (trigger) {
						var data = {value: selection, previous: prevSelection};
						this._trigger(data, finishChange);
					}
				}
			}
		});

		return ComboBoxField;
	})();

}(jQuery);

!function($) { "use strict";

	/*
	 * CustomField
	 */
	JDat.CustomField = (function() {
		var defaults = {
			label: "Custom",
			hasLabel: true,
			classes: [],
			render: function() {}
		}

		var CustomField = function(el, options, eventBus) {
			el.addClass("jdat-custom");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);
		}

		JDat.extend(CustomField, JDat.BaseField, {
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

		return CustomField;
	})();

}(jQuery);

!function($) { "use strict";

	/*
	 * ProgressBarField
	 */
	JDat.ProgressBarField = (function() {
		var defaults = {
			label: "Progress Bar",
			value: 0,
			text: "Loading ..."
		}

		var ProgressBarField = function(el, options, eventBus) {
			el.addClass("jdat-progressbar");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this.value(this._options.value, false);
			this.text(this._options.text);
		}

		JDat.extend(ProgressBarField, JDat.BaseField, {
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

					var prevValue = this._options.value;
					this._options.value = progress;

					this._el.find(".jdat-progressbar-bg span")
						.css("width", progress + "%");

					if (trigger) {
						var data = {value: progress, previous: prevValue}
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

		return ProgressBarField;
	})();

}(jQuery);

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

		var SliderField = function(el, options, eventBus) {
			el.addClass("jdat-slider");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

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

!function($) { "use strict";

	/*
	 * StringField
	 */
	JDat.StringField = (function() {
		var defaults = {
			label: "String",
			value: "",
			maxLength: 100,
			minLength: 0,
			regexp: null,
			strip: false
		}

		var StringField = function(el, options, eventBus) {
			el.addClass("jdat-string");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindInput();

			this._initialize();
		}

		JDat.extend(StringField, JDat.BaseField, {
			_render: function() {
				this._template()
					.append($('<input type="text">'));
			},
			_bindInput: function() {
				var self = this;

				this._el.find("input")
					.change(function(e) {
						var value = $(e.currentTarget).val();
						self.value(value, true, true);
						return false;
					})
					.keyup(function(e) {
						if (e.keyCode != 13) { // only on non return key
							var value = $(e.currentTarget).val();
							self.value(value, true, false);
						}
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

					var prevString = this._options.value;
					this._options.value = string;

					this._el.find('input').val(string);

					if (trigger) {
						var data = {value: string, previous: prevString};
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

		return StringField;
	})();

}(jQuery);

!function($) { "use strict";

	/*
	 * ToggleField
	 */
	JDat.ToggleField = (function() {
		var defaults = {
			label: "Toggle",
			value: false
		}

		var ToggleField = function(el, options, eventBus) {
			el.addClass("jdat-toggle");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this._bindToggle();

			this._initialize();
		}

		JDat.extend(ToggleField, JDat.BaseField, {
			_render: function() {
				this._template()
					.append($('<div class="jdat-toggle-bg">')
						.append($('<div class="jdat-toggle-fg">')
							.text("OFF")));
			},
			_bindToggle: function() {
				var self = this;

				this._el.find(".jdat-toggle-bg")
					.click(function(e) {
						self.value(!self.value(), true, true);

						return false;
					});
			},
			value: function(checked, trigger, finishChange) {
				if (checked === undefined) {
					return this._options.value;
				}
				else {
					var checked = Boolean(checked);

					var toggle = this._el.find(".jdat-toggle-fg");
					if (checked) {
						toggle.addClass("jdat-toggle-on");
						toggle.text("ON");
					}
					else {
						toggle.removeClass("jdat-toggle-on");
						toggle.text("OFF");
					}

					this._options.value = checked;

					var data = {value: checked};

					if (trigger) {
						this._trigger(data, finishChange);
					}
				}
			}
		});

		return ToggleField;
	})();

}(jQuery);
