var ColourPicker = require('/ui/edit/ColourPicker'),
	IconPicker = require('/ui/edit/IconPicker');

function ActionEditor(button, parentButton, navGroup, onSave) {
    
    var isLight = button.widget == 'light';
    
    if (!button.title) {
    	button.title = button.deviceName;
    }

    // Create our main window
    var self = Ninja.UI.createWindow({
        title: button.deviceName
    });
    
    var nameView = Ti.UI.createView({
    	layout: 'horizontal',
    	height: 50,
    	top: 10,
    	left: 10,
    	right: 10
    });
    
    nameView.add(Ti.UI.createLabel({
    	text: 'Name',
    	color: ios?'#a9a8bd':undefined,
    	width: '18%'
    }));
    
    var nameField = Ti.UI.createTextField({
    	hintText: 'e.g. "Turn Off Kitchen Light"',
    	textAlign: 'left',
    	width:'82%',
    	//font:{fontSize:18,fontFamily:ios?'Helvetica Light':'Open Sans', fontWeight:'bold'},
        value: button.title
    });
    
    if (ios) {
    	nameField.color = '#575467';
    	nameField.backgroundColor = '#eff1fa';
    }
    
    nameView.add(nameField);
    
    self.add(nameView);
    
    function selectItem(index) {
    	actionData.forEach(function(item, i) {
    		if (i != index) {
	    		item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_NONE;
	    		actionListSection.updateItemAt(i, item);
	    	}
    	});
    	
    	actionData[index].properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
    	actionListSection.updateItemAt(index, actionData[index]);
    }
    
    var actionData = [
    	{
	        properties: {
	            title: 'Turn On',
	            image: 'images/'+(isLight?'light':'relay')+'@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT,
	        onClick: function(e) {
	            button.title = 'Turn On ' + button.deviceName;
	            nameField.value = button.title;
	    		button.type = 'action';
	    		button.widget = isLight ? 'light' : 'action';
	    		button.state = isLight ? 'FFFFFF' : '1';
	    		selectItem(0);
	    		//onSave(button);
	    	}
	    },
	    {
	        properties: {
	            title: 'Turn Off',
	            image: 'images/'+(isLight?'light':'relay')+'@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT,
	        onClick: function(e) {
	           	button.title = 'Turn Off ' + button.deviceName;
	           	nameField.value = button.title;
	    		button.type = 'action';
	    		button.widget = isLight ? 'light' : 'action';
	    		button.state = isLight ? '000000' : '0';
	    		
	    		selectItem(1);
	    	} 
	    }
    ];
    
    if (isLight) {
    	actionData.push({
	        properties: {
	            title: 'Set Color',
	            image: 'images/light@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT,
	        onClick: function() {
	        	Ti.API.info('Clicked set colour!');
    		
	    		var picker = new ColourPicker(button, function() {
	    			nameField.value = button.title;
	    		});
	    		navGroup.open(picker);
	    		selectItem(2);
	    	}
	    });
    }
    
    var actionListSection = Ninja.UI.createListSection({items: actionData, headerTitle: 'Actions'});
    
    var optionData = [
    	{
	        properties: {
	            title: 'Customize Icon',
	            image: 'HTML/icons/'+button.image+'.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT,
	        onClick: function(e) {
	        	var item = e.section.getItemAt(e.itemIndex);
	        	
				IconPicker.onIconSelected = function(icon) {
					Ti.API.info('Icon Selected - ' + icon);
					button.image = icon;
					item.properties.image = '/HTML/icons/'+button.image+'.png';
					e.section.updateItemAt(e.itemIndex, item);
					navGroup.close(IconPicker);
				};
				
				navGroup.open(IconPicker);
	    	}
	    }
    ];
    
    var optionListSection = Ninja.UI.createListSection({items: optionData, headerTitle: 'Options'});
	
	var listView = Ninja.UI.createListView({
		sections: [actionListSection, optionListSection]
	});
		
	listView.addEventListener('itemclick', function(e) {
		if (e.section.getItemAt(e.itemIndex).onClick)
			e.section.getItemAt(e.itemIndex).onClick(e);
	});
	self.add(listView);
	
	var save = Ninja.UI.createSaveButton();
	
	save.addEventListener("click", function() {
		Ti.API.info("Saving button from DeviceAction : " + JSON.stringify(button));
		button.title = nameField.value;
		onSave(button);
	});
	
	self.setRightNavButton(save);
	
    return self;
}

module.exports = ActionEditor;