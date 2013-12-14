$(function() {
	var jdat = $("#jdat").jdat({
		settings: true,
		resizer: "left",
		title: "jDat Panel"
	}).data("jdat");

	jdat.add(JDat.ToggleField, {
		label: "Toggle"
	});

	jdat.add(JDat.SliderField, {
		label: "Slider"
	});

	jdat.add(JDat.CheckBoxField, {
		label: "Checkbox"
	});

	jdat.add(JDat.ColorSelectField, {
		label: "Color",
		value: "#0000ff"
	});

	jdat.add(JDat.ComboBoxField, {
		label: "Combobox",
		selectOptions: [
			{"option1": "Option 1"},
			{"option2": "Option 2"},
			{"option3": "Option 3"}
		]
	});

	jdat.add(JDat.ButtonsField, {
		label: "Buttons",
		buttons: ["up", "down"],
		onChange: function(data) {
			console.log(data.source);
		}
	});

	jdat.add(JDat.StringField, {
		label: "String",
		disabled: false,
		onChange: function() { console.log("change"); },
		onFinishChange: function() { console.log("finish change"); }
	});

	var section = jdat.add(JDat.SectionField, {
		label: "Section",
		closed: false
	});

	section.add(JDat.SliderField, {
		label: "Slider"
	});

	section.add(JDat.SliderField, {
		label: "Slider"
	});

	section.add(JDat.SliderField, {
		label: "Slider"
	});

	jdat.add(JDat.CustomField, {
		label: "Custom",
		render: function(field) {
			return $("<div>Hello World</div>");
		}
	});

	jdat.add(JDat.ColorBarField, {
		label: "Colorbar",
		colors: ["#00ff00", "#0000ff", "#ff0000"]
	});

	jdat.add(JDat.ProgressBarField, {
		label: "Progressbar",
		value: 33
	});
});
