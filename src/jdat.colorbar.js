!function($) { "use strict";

	/*
	 * ColorBarController
	 */
	JDat.ColorBarController = (function() {
		var defaults = {
			label: "Color Bar",
			colors: [],
			onHover: function(rel, pageX, pageY, barX, barY) {}
		}

		var ColorBarController = function(el, options, eventBus) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts, eventBus);

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

		return ColorBarController;
	})();

	JDat.Registry["colorbar"] = JDat.ColorBarController;

}(jQuery);
