$(function() {
	var jdat = $("#jdat").jdat({
		settings: true,
		resizer: "left"
	}).data("jdat");

	jdat.add("toggle", {
		label: "My Toggle"
	});

	jdat.add("slider", {
		label: "My Slider"
	});

	jdat.add("checkbox", {
		label: "My Checkbox"
	});

	jdat.add("colorselect", {
		label: "My Color",
		value: "#0000ff"
	});

	jdat.add("combobox", {
		label: "My Combobox"
	});

	jdat.add("buttons", {
		label: "My Buttons",
		buttons: ["up", "down"],
		onChange: function(data) {
			console.log(data.source);
		}
	});

	jdat.add("string", {
		label: "My String",
		disabled: false
	});

	var section1 = jdat.add("section", {
		label: "My Section",
		closed: false
	});

	section1.add("slider", {
		label: "My Slider 2"
	});

	var section2 = section1.add("section", {
		label: "My Section 2",
		title: false
	});

	jdat.add("colorselect", {
		label: "My Color 2",
		value: "#00f000"
	});

	section2.add("slider", {
		label: "My Slider 3"
	});

	jdat.add("custom", {
		label: "My Custom",
		render: function(field) {
			return $("<div>Hello World</div>");
		}
	});

	jdat.add("colorbar", {
		label: "My Colorbar",
		colors: ["#00ff00", "#0000ff", "#ff0000"]
	});
});
