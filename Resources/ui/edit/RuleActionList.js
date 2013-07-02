var RuleActionEditor = require('/ui/edit/RuleActionEditor');

function RuleActionList(button, parentButton, navGroup, onSave) {

    // Create our main window
    var self = Ninja.UI.createWindow({
    	title:'Rules'
    });

    var ruleData = [];

    _.each(rules, function(rule) {

		ruleData.push({
			rule: rule,
			properties: {
			    title: rule.shortName,
			    image: 'rule.png',
			    accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_DISCLOSURE
			},
			template: Ti.UI.LIST_ITEM_TEMPLATE_DEFAULT
		});

    });
    
    Ti.API.info("Built rule ui " + JSON.stringify(ruleData));

    var ruleSection = Ninja.UI.createListSection({items: ruleData});
	var listView = Ninja.UI.createListView({sections: [ruleSection]});

	listView.addEventListener('itemclick', function(e) {
		var row = ruleData[e.itemIndex];
		Ti.API.info("Clicked a rule : " + row);

		button.type = 'action';
		button.widget = 'action';
		button.title = row.rule.short_name;
		button.editor = 'rule';
		button.rules = [row.rule.rid];

		navGroup.open(new RuleActionEditor(button, parentButton, navGroup, onSave));
	});

	self.add(listView);

    return self;
}

module.exports = RuleActionList;