!function($) { "use strict";

	/*
	 * CheckBoxField
	 */
	JDat.CheckBoxField = (function() {
		var defaults = {
			label: "Check Box",
			value: false,
		}

		var CheckBoxField = function(el, options) {
			el.addClass("jdat-combobox");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts);

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
