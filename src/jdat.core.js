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
			disabled: false,
			hidden: false,
			onChange: null,
			onFinishChange: null,
			onSetup: null,
			onUpdateView: function(model, binding) {
				this.value(model[binding], false);
			},
			onUpdateModel: function(model, binding, value, finishChange) {
				model[binding] = value;
			}
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

			if (this._options.disabled) {
				this.disable();
			}

			if (this._options.hidden) {
				this._el.hide();
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

			model: null
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
