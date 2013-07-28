var IconPicker = require('/ui/edit/IconPicker');

function RuleActionEditor(button, parentButton, navGroup, onSave, deviceName) {

// Create our main window
    var self = Ninja.UI.createWindow({
    	title: button.title
    });
    

    if (!ios) {
    	self.windowSoftInputMode = Ti.UI.Android.SOFT_INPUT_ADJUST_PAN;
    }
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
    	hintText: 'e.g. "Turn off Front Door Rule"',
    	textAlign: 'left',
    	width:'82%'
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
	            title: 'Enable Rule',
	            image: 'images/rule@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT,
	        onClick: function(e) {
	            nameField.value = 'Enable ' + button.deviceName;
	    		button.state = true;
	    		selectItem(0);
	    		//onSave(button);
	    	}
	    },
	    {
	        properties: {
	            title: 'Disable Rule',
	            image: 'images/rule@2x.png',
	            accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE
	        },
	        template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT,
	        onClick: function(e) {
	           	nameField.value = 'Disable ' + button.deviceName;
	    		button.state = false
	    		
	    		selectItem(1);
	    	} 
	    }
    ];
    
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
					l('Icon Selected - ' + icon);
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
    
    var actionListSection = Ninja.UI.createListSection({items: actionData, headerTitle: 'Actions'});
	
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
		l("Saving button from RuleAction : " + JSON.stringify(button));
		button.title = nameField.value;
		onSave(button);
	});
	
	self.setRightNavButton(save);
	
    return self;
}

module.exports = RuleActionEditor;