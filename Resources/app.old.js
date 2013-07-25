var osname = Ti.Platform.osname,
	ios = (osname === 'iphone' || osname === 'ipad');

var LoginWindow = require('ui/LoginWindow'),
	ApplicationWindow = require('ui/ApplicationWindow'),
	_ = require('lib/underscore-1.4.4'),
	Ninja = {UI:require('lib/Ninja.UI'), App:require('lib/Ninja.App')};

Titanium.include("lib/node-ninja-blocks.js");

Ti.API.info('NinjaBlocks starting up. IOS?' + ios);



var wakaiMode = Ti.App.Properties.getBool('wakaiMode');

function setWakaiMode(mode, hideMessage) {
	wakaiMode = mode;

	if (!hideMessage) {
		statusbar.postMessage('Wakai mode - ' + (mode?'Enabled':'Disabled'));
	}
	Ti.App.Properties.setBool('wakaiMode', wakaiMode);
}

// Logging

function print(o) {
	return JSON.stringify(o).replace(/\s+/g, ' ');
}

Ti.App.addEventListener('*', function(e) {
	 Ti.API.info('Evt: ' + e.topic + ' - ' + print(e.data));
});
Ti.App.addEventListener('webview.log', function(e) {
	 Ti.API.info('Web: ' + e.level + '-' + e.data);
});



var statusbar = require('./ui/StatusBar');

var user, userPublished = false;
var blocksSeen = {};

var api;

var onHttpError = function(task) {
	return function(e) {
		Ti.API.error('Status: ' + JSON.stringify(e));
	    Ti.API.error('ResponseText: ' + this.responseText);
	    Ti.API.error('connectionType: ' + this.connectionType);
	    Ti.API.error('location: ' + this.location);
	    statusbar.postImmediateErrorMessage('Network error ' + task, 3);
	};
}

function saveButtons() {
	Ti.App.Properties.setObject('buttons.' + token, buttons);
}

Ti.App.addEventListener('control.button.confirmDelete', function(e) {
	var btn = e.data[0];

	Ti.API.info('Confirming delete of button button ' + print(btn));
	
	var confirm = Titanium.UI.createAlertDialog({
		title: 'Delete "' + btn.title + '"',
		message: 'Are you sure you want to delete this ' + (btn.type=='menu'?'group':'button') + '?',
	        buttonNames: ['Yes', 'No'],
	        cancel: 1
	});
	
	confirm.addEventListener('click', function(e){
		if (e.cancel === e.index || e.cancel === true) {
			Ti.API.info('CANCELLING');
		} else {
			
			buttons = _.filter(buttons, function(b) {
				return b.id != btn.id;
			})
			saveButtons();
			
			Ti.App.fireEvent('publish', {data:[btn], topic: 'control.button.deleted'});
	    }
	
	    //confirm.close();
	});
	
	confirm.show();
});

Ti.App.addEventListener('control.button.add', function(e) {
	e.button.id = new Date().getTime();
	buttons.push(e.button);
	saveButtons();
	Ti.App.fireEvent('publish', {data:[e.button], topic: 'control.button.added'});
});

Ti.App.addEventListener('control.button.move', function(e) {
	Ti.API.log('Moving ' + JSON.stringify(e));

	var button = e.data[0], isTarget = e.data[1];
	
	var oldButton = _.filter(buttons, function(b) {return b.id == button.id;})[0];

	console.log('Button ', button.id, 'move from', oldButton.x, '-', oldButton.y, 'to', button.x, '-', button.y);

	if (!isTarget) {
		// We need to check if there was another button already in this spot, and swap with it.
		console.debug('Searching for buttons already in this spot');
		var target = _.filter(buttons, function(b) {
			console.log('Checking', b, b.parent == button.parent, b.x == button.x, b.y == button.y);
			if (b.parent == button.parent && b.x == button.x && b.y == button.y) {
				return true;
			}
			return false;
		});
		console.debug('Found', target);

		if (target.length) {
			target = _.clone(target[0]);
			target.x = oldButton.x;
			target.y = oldButton.y;

			Ti.App.fireEvent('control.button.move', {data:[target, true]});
		}
	}

	if (button.type == 'menu') {

		var childTarget = _.filter(buttons, function(b) {
			if (b.parent == button.id && b.x == button.x && b.y == button.y) {
				return true;
			}
			return false;
		});

		if (childTarget.length) {

			childTarget = _.clone(childTarget[0]);
			childTarget.x = oldButton.x;
			childTarget.y = oldButton.y;
			
			Ti.App.fireEvent('control.button.update', {button: childTarget});

		}
	}

	Ti.App.fireEvent('control.button.update', {button: button});
});

