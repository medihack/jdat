!function($) { "use strict";

	/*
	 * ProgressBarField
	 */
	JDat.ProgressBarField = (function() {
		var defaults = {
			label: "Progress Bar",
			value: 0,
			text: "Loading ..."
		}

		var ProgressBarField = function(el, options, eventBus) {
			el.addClass("jdat-progressbar");

			var opts = $.extend({}, defaults, options);
			JDat.BaseField.call(this, el, opts, eventBus);

			this.value(this._options.value, false);
			this.text(this._options.text);
		}

		JDat.extend(ProgressBarField, JDat.BaseField, {
			_render: function() {
				var progressBar = $('<div class="jdat-progressbar-bg">')
					.append($('<span class="jdat-progressbar-fg">'))
					.append($('<div class="jdat-progressbar-overlay">'));
				this._template().append(progressBar);
			},
			value: function(progress, trigger, finishChange) {
				if (progress === undefined) {
					return this._options.value;
				}
				else {
					progress = parseInt(progress);

					if (isNaN(progress)) {
						progress = this._options.value;
						trigger = false;
					}
					else {
						if (progress < 0 || progress > 100) {
							progress = this._options.value;
							trigger = false;
						}
					}

					var prevValue = this._options.value;
					this._options.value = progress;

					this._el.find(".jdat-progressbar-bg span")
						.css("width", progress + "%");

					if (trigger) {
						var data = {value: progress, previous: prevValue}
						this._trigger(data, finishChange);
					}
				}
			},
			text: function(text) {
				if (text === undefined) {
					return this._options.text;
				}
				else {
					this._el.find(".jdat-progressbar-overlay")
						.text(text);
				}
			}
		});

		return ProgressBarField;
	})();

}(jQuery);
