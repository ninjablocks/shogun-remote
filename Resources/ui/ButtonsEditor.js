function ButtonsEditor(buttons, cb) {

    var validJson = true;

    // Create our main window
    var self = Ninja.UI.createWindow({
	    title: 'Configuration Editor'
    });

    var textArea = Ti.UI.createTextArea({
	  keyboardType: Ti.UI.KEYBOARD_DEFAULT,
	  textAlign: 'left',
	  value: JSON.stringify(buttons, null, 2),
	  width: '100%',
	  height: '100%'
	});

	self.add(textArea);

	var save = Ninja.UI.createSaveButton();

	save.addEventListener("click", function() {
		
		var validJson = true;
		
		try {
			var b = JSON.parse(textArea.value);
			buttons = b;
			
		} catch(e) {
			validJson = false;
		}
		
		if (validJson) {
			cb(buttons);
		} else {
			var dialog = Ti.UI.createAlertDialog({
				message: 'The Json data was not able to be parsed.',
				ok: 'OK',
				title: 'Invalid Json'
			}).show();
		}

	});

	self.setRightNavButton(save);

    return self;
}

module.exports = ButtonsEditor;