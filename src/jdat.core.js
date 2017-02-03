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
			onSetup: null,
			onChange: null,
			onFinishChange: null,
			onUpdateView: null,
			onUpdateModel: null
		}

		var BaseField = function(el, options) {
			this._el = el;
			this._options = $.extend({}, defaults, options);

			this._render();

			if (this._options.onSetup) {
				this._options.onSetup.call(this);
			}
		}

		BaseField.prototype = {
			constructor: BaseField,
			_initialize: function() {
				if (this._options.value) {
					this.value(this._options.value, false);
				}

        this.updateView();
			},
			_trigger: function(data, finishChange) {
				data.source = this;

				if (this._options.onUpdateModel) {
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
			},
      updateView: function() {
        if (this._options.onUpdateView) {
          this._options.onUpdateView.call(this,
                                          this._options.model,
                                          this._options.binding);
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

		var SectionField = function(el, options) {
			el.addClass("jdat-section");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts);

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

				var field = new Field(li, options);
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
			},
			updateView: function() {
        this._el.find(".jdat-field").each(function() {
          if (!$(this).hasClass("jdat-section")) {
            $(this).data("jdat").updateView();
          }
        });
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

			titleBar: true,
			title: "",
			undockable: true,
			removable: true,
			collapsible: true,

			closeBar: "bottom",
			closeLabel: "Close",
			openLabel: "Open",

			settings: false,
			onSettings: function() {},

			model: null,

			onUpdateView: function(model, binding) {
        if (model && binding) {
          this.value(model[binding], false);
        }
			},
			onUpdateModel: function(model, binding, value, finishChange) {
        if (model && binding) {
          model[binding] = value;
        }
			}
		}

		var Widget = function(el, options) {
			this._el = el;
			this._options = $.extend({}, defaults, options);

			this._render();

			this._bindClose();
			this._bindResize();
			this._bindRemove();
			this._bindDocking();
      this._bindSettings();

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
            if (self._options.onSettings) {
              self._options.onSettings.call(self);
            }
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
