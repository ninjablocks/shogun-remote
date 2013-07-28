
function SettingsWindow(button, parentButton) {
	
	l('SettingsWindow Initialising');
	
	var gong = Ti.Media.createSound({url:"/sound/Asian Gong Stinger.wav"}),
		hiyaa = Ti.Media.createSound({url:"/sound/hiyaa.wav"});
	
	var playHiyaa = false;

    var win = Ninja.UI.createWindow({
    	title: 'Settings'
    });
    
    if (ios) {
    	win.barImage = 'nav_bar_bg_settings.png';
    	win.modal = true;
    }
    
    if (!ios) {
    	win.backgroundColor = '#ffffff';
    }
	
	var close = Ninja.UI.createSaveButton({
	    title: "Close"
	});
	
	close.addEventListener("click", function() {
		if (playHiyaa) {
			hiyaa.play();
		}
	    win.close();
	});
	
	win.setRightNavButton(close);
	
	var reset = Titanium.UI.createButton({
		title:'Reset Buttons',
		width: '80%',
		top: 10
	});
	
	ios && (reset.color = "#5a5570");
	
	reset.addEventListener("click", function() {
		Ti.App.Properties.setObject('buttons.' + token, []);
	    Ti.App.fireEvent('restart');
	    reset.enabled = false;
	    setTimeout(function() {   
	    	reset.enabled = true; 	
		    win.close();
	    }, 3000);
	});
	
	win.add(reset);
	
	var update = Titanium.UI.createButton({
		title:'Update Devices, Rules and IPs',
		width: '80%',
		top: 10
	});
	ios && (update.color = "#5a5570");
	
	update.addEventListener("click", function() {
	    Ninja.Data.updateAll();
		win.close();
	});
	
	win.add(update);
	
	var logout = Titanium.UI.createButton({
		title:'Log Out',
		width: '80%',
		top: 10
	});
	ios && (logout.color = "#5a5570");
	
	logout.addEventListener("click", function() {
		Ti.App.Properties.setString('token', null);
		win.close({animated:false});
		setTimeout(function() {
			Ti.App.fireEvent('restart');
		}, 1500);
		
	});
	
	win.add(logout);

	var devModeView = Ti.UI.createView({
		layout: 'horizontal',
		width: '80%',
		height: 50,
		top: 20
	});
	devModeView.add(Ti.UI.createLabel({
		text: 'Ninja Mode',
		width: '50%'
	}));

	var devModeSwitch = Ti.UI.createSwitch({
		value:developerMode || false,
		left: 40,
		height: 50
	});
	
	if (ios) {
		devModeSwitch.onTint = "#54577c";
	}
	devModeSwitch.addEventListener('change',function(e){
		setDeveloperMode(devModeSwitch.value);
		//wakaiModeView.visible = developerMode;
		if (developerMode) {
			gong.play();
			playHiyaa = true;
		} else {
			playHiyaa = false;
			//wakaiModeSwitch.value = false;
		}
	});
	devModeView.add(devModeSwitch);

	win.add(devModeView);
	
	
	var sendLog = Titanium.UI.createButton({
		title:'Send Debug Log to NinjaBlocks',
		width: '80%',
		top: 10
	});
	ios && (sendLog.color = "#5a5570");
	
	sendLog.addEventListener("click", function() {
		sendLogHistory();
	});
	
	sendLog.visible = developerMode;
	win.add(sendLog);
	
	Ti.App.addEventListener('developerMode', function(e) {
		sendLog.visible = developerMode;
	});
	
	/*var wakaiModeView = Ti.UI.createView({
		layout: 'horizontal',
		width: '80%',
		visible: !!developerMode,
		top: 20
	});
	wakaiModeView.add(Ti.UI.createLabel({
		text: 'Wakai Server',
		width: '50%'
	}));

	var wakaiModeSwitch = Ti.UI.createSwitch({
  		onTint: "#54577c",
		value:wakaiMode,
		left: 40
	});
	wakaiModeSwitch.addEventListener('change',function(e){
		setWakaiMode(wakaiModeSwitch.value);
		if (wakaiMode) {
			hiyaa.play();
		}
	});
	wakaiModeView.add(wakaiModeSwitch);

	win.add(wakaiModeView);*/
    return win;
}

module.exports = SettingsWindow;
