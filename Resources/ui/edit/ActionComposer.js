var ActionType = require('/ui/edit/ActionType'),
	RFActionType = require('/ui/edit/RFActionType'),
	RawActionType = require('/ui/edit/RawActionType');
	
function ActionComposer(button, parentButton, navGroup, onSave) {

	
    var self = Ninja.UI.createWindow({
        title: 'Action Composer'
    });
	
	var data = [
	    {
	    	type: {
	    		name: 'Light',
	    		device_type: ['rgbled', 'rgbled8', 'light']
	    	},
	        properties: {
	            title: 'Light Actions',
	            image: '/images/light@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }, {
	     	type: {
	    		name: 'Relay',
	    		device_type: ['relay']
	    	},
	        properties: {
	            title: 'Relay Actions',
	            image: '/images/relay@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }, {
			window: RFActionType,
	        properties: {
	            title: 'RF-433 and HID Actions',
	            image: '/images/rf@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }/*,
	     {
	     	type: {
	    		name: 'Socket',
	    		device_type: ['socket'] // TODO: Eh?
	    	},
	        properties: {
	            title: 'Socket Actions',
	            image: 'socket.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }*/
	];
	
	if (developerMode) {
		data.push({
			window: RawActionType,
			properties: {
			    title: 'Hacker Actions',
			    image: '/images/hacker@2x.png',
			    accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
			},
			template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
		});
	}

	var listSection = Ninja.UI.createListSection({items: data});
	var listView = Ninja.UI.createListView({sections: [listSection]});
	
	listView.addEventListener('itemclick', function(e) {
		if (data[e.itemIndex].type) {
			var actionWindow = new ActionType(button, parentButton, navGroup, onSave, data[e.itemIndex].type);
		} else {
			var actionWindow = data[e.itemIndex].window(button, parentButton, navGroup, onSave);
		}
		
		navGroup.open(actionWindow)
	});
	
	self.add(listView);

	return self;
}

module.exports = ActionComposer;