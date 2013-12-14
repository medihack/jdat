!function($) { "use strict";

	/*
	 * StringController
	 */
	JDat.StringController = (function() {
		var defaults = {
			label: "String",
			value: "",
			maxLength: 100,
			minLength: 0,
			regexp: null,
			strip: false
		}

		var StringController = function(el, options, eventBus) {
			el.addClass("jdat-string");

			var opts = $.extend({}, defaults, options);
			JDat.FieldController.call(this, el, opts, eventBus);

			this._bindInput();

			this._initialize();
		}

		JDat.extend(StringController, JDat.FieldController, {
			_render: function() {
				this._template()
					.append($('<input type="text">'));
			},
			_bindInput: function() {
				var self = this;

				this._el.find("input")
					.change(function(e) {
						var value = $(e.currentTarget).val();
						self.value(value, true, true);
						return false;
					})
					.keyup(function(e) {
						if (e.keyCode != 13) { // only on non return key
							var value = $(e.currentTarget).val();
							self.value(value, true, false);
						}
					});
			},
			value: function(string, trigger, finishChange) {
				if (string === undefined) {
					return this._options.value;
				}
				else {
					var valid = true;

					if (this._options.strip) {
						string = string.replace(/^\s+|\s+$/g, '');
					}

					var l = string.length;
					if (l > this._options.maxLength || l < this._options.minLength) {
						valid = false;
					}

					var regexp = this._options.regexp;
					if (regexp && !regexp.test(string)) {
						valid = false;
					}

					if (!valid) {
						string = this._options.value;
						trigger = false;
					}

					var prevString = this._options.value;
					this._options.value = string;

					this._el.find('input').val(string);

					if (trigger) {
						var data = {value: string, previous: prevString};
						this._trigger(data, finishChange);
					}
				}
			},
			minLength: function(minLength) {
				if (minLength === undefined) {
					return this._options.minLength;
				}
				else {
					minLength = Number(minLength);
					this._options.minLength = minLength;
				}
			},
			maxLength: function(maxLength) {
				if (maxLength === undefined) {
					return this._options.maxLength;
				}
				else {
					maxLength = Number(maxLength);
					this._options.maxLength = maxLength;
				}
			},
			strip: function(strip) {
				if (strip === undefined) {
					return this._options.stip;
				}
				else {
					strip = Boolean(strip);
					this._options.strip = strip;
				}
			},
			regexp: function(regexp) {
				if (regexp === undefined) {
					return this._options.regexp;
				}
				else {
					regexp = RegExp(regexp);
					this._options.regexp = regexp;
				}
			}
		});

		return StringController;
	})();

}(jQuery);
