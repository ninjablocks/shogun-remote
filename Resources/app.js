var osname = Ti.Platform.osname,
	ios = (osname === 'iphone' || osname === 'ipad');

var LoginWindow = require('ui/LoginWindow'),
	ApplicationWindow = require('ui/ApplicationWindow'),
	_ = require('lib/underscore-1.4.4'),
	Ninja = {UI:require('lib/Ninja.UI')};

Titanium.include("lib/node-ninja-blocks.js");

var statusbar;
if (ios) {
	require('com.yydigital.tintswitch');
	statusbar = require('mattapp.statusbar');
} else {
	statusbar = {};
	
	var nid = 0;
	var lastMessage = null;
	
	statusbar.postMessage = statusbar.postImmediateErrorMessage = statusbar.postImmediateFinishMessage = function(text, durationSeconds) {
		/*Ti.UI.createNotification({
			message: text,
			duration: Titanium.UI.NOTIFICATION_DURATION_SHORT
		}).show();*/
		
		if (text == lastMessage) {
			return;
		}
		lastMessage = text;
		
		Titanium.Android.NotificationManager.cancelAll();
		
		var x = nid++;
		Titanium.Android.NotificationManager.notify(
        x, // <-- this is an ID that we can use to clear the notification later
        Ti.Android.createNotification({
            contentTitle: text,
           // contentText: 'Swiss',
            tickerText: text
        }));
        
        setTimeout(function() {
        	Titanium.Android.NotificationManager.cancel(x);
        }, durationSeconds * 1000)

	};

	statusbar.postMessageInProgress = function(text) {
		/*Ti.UI.createNotification({
			message: text,
			duration: Titanium.UI.NOTIFICATION_DURATION_SHORT
		}).show();*/
		
		if (text == lastMessage) {
			return;
		}
		lastMessage = text;
		
		Titanium.Android.NotificationManager.cancelAll();
		
		Titanium.Android.NotificationManager.notify(
        0, // <-- this is an ID that we can use to clear the notification later
        Ti.Android.createNotification({
            contentTitle: text,
           // contentText: 'Swiss',
            tickerText: text
        }));
	};

}

Ti.API.info('NinjaBlocks starting up. IOS?' + ios);

var developerMode = Ti.App.Properties.getBool('developerMode');

function setDeveloperMode(mode) {
	developerMode = mode;

	statusbar.postMessage('Ninja mode - ' + (mode?'Enabled':'Disabled'), 3);
	Ti.App.Properties.setBool('developerMode', developerMode);

	if (!mode) {
		setWakaiMode(false, true);
	}
}

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

var defaultButtons = require('./defaultButtons');


var devices, buttons, localIps = Ti.App.Properties.getObject('localIps') || {};


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

function saveLocalIps() {
	Ti.App.Properties.setObject('localIps', localIps);
}

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

	var newDevices = e.data[0];

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

var token = Ti.App.Properties.getString('token');

if (token) {
	devices = Ti.App.Properties.getObject('devices.' + token) || null;
	loadButtons();
}

function loadButtons() {
	buttons = Ti.App.Properties.getObject('buttons.' + token);
	if (!buttons || buttons.length == 0) {
		Ti.API.log("Setting default buttons : " + JSON.stringify(defaultButtons));
		buttons = defaultButtons;
		saveButtons();
	}
}

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
		l("We are ready. Sending buttons and devices to webview");

		Ti.App.fireEvent('publish', {data:[buttons, devices], topic: 'control.load'});
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
		fetchRules();

		onReady();


	} else {

		var login = new LoginWindow(function(t) {
			Ti.App.Properties.setString('token', t);
			start();
		}).open({animated:false});
	}

}

function fetchDevices() {
	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			//alert('ajax success');
			var result = JSON.parse(this.responseText);
			var devices = result.data;

			var filteredDevices = {};

			for (var id in devices) {
				devices[id].guid = id;
				if (devices[id].did != 999) {
					filteredDevices[id] = devices[id];
				}
			}

			Ti.App.fireEvent('publish', {data:[filteredDevices], topic: 'ninja.devices'});
		},
		// function called when an error occurs, including a timeout
		onerror : onHttpError('fetching devices')
	});

	client.open('GET', 'https://api.ninja.is/rest/v0/devices?user_access_token=' + token);
	client.setRequestHeader("Content-Type", 'application/json');
	client.send();
}

function fetchRules() {
	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received rules text: " + this.responseText);
			//alert('ajax success');
			var result = JSON.parse(this.responseText);
			var rules = result.data;

			Ti.App.fireEvent('ninja.rules', {rules:rules});
		},
		// function called when an error occurs, including a timeout
		onerror : onHttpError('fetching rules')
	});

	client.open('GET', 'https://api.ninja.is/rest/v0/rule?user_access_token=' + token);
	client.setRequestHeader("Content-Type", 'application/json');
	client.send();
}

function publishUser() {
	Ti.API.info('Publishing user');

	Ti.App.fireEvent('publish', {data:[user], topic: 'ninja.user'});
}

