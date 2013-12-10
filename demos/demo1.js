$(function() {
	var jdat = $("#jdat").jdat({
		settings: true,
		resizer: "left",
		title: "jDat Panel"
	}).data("jdat");

	jdat.add("toggle", {
		label: "Toggle"
	});

	jdat.add("slider", {
		label: "Slider"
	});

	jdat.add("checkbox", {
		label: "Checkbox"
	});

	jdat.add("colorselect", {
		label: "Color",
		value: "#0000ff"
	});

	jdat.add("combobox", {
		label: "Combobox",
		selectOptions: [
			{"option1": "Option 1"},
			{"option2": "Option 2"},
			{"option3": "Option 3"}
		]
	});

	jdat.add("buttons", {
		label: "Buttons",
		buttons: ["up", "down"],
		onChange: function(data) {
			console.log(data.source);
		}
	});

	jdat.add("string", {
		label: "String",
		disabled: false,
		onChange: function() { console.log("change"); },
		onFinishChange: function() { console.log("finish change"); }
	});

	var section = jdat.add("section", {
		label: "Section",
		closed: false
	});

	section.add("slider", {
		label: "Slider"
	});

	section.add("slider", {
		label: "Slider"
	});

	section.add("slider", {
		label: "Slider"
	});

	jdat.add("custom", {
		label: "Custom",
		render: function(field) {
			return $("<div>Hello World</div>");
		}
	});

	jdat.add("colorbar", {
		label: "Colorbar",
		colors: ["#00ff00", "#0000ff", "#ff0000"]
	});

	jdat.add("progressbar", {
		label: "Progressbar",
		value: 33
	});
});
