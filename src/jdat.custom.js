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
