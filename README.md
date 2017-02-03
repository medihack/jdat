# JDat

A lightweight control panel supporting several widgets and data binding.

## About
JDat is a lightweight control panel supporting several widgets and data binding for changing variables.
It is an improved clone of [dat-gui][https://code.google.com/p/dat-gui/] using more widgets and additional options.
Also [dat-gui][https://code.google.com/p/dat-gui/] development seemed to be dead for some time, but was resurrected lately.

## Getting Started
Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/medihack/jdat/master/dist/jdat.min.js
[max]: https://raw.github.com/medihack/jdat/master/dist/jdat.js

In your web page:

```html
<html>
  <head>
    <link rel="stylesheet" href="jdat.css" type="text/css" />
    <script src="jquery.js"></script>
    <script src="jdat.min.js"></script>
    <script>
      jQuery(function($) {
        // create JDat panel
        var jdat = $("#jdat").jdat({
          title: "jDat Panel"
        }).data("jdat");

        // add fields to panel
        jdat.add(JDat.SliderField, {
          label: "Test Slider"
        });
      });
    </script>
  </head>
  <body>
    <div id="jdat"></div>
  </body>
</html>
```

## Documentation
You have several options when creating a JDat panel:
- resizeable: can the panel be vertically resized (Boolean, default: true)
- resizer: the location of the resizer ("right" or "left", default: "right")
- titleBar: if the panel has a title bar (Boolean, default: true)
- title: the title of the panel (String)
- undockable: can the panel be undocked and moved around (Boolean, default: true)
- removeable: can the panel be removed (Boolean, default: true)
- collapsible: can the panel be collapsed (Boolean, default: true)
- closeBar: if the panel has a close bar (Boolean, default: true)
- closeLabel: label to close the panel (String, default: "Close")
- openLabel: label to open the panel (String, default: "Open")
- settings: if the panel has a settings button (Boolean, default: false)
- onSettings: a function to call when settings button was pressed
- model: a model to use for data binding (default: null)
- onUpdateView: a data binding function that is called when the view is updated
- onUpdateModel: a data binding function that is called when the model is updated

There are several fields with different options and methods that can be added to a panel.

Most fields have the following, common options:
- label: label of the field (String)
- onChange: a function that is called when a change is in progress (function)
- onFinishChange: a function that is called when the change was finished (function)
- value: an inital value (depends on field)

Most fields have a "value" method to set the current value manually.

Following fields are available:
- JDat.ButtonsField: a field with one or more buttons
-- label: label of the field (String, default: Buttons)
-- buttons: array of strings (button labels) or array of hashes {buttonId, buttonLabel}
-- holdTimeout: a timeout of how often onChange is triggered when holding a button (Integer, default: 500)
-- onChange: called when a button is clicked or when a button is hold down (args: buttonLabel or buttonId)
-- onFinishChange: called when a button was click and released (args: buttonLabel or buttonId)

- JDat.CheckBoxField: a field with a checkbox
-- label: label of the field (String, default: "Check Box")
-- value: inital check state (Boolean, default: false)
-- onChange, onFinishChange: called when the checkbox is checked or unchecked (args: boolean check state)

- JDat.SliderField: a slider to set a number

- JDat.ColorBarField: a colorbar that can be used as a legend

- JDat.ColorSelectField: a field for selecting a color

- JDat.ComboBoxField: a field with combobox options

- JDat.ProgressBarField: a field that contains a progressbar

- JDat.StringField: a field to set a string value

- JDat.ToggleField: a field with a toggle button


## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
