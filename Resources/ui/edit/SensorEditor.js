var ColourPicker = require('/ui/edit/ColourPicker'),
	IconPicker = require('/ui/edit/IconPicker');

function SensorEditor(button, parentButton, navGroup, onSave, deviceName, deviceType) {

    // Create our main window
    var self = Ninja.UI.createWindow({
    	title: button.title
    });
    
    var fieldTemplate = {
		properties: {
			selectionStyle: ios? Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE: undefined
		},
		events: {
			change: function(e) {
				button.title = e.value;
			}
		},
		childTemplates: [ // Add view subcomponents to the ListItem
			{
	            type: 'Ti.UI.Label', // Use a label
	            bindId: 'rowtitle',  // Bind ID for this label
	            properties: {        // Sets the Label.left property
	                left: '3%',
	                width: '17%'
	            }
	        },
	        {
	           
	            type: 'Ti.UI.TextField', // Use a label
	            properties: {        // Sets the Label.left property
	            	value: button.title || '',
	            	hintText: 'e.g. "My Button"',
	            	clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,
	            	
	                left: '20%',
	                width: '80%'
	            }
	        }
	    ]
	};
    
    var optionData = [
    	{
	        rowtitle: {
	        	text: 'Name'
	        },
	        template: 'field'
		},
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
		sections: [optionListSection],
		templates: { 'field': fieldTemplate }
	});
		
	listView.addEventListener('itemclick', function(e) {
		e.section.getItemAt(e.itemIndex).onClick(e);
	});
	
	self.add(listView);
	
	var save = Ninja.UI.createSaveButton();
	
	save.addEventListener("click", function() {
		//button.title = nameField.value;
		onSave(button);
	});
	
	self.setRightNavButton(save);
    
    return self;
}

module.exports = SensorEditor;