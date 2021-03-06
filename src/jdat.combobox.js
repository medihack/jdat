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

		var ComboBoxField = function(el, options) {
			el.addClass("jdat-combobox");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts);

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

          if (selectOptions.length > 0) {
            select.prop("disabled", false);
            this._options.value = this._el.find("select").val();
          }
          else {
            select.prop("disabled", true);
          }
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
