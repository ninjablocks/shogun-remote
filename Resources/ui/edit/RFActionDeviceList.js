var RFActionEditor = require('/ui/edit/RFActionEditor');

function RFActionDeviceList(button, parentButton, navGroup, onSave) {

    // Create our main window
    var self = Ninja.UI.createWindow({
    	title: button.title
    });
  

    var deviceData = [];
    
    Ninja.Data.devices.get(function(devices) {
	    for (var deviceId in devices) {
	    	var device = devices[deviceId];
	    	if (device.device_type == 'rf433') {
	    		for (var subDeviceId in device.subDevices) {
	    			subDevice = device.subDevices[subDeviceId];
	    			deviceData.push({
		    			deviceName: device.shortName,
				    	device: device,
				    	subDevice: subDevice,
				        properties: {
				            title: subDevice.shortName,
				            image: 'rf.png',
				            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
				        },
				        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
				    });
	    		}
	    		
	    	}
	    }
	});
    
   
    var deviceSection = Ninja.UI.createListSection({items: deviceData/*, headerTitle: 'Device Actions'*/});
	var listView = Ninja.UI.createListView({sections: [/*zoneSection, */deviceSection]});
	
	listView.addEventListener('itemclick', function(e) {
		var row = deviceData[e.itemIndex];
		Ti.API.info("Clicked a device : " + row);
		
		button.type = 'action';
		button.widget = 'action';
		button.state = row.subDevice.data;
		button.title = row.subDevice.shortName;
		button.editor = 'rf';
		button.devices = [row.device.guid];
		
		navGroup.open(new RFActionEditor(button, parentButton, navGroup, onSave));
	});
	
	self.add(listView);

    return self;
}

module.exports = RFActionDeviceList;