var Color = require('/HTML/lib/one-color'),
	ntc = require('/lib/name-that-colour');

function SetColour(btn, onColour) {

    // Create our main window
    var self = Ninja.UI.createWindow({
    	title: 'Set Color'
    });
    
    var colourView = Ti.UI.createView({
    	height: 150,
    	top: 10,
    	borderRadius:10,
    	borderWidth:3,
    	left: 10,
    	right: 10
    });
    
    if (ios) {
    	colourView.borderColor = '#d1d2dd';
    }
    
    self.add(colourView);
    
	function makeColour(){
		var colour = Color(['HSL', hue.value/100, saturation.value/100,lightness.value/100]);
		colourView.backgroundColor = colour.hex();
		
		Ti.API.info('col: ' + JSON.stringify(ntc.name(colour.hex())));
		
		//nameField.value = btn.deviceName + ' ' + ntc.name(colour.hex())[1];
		
		btn.state = colourView.backgroundColor.substring(1);
		btn.widget = 'light';
		btn.type = 'action';
		
		btn.title = (btn.deviceName?btn.deviceName + ' ':'') + ntc.name(colour.hex())[1];
		onColour();
	}
    
    self.add(Ti.UI.createLabel({text:'Hue', top: 10}));
    var hue = Titanium.UI.createSlider({
	    min: 0,
	    max: 100,
	    value: 0,
    	left: 10,
    	right: 10
    });
	hue.addEventListener('change', makeColour);
    self.add(hue);
   
    self.add(Ti.UI.createLabel({text:'Saturation', top: 10}));
    var saturation = Titanium.UI.createSlider({
	    min: 0,
	    max: 100,
	    value: 100,
    	left: 10,
    	right: 10
    });
	saturation.addEventListener('change', makeColour);
    self.add(saturation);
    
    
    self.add(Ti.UI.createLabel({text:'Lightness', top: 10}));
    var lightness = Titanium.UI.createSlider({
	    min: 0,
	    max: 100,
	    value: 50,
    	left: 10,
    	right: 10
    });
	lightness.addEventListener('change', makeColour);
    self.add(lightness);
    
	if (btn.state) {
		var c = Color(btn.state);
		
		hue.value = c.hue() * 100;
		saturation.value = c.saturation() * 100;
		lightness.value = c.lightness() * 100;
		
		Ti.API.info('Colour : ' + btn.state + ' ' + c.hue());
	}
	
    return self;
}

module.exports = SetColour;
