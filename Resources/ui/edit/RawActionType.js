var RawAction = require('/ui/edit/RawAction');

function RawActionType(button, parentButton, navGroup, onSave) {

    // Create our main window
    var self = Ninja.UI.createWindow({
    	title:'Raw Actions'
    });

    var deviceData = [];

    for (var deviceId in devices) {
	var device = devices[deviceId];

		deviceData.push({
		device: device,
		properties: {
		    title: device.shortName,
		    image: 'hacker.png',
		    accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
		},
		template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    });

    }

    var deviceSection = Ninja.UI.createListSection({items: deviceData});
	var listView = Ninja.UI.createListView({sections: [deviceSection]});

	listView.addEventListener('itemclick', function(e) {
		var row = deviceData[e.itemIndex];
		Ti.API.info("Clicked a device : " + row);

		button.type = 'action';
		button.widget = 'action';
		button.title = row.device.shortName;
		button.editor = 'raw';
		button.devices = [row.device.guid];

		navGroup.open(new RawAction(button, parentButton, navGroup, onSave));
	});

	self.add(listView);

    return self;
}

module.exports = RawActionType;