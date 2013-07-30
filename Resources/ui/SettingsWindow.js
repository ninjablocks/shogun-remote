var ButtonsEditor = require('ui/ButtonsEditor');

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
		Ninja.Data.buttons.reset();
	    Ti.App.fireEvent('reload');
		win.close();
	});
	
	win.add(reset);
	
	var update = Titanium.UI.createButton({
		title:'Update Devices, Rules and IPs',
		width: '80%',
		top: 10
	});
	ios && (update.color = "#5a5570");
	
	update.addEventListener("click", function() {
	    Ninja.Data.updateAll(true);
	    statusbar.postMessage('Updating Devices, Rules and Local IPs', 3);
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
		Ninja.Data.token.save(null);
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
	
	
	
	var reload = Titanium.UI.createButton({
		title:'Reload Remote Window',
		width: '80%',
		top: 10
	});
	ios && (reload.color = "#5a5570");
	
	reload.addEventListener("click", function() {
		Ti.App.fireEvent('reload');
		win.close({animated:false});
	});
	
	reload.visible = developerMode;
	win.add(reload);
	
	var editButtons = Titanium.UI.createButton({
		title:'Edit Raw Configuration',
		width: '80%',
		top: 10
	});
	ios && (editButtons.color = "#5a5570");
	
	editButtons.addEventListener("click", function() {
		win.close({animated:false});
		statusbar.postMessage('Entering the matrix....', 3);
		var editor = new ButtonsEditor(Ninja.Data.buttons.get(), function(buttons) {
			Ninja.Data.buttons.save(buttons);
			Ti.App.fireEvent('reload');
			editor.close();
		});
		setTimeout(function() {
			editor.open({modal:true});
		}, 2000);
		
	});
	
	editButtons.visible = developerMode;
	win.add(editButtons);
	
	Ti.App.addEventListener('developerMode', function(e) {
		sendLog.visible = developerMode;
		reload.visible = developerMode;
		editButtons.visible = developerMode;
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
