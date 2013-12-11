JDat.ButtonsController = (function() {
	var defaults = {
		label: "Button",
		holdTimeout: 500,
		buttons: [] // array of strings or array of hashes {buttonId, buttonContent}
	}

	var ButtonsController = function(el, options, eventBus) {
		var opts = $.extend({}, defaults, options);
		JDat.FieldController.call(this, el, opts, eventBus);

		this._bindButtons();
	}

	JDat.extend(ButtonsController, JDat.FieldController, {
		_render: function() {
			var template = this._template()
			$.each(this._options.buttons, function(index, button) {
				if (typeof button === "string") {
					template.append($('<button>')
						.html(button));
				}
				else {
					// assumes an array of hashes (with one key each)
					// e.g. [{"button1": "<span>Button 1</span>"}, {"button2": "<span>Button 2</span>"}]
					for (var buttonId in button) break;
					template.append($('<button>')
						.data("jdat-buttonId", buttonid)
						.html(button["buttonId"]));
				}
			});
		},
		_bindButtons: function() {
			var self = this;

			var buttons = this._el.find("button");

			// handles click and hold events
			var fireStep = 0;
			var timeoutId = 0;
			buttons.mousedown(function(e) {
				fireStep = 1;

				// if array of hashes were used for buttons option then the hash
				// key of the pressed button is returned, otherwise the button itself
				var button = $(e.currentTarget);
				var value = button.data("jdat-buttonId");
				if (!value) {
					value = button;
				}
				var data = {value: value};

				var timeout = self._options.holdTimeout;
				var timer = function() {
					if (fireStep == 2) self._trigger(data, false);
					fireStep = 2;
					timeoutId = setTimeout(timer, timeout);
				}
				timer();

				var clearTimer = function() {
					clearTimeout(timeoutId);
					if (fireStep > 0) self._trigger(data, true);
					fireStep = 0;

					return false;
				}
				$(e.currentTarget).one("mouseup", clearTimer);
				$(e.currentTarget).one("mouseleave", clearTimer);

				return false;
			});
		}
	});

	return ButtonsController;
})();

JDat.Registry["buttons"] = JDat.ButtonsController;
