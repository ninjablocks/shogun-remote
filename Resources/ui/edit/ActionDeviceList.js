var ActionEditor = require('/ui/edit/ActionEditor');

function ActionDeviceList(button, parentButton, navGroup, onSave, deviceType) {

    // Create our main window
    var self = Ninja.UI.createWindow({
        title:deviceType.name + ' Actions'
    });
  
    /*var zoneData = [
    	{
	    	onClick: function() {
	    		btn.device_type = deviceType.device_type;
	            title: 'Turn On All ' + deviceType.name + 's';
	    		btn.type = 'action';
	    		btn.widget = deviceType.device_type == 'light' ? 'light' : 'action';
	    		btn.state = deviceType.device_type == 'light' ? 'FFFFFF' : '1';
	    		onSave(btn);
	    	},
	    	
	        properties: {
	            title: 'Turn On All ' + deviceType.name + 's',
	            image: 'images/'+deviceType.device_type+'.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    },
	    {
	    	onClick: function() {
	    		btn.device_type = deviceType.device_type;
	    		btn.title = 'Turn Off All';
	    		btn.type = 'action';
	    		btn.widget = deviceType.device_type == 'light' ? 'light' : 'action';
	    		btn.state = deviceType.device_type == 'light' ? '000000' : '0';
	    		onSave(btn);
	    	},
	        properties: {
	            title: 'Turn Off All ' + deviceType.name + 's',
	            image: 'images/'+deviceType.device_type+'.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }
    ];
    
    var zoneListSection = Ninja.UI.createListSection({items: zoneData, headerTitle: 'Zone Actions'});*/

    var deviceData = [
    	{
	    	deviceType: deviceType,
	    	deviceName: 'All ' + deviceType.name + 's',
	        properties: {
	            title: 'All ' + deviceType.name + 's',
	            image: 'images/'+deviceType.name+'.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }
	];
    
    Ninja.Data.devices.get(function(devices) {
	    for (var deviceId in devices) {
	    	var device = devices[deviceId];
	    	if (deviceType.device_type.indexOf(device.device_type) > -1) {
	    		deviceData.push({
	    			deviceName: device.shortName,
			    	device: device,
			        properties: {
			            title: device.shortName,
			            image: 'images/'+deviceType.device_type+'.png',
			            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
			        },
			        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
			    });
	    	}
	    }
	});
    
   
    var deviceSection = Ninja.UI.createListSection({items: deviceData/*, headerTitle: 'Device Actions'*/});
	var listView = Ninja.UI.createListView({sections: [/*zoneSection, */deviceSection]});
	
	listView.addEventListener('itemclick', function(e) {
		var row = deviceData[e.itemIndex];
		Ti.API.info("Clicked a device : " + row);
		if (row.deviceType) {
			button.device_type = row.deviceType.device_type;
		} else {
			button.devices = [row.device.guid];
		}
		
		
		button.type = 'action';
		button.deviceName = row.deviceName;
		if (deviceType.name == 'Light') {
			button.widget = 'light';
		} else {
			button.widget = 'action';
		}
		
		navGroup.open(new ActionEditor(button, parentButton, navGroup, onSave));
	});
	
	self.add(listView);

    return self;
}

module.exports = ActionDeviceList;