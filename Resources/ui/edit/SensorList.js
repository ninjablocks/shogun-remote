var SensorEditor = require('/ui/edit/SensorEditor');

function SensorList(button, parentButton, navGroup, onSave) {

    // Create our main window
    var self = Ninja.UI.createWindow({
    	title:'Sensors'
    });

    var deviceData = [];

	Ninja.Data.devices.get(function(devices) {
	    for (var deviceId in devices) {
	    	
			var device = devices[deviceId];
	
			if (device.has_time_series) {
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
	
	    }
	});

    var deviceSection = Ninja.UI.createListSection({items: deviceData});
	var listView = Ninja.UI.createListView({sections: [deviceSection]});

	listView.addEventListener('itemclick', function(e) {
		var row = deviceData[e.itemIndex];
		l("Clicked a device : " + row);

		button.type = 'sensor';
		button.title = row.device.shortName;
		button.devices = [row.device.guid];

		navGroup.open(new SensorEditor(button, parentButton, navGroup, onSave));
	});

	self.add(listView);

    return self;
}

module.exports = SensorList;