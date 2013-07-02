var ActionDeviceList = require('/ui/edit/ActionDeviceList'),
	RFActionDeviceList = require('/ui/edit/RFActionDeviceList'),
	RawActionDeviceList = require('/ui/edit/RawActionDeviceList'),
	RuleList = require('/ui/edit/RuleActionList');
	
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
			window: RFActionDeviceList,
	        properties: {
	            title: 'RF Actions',
	            image: '/images/rf@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
	    }/*, {
			window: RuleList,
	        properties: {
	            title: 'Rules',
	            image: '/images/rule@2x.png',
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
			window: RawActionDeviceList,
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
			var actionWindow = new ActionDeviceList(button, parentButton, navGroup, onSave, data[e.itemIndex].type);
		} else {
			var actionWindow = data[e.itemIndex].window(button, parentButton, navGroup, onSave);
		}
		
		navGroup.open(actionWindow)
	});
	
	self.add(listView);

	return self;
}

module.exports = ActionComposer;