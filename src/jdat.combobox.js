!function($) { "use strict";

	/*
	 * ComboBoxController
	 */
	JDat.ComboBoxController = (function() {
		var defaults = {
			label: "ComboBox",
			selectOptions: [], // array of strings or array of hashes {value, text}
			value: ""
		}

		var ComboBoxController = function(el, options, eventBus) {
			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts, eventBus);

			this._bindSelect();

			// TODO maybe check if value is in select options
			// and if not add value as first select option
			this.selectOptions(this._options.selectOptions);

			this._initialize();
		}

		JDat.extend(ComboBoxController, JDat.FieldController, {
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
					return this._el.find("select").val();
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

		return ComboBoxController;
	})();

	JDat.Registry["combobox"] = JDat.ComboBoxController;

}(jQuery);