Ti.App.addEventListener('control.button.update', function(e) {
	var oldButton;
	buttons = _.filter(buttons, function(btn) {
		if (btn.id == e.button.id) {
			oldButton = btn;
			return false;
		} else {
			return true;
		}
	});
	buttons.push(e.button);
	saveButtons();
	Ti.App.fireEvent('publish', {data:[e.button, oldButton], topic: 'control.button.updated'});
});

Ti.App.addEventListener('ninja.devices', function(e) {

	var newDevices = e.devices;
	Ti.API.info('Fetched ' + newDevices.length + ' devices.');

	if (!devices || Object.keys(newDevices).length != Object.keys(devices).length) {
		statusbar.postMessage('Found ' + Object.keys(newDevices).length + ' Ninja devices', 2);
	}

	devices = newDevices;
	Ti.App.Properties.setObject('devices.' + token, devices);

	onReady();

});

Ti.App.addEventListener('ninja.rules', function(e) {
	rules = e.rules;
});



Ti.API.warn('BUILDING A NEW APPLICATION');
var app;

function createApplicationWindow() {
	app = new ApplicationWindow();
	app.visible = !!token;
	app.open({animated:false});
}

ios && createApplicationWindow();

var started = false;
function onReady() {
	l("OnReady- controlReady?" + !!controlReady + " token?" + !!token + " started?" + started + ' devices? ' + !!devices);
	if (controlReady && token && devices && !started) {
		loadButtons();
		
		started = true;
		l("We are ready. Sending buttons and devices and widgets to webview");

		Ti.App.fireEvent('publish', {data:[buttons, devices, widgets], topic: 'control.load'});
		app.visible = true;

		//fetchUser();

		updateLocalIps();

	}
}
var widgetsReady = false;
Ti.App.addEventListener('widgets.ready', function(e) {
	widgetsReady = true;
	onReady();
});

function start() {

	token = Ti.App.Properties.getString('token');

	if (token) {
		if (!app) {
			createApplicationWindow();
		}

		api = ninjablocks.app({user_access_token:token});

		fetchDevices();
		//fetchRules();

		onReady();


	} else {

		var login = new LoginWindow(function(t) {
			Ti.App.Properties.setString('token', t);
			start();
		}).open({animated:false});
	}

}



var backgrounded = false;
Ti.App.addEventListener('pause',function(e){
   Ti.API.info("Ninja in background");
   backgrounded = true;
});


Ti.App.addEventListener('resume',function(e){
    Ti.API.info("Ninja in foreground");
    backgrounded = false;
});


//* Fetch the users devices every 60 seconds, unless we're running in the background
setInterval(function() {
	if (!backgrounded && token) {
		fetchDevices();
		//fetchRules();
	}
}, 1000 * 60);
//*/
Ti.App.addEventListener('fetchDevices', fetchDevices);

Ti.App.addEventListener('restart', function() {
	Ti.API.info("Restarting web view");
	token = null;
	devices = null;

	//Ti.App.fireEvent('publish', {data:[], topic: 'control.restart'});
	controlReady = false;

	setTimeout(function() {
		Ti.API.info("Timeout. Lets go.");

		app.reload();

		start();

	}, 200);

});

var controlReady = false;

// We may be ready and have out token before the webview is ready to receive.....
Ti.App.addEventListener('control.ready', function(e) {
	controlReady = true;
	Ti.API.info("The control is ready... here is our token : " + token);
	loadWidgets();
	onReady();
});


start();

//Titanium.include('pusher.js');

function l(x) {
	Ti.API.info(x);
}
