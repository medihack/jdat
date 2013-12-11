JDat.ToggleController = (function() {
	var defaults = {
		label: "Toggle",
		value: false
	}

	var ToggleController = function(el, options, eventBus) {
		var opts = $.extend({}, defaults, options);
		JDat.FieldController.call(this, el, opts, eventBus);

		this._bindToggle();

		this._initialize();
	}

	JDat.extend(ToggleController, JDat.FieldController, {
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

	return ToggleController;
})();

JDat.Registry["toggle"] = JDat.ToggleController;
