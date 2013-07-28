var IconPicker = require('/ui/edit/IconPicker');

function RawActionEditor(button, parentButton, navGroup, onSave, deviceName, deviceType) {

    var validJson = !!button.state;

    // Create our main window
    var self = Ninja.UI.createWindow({
	    title: button.title
    });

    var fieldTemplate = {
		properties: {
			selectionStyle: ios?Titanium.UI.iPhone.ListViewCellSelectionStyle.NONE:undefined
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
			hintText: 'e.g. \n{\n  "Never Going To": [\n    "Give you up",\n    "Let you down",\n    "Run around and desert you"\n  ]\n}',
			clearButtonMode: Titanium.UI.INPUT_BUTTONMODE_ONFOCUS,

			left: '20%',
			width: '80%'
		    }
		}
	    ]
	};

	var textAreaTemplate = JSON.parse(JSON.stringify(fieldTemplate));
	textAreaTemplate.childTemplates[1].type = 'Ti.UI.TextArea';
	textAreaTemplate.childTemplates[1].properties.height = '300px';
	textAreaTemplate.childTemplates[1].properties.suppressReturn = false;
	textAreaTemplate.childTemplates[1].properties.autocapitalization = Titanium.UI.TEXT_AUTOCAPITALIZATION_NONE;
	textAreaTemplate.childTemplates[1].properties.autocorrect = false;
	textAreaTemplate.childTemplates[1].properties.value = button.state;

	textAreaTemplate.events.change = function(e) {
		validJson = false;
		JSON.stringify(JSON.parse(e.value));
		button.state = e.value;
		validJson = true;
	}

	textAreaTemplate.properties.height = '300px';

    var optionData = [
	{
		rowtitle: {
			text: 'Name'
		},
		template: 'field'
	},
	{
		properties: {
			height: '300px'
		},
		rowtitle: {
			text: 'State (Json)'
		},
		template: 'textArea'
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

	var listView = Ninja.UI.createListView({
		sections: [optionListSection],
		templates: { 'field': fieldTemplate, 'textArea' : textAreaTemplate },
	});

	listView.addEventListener('itemclick', function(e) {
		if (e.section.getItemAt(e.itemIndex).onClick)
			e.section.getItemAt(e.itemIndex).onClick(e);
	});

	self.add(listView);

	var save = Ninja.UI.createSaveButton();

	save.addEventListener("click", function() {

		if (validJson) {
			onSave(button);
		} else {
			var dialog = Ti.UI.createAlertDialog({
				message: 'The Json data was not able to be parsed.',
				ok: 'OK',
				title: 'Invalid Json'
			}).show();
		}

	});

	self.setRightNavButton(save);

    return self;
}

module.exports = RawActionEditor;