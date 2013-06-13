var Zone = require('/ui/edit/Zone'),
	ActionComposer = require('/ui/edit/ActionComposer'),
	RFAction = require('/ui/edit/RFAction'),
	RawAction = require('/ui/edit/RawAction'),
	DeviceAction = require('/ui/edit/DeviceAction');

function EditWindow(button, parentButton) {
	
	// Just to make certain we aren't sharing this button... 
	button = JSON.parse(JSON.stringify(button));

	if (ios) {
	    var win = Ninja.UI.createWindow({
	        modal : true,
	        navBarHidden: true
	    });
	}
	var navGroup = Ninja.UI.createNavigationGroup();
	
	function closeEditWindow() {
		
		Ti.API.info('Closing edit window');
		
		if (ios) {
			win.close();
		} else {
			navGroup.close();
		}
	}
	
	function saveButton(btn) {
		Ti.API.info('Saving button - ' + JSON.stringify(btn));
		Ti.App.fireEvent('control.button.' + (!!btn.id?'update':'add'), {button:btn});
		closeEditWindow();
	}
	
	if (button.type == 'menu') {
		var mainWindow = new Zone(button, navGroup, saveButton, closeEditWindow);
	} else if (button.type == 'action') {
		if (button.editor == 'rf'){
			var mainWindow = new RFAction(button, parentButton, navGroup, saveButton);
		} else if (button.editor == 'raw'){
			var mainWindow = new RawAction(button, parentButton, navGroup, saveButton);
		} else if (button.widget == 'light' || button.widget == 'action') {
			var mainWindow = new DeviceAction(button, parentButton, navGroup, saveButton);
		} else {
			Ti.API.info('Making actioncomposer');
			var mainWindow = new ActionComposer(button, parentButton, navGroup, saveButton);
		}
	}
	
	var cancel = Ti.UI.createButton({
	    title: "Cancel",
	    style: ios? Titanium.UI.iPhone.SystemButtonStyle.BORDERED : undefined
	});
	
	cancel.addEventListener("click", closeEditWindow);
		
	if (ios) {
		navGroup.window = mainWindow;
		mainWindow.setLeftNavButton(cancel);
		win.add(navGroup);	
	} else {
		navGroup.open(mainWindow);
	}
	
    return ios? win : null;
}

module.exports = EditWindow;
