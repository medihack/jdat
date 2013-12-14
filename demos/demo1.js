$(function() {
	var jdat = $("#jdat").jdat({
		settings: true,
		resizer: "left",
		title: "jDat Panel"
	}).data("jdat");

	jdat.add(JDat.ToggleController, {
		label: "Toggle"
	});

	jdat.add(JDat.SliderController, {
		label: "Slider"
	});

	jdat.add(JDat.CheckBoxController, {
		label: "Checkbox"
	});

	jdat.add(JDat.ColorSelectController, {
		label: "Color",
		value: "#0000ff"
	});

	jdat.add(JDat.ComboBoxController, {
		label: "Combobox",
		selectOptions: [
			{"option1": "Option 1"},
			{"option2": "Option 2"},
			{"option3": "Option 3"}
		]
	});

	jdat.add(JDat.ButtonsController, {
		label: "Buttons",
		buttons: ["up", "down"],
		onChange: function(data) {
			console.log(data.source);
		}
	});

	jdat.add(JDat.StringController, {
		label: "String",
		disabled: false,
		onChange: function() { console.log("change"); },
		onFinishChange: function() { console.log("finish change"); }
	});

	var section = jdat.add(JDat.SectionController, {
		label: "Section",
		closed: false
	});

	section.add(JDat.SliderController, {
		label: "Slider"
	});

	section.add(JDat.SliderController, {
		label: "Slider"
	});

	section.add(JDat.SliderController, {
		label: "Slider"
	});

	jdat.add(JDat.CustomController, {
		label: "Custom",
		render: function(field) {
			return $("<div>Hello World</div>");
		}
	});

	jdat.add(JDat.ColorBarController, {
		label: "Colorbar",
		colors: ["#00ff00", "#0000ff", "#ff0000"]
	});

	jdat.add(JDat.ProgressBarController, {
		label: "Progressbar",
		value: 33
	});
});
