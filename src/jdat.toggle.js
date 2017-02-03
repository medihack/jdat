!function($) { "use strict";

	/*
	 * ToggleField
	 */
	JDat.ToggleField = (function() {
		var defaults = {
			label: "Toggle",
			value: false
		}

		var ToggleField = function(el, options) {
			el.addClass("jdat-toggle");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts);

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
          .mousedown(function(e) {
            var switched = false;
            var prevX = e.pageX;

            var toggle = $(e.currentTarget);
            toggle.on("mousemove", function(e) {
              e.preventDefault();
              if (e.pageX > prevX) {
                self.value(true, true, true);
                switched = true;
              }

              if (e.pageX < prevX) {
                self.value(false, true, true);
                switched = true;
              }
            });

            toggle.one("mouseup", function(e) {
              e.preventDefault();
              toggle.off("mousemove");

              if (!switched) {
                self.value(!self.value(), true, true);
              }
            });
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
