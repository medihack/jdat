!function($) { "use strict";

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

		var CustomController = function(el, options, eventBus) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts, eventBus);
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

	JDat.Registry["custom"] = JDat.CustomController;

}(jQuery);