function fetchUser() {
	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received text: " + this.responseText);
			//alert('ajax success');
			var result = JSON.parse(this.responseText);
			user = result;

			Ti.API.info('Fetched user' + JSON.stringify(user));

			if (devices && !userPublished) {
				publishUser();
			}
		},
		// function called when an error occurs, including a timeout
		onerror : onHttpError('fetching user')
	});

	client.open('GET', 'https://api.ninja.is/rest/v0/user?user_access_token=' + token);
	client.setRequestHeader("Content-Type", 'application/json');
	client.send();
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
		fetchRules();
	}
}, 1000 * 60);
//*/
Ti.App.addEventListener('fetchDevices', fetchDevices);

Ti.App.addEventListener('restart', function() {
	Ti.API.info("Restarting web view");
	token = null;
	devices = null;
	started = false;

	//Ti.App.fireEvent('publish', {data:[], topic: 'control.restart'});
	controlReady = false;
	widgetsReady = false;

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


Ti.App.addEventListener('control.states', function(e) {
	statusbar.postMessageInProgress("Actuating device(s)");

	var success = 0, error = 0;

	Ti.API.info('Publishing node ' + e.node + ' ips ' + JSON.stringify(e.ips) + ' states ' + JSON.stringify(e.states));

	e.states.forEach(function(state) {
		Titanium.API.info('Actuating device: ' + state.device.guid + ' with state: ' + state.state);

		var ips = JSON.parse(JSON.stringify(localIps[e.node] || []));
		ips.push('http://api.ninja.is')
		function tryNextIp() {
			Titanium.API.info('Trying block address : ' + ips[0]);

			var ip = ips.shift();

			api.device(state.device.guid).actuate(state.state, function(result,x,y) {
				Titanium.API.info('returned from actuation', JSON.stringify(result.error));
				if (result.error) {
					if (ips.length) {
						Titanium.API.info('IP failed.' + ip);
						setTimeout(tryNextIp, 50);
					} else {
						error++;
					}
				} else {
					success++;
				}

				if (success + error == e.states.length) {
					if (error > 0) {
	    				statusbar.postImmediateErrorMessage('Device(s)' /*error + ' device' + (error>1?'s':'')*/ + ' failed to actuate.', 4.0);
					} else {
						statusbar.postImmediateFinishMessage("Command received successfully", 3.0);
					}
				}
			}, ip + '/rest/v0/', ip.indexOf('ninja.is') > -1? 3000 : 500);


		}

		setTimeout(tryNextIp, 50);
	});

});



function updateLocalIps() {

	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			Ti.API.info("Received blocks : " + this.responseText);

			var result = JSON.parse(this.responseText);
			Ti.API.info(JSON.stringify(result.data));

			for (var nodeId in result.data) {

				(function() {
					var node = nodeId;


					Ti.API.info('Requesting network config for block ' + node);
					var client = Ti.Network.createHTTPClient({
						onload : function(e) {
							Ti.API.info("Received block network config: " + this.responseText);

							var result = JSON.parse(this.responseText);

							var ips = [];
							_.each(result, function(addresses) {
								_.each(addresses, function(address){
									console.log('found address',address, !address.internal && !address.family == 'IPv6');
									if (!address.internal && address.family == 'IPv4') {
										ips.push('http://'+address.address+':8000');
									}
								});
							});
							localIps[node] = ips;
							
							if (ips.length > 0) {
								statusbar.postMessage('Found local block IP ' + ips[0], 1);
							}
							saveLocalIps();
						},
						onerror : function(e) {
							console.log('Error getting local ip for node', node, e)
						}
					});
					//Synch version -> /rest/v0/block/{blockId}/network
					//https://wakai.ninja.is/rest/v0/block/2712BB000612/network?user_access_token=gN4xvn4YCtPYnZeURZKO8sKaHcH7MfN0rGLyVe0
					client.open('GET', 'https://api.ninja.is/rest/v0/block/' + node + '/network?user_access_token=' + token);
					client.setRequestHeader("Content-Type", 'application/json');
					client.send();

				})();

			};

		},
		onerror : function(e) {
			console.log('Error getting list of blocks for local ip fetch', e);
		}
	});


	client.open('GET', 'https://api.ninja.is/rest/v0/blocks?user_access_token=' + token);
	client.setRequestHeader("Content-Type", 'application/json');
	client.send();

}

function loadWidgets() {
	var source = {};

	var path = 'HTML/widgets';

	Titanium.Filesystem.getFile(path).getDirectoryListing().forEach(function(file) {
		var type = file.substr(file.indexOf('.') + 1);
		var id = file.substr(0, file.indexOf('.'));
		file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "HTML/widgets/" + file);
		var blob = file.read();
		var readText = blob.text;

		source[id] = source[id] || {};
		source[id][type] = readText;
	});

	l('Loaded source ' + JSON.stringify(source));

	Ti.App.fireEvent('widgets.loaded', {source: source});
}

start();

//Titanium.include('pusher.js');

function l(x) {
	Ti.API.info(x);
}
