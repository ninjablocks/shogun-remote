var LoginWindow = require('ui/LoginWindow');
var ApplicationWindow = require('ui/ApplicationWindow');

function RemoteApplication() {
	
	l('Building RemoteApplication');
	
	
	// These events are all fired from webkit
	Ti.App.addEventListener('control.ready', this.webkitReady.bind(this));
	
	Ti.App.addEventListener('control.button.confirmDelete', function(e) {
		this.onConfirmDelete(e.data[0]);
	}.bind(this));
	
	Ti.App.addEventListener('control.button.add', function(e) {
		this.onAddButton(e.button);
	}.bind(this));
	
	Ti.App.addEventListener('control.states', function(e) {
		this.onActuate(e.node, e.states);
	}.bind(this));
	
	Ti.App.addEventListener('control.button.move', function(e) {
		this.onMoveButton(e.data[0], e.data[1]);
	}.bind(this));
	
	Ti.App.addEventListener('control.button.update', function(e) {
		this.onUpdateButton(e.button);
	}.bind(this));
	
	if (Ninja.Data.token.get()) {
		this.start();
	} else {
		this.login();
	}
	
};

RemoteApplication.prototype.onUpdateButton = function(button) {
	var oldButton;
	
	var buttons = Ninja.Data.buttons.get();
	
	buttons = _.filter(buttons, function(btn) {
		if (btn.id == button.id) {
			oldButton = btn;
			return false;
		} else {
			return true;
		}
	});
	buttons.push(button);
	
	Ninja.Data.buttons.save(buttons);

	Ti.App.fireEvent('publish', {data:[button, oldButton], topic: 'control.button.updated'});
};

RemoteApplication.prototype.onAddButton = function(button) {
	var buttons = Ninja.Data.buttons.get();
	button.id = new Date().getTime();
	buttons.push(button);
	Ninja.Data.buttons.save(buttons);
	Ninja.App.fireWebkit('control.button.added', button);
};

RemoteApplication.prototype.onMoveButton = function(button, isTarget) {
	
	var buttons = Ninja.Data.buttons.get();

	var oldButton = _.filter(buttons, function(b) {return b.id == button.id;})[0];

	console.log('Button ', button.id, 'move from', oldButton.x, '-', oldButton.y, 'to', button.x, '-', button.y);

	if (!isTarget) {
		// We need to check if there was another button already in this spot, and swap with it.
		l('Searching for buttons already in this spot');
		var target = _.filter(buttons, function(b) {
			l('Checking', b, b.parent == button.parent, b.x == button.x, b.y == button.y);
			if (b.parent == button.parent && b.x == button.x && b.y == button.y) {
				return true;
			}
			return false;
		});
		l('Found', target);

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
};

RemoteApplication.prototype.login = function() {
	l('Showing login window');
	new LoginWindow(function(t) {
		Ninja.Data.token.save(t);
		this.start();
	}.bind(this)).open({animated:false});
};

RemoteApplication.prototype.start = function() {
	l('Showing main application window');
	var self = this;
	
	self.app = new ApplicationWindow();
	self.app.open({animated:false});
	
};

RemoteApplication.prototype.webkitReady = function() {

	l('Webkit is ready');
	
	Ninja.Data.devices.get(function(devices) {
		devices = JSON.parse(JSON.stringify(devices));
		devices['rule'] = {guid:'rule'}; // Fake device to allow actuation
		l('Devices are ready, sending to webkit');
		Ti.App.fireEvent('publish', {data:[Ninja.Data.buttons.get(), devices, Ninja.Data.widgets.get()], topic: 'control.load'});
	});

};

RemoteApplication.prototype.onConfirmDelete = function(btn) {
	l('Confirming delete of button button ' + JSON.stringify(btn));
	
	var confirm = Titanium.UI.createAlertDialog({
		title: 'Delete "' + btn.title + '"',
		message: 'Are you sure you want to delete this ' + (btn.type=='menu'?'group':'button') + '?',
	        buttonNames: ['Yes', 'No'],
	        cancel: 1
	});
	
	confirm.addEventListener('click', function(e){
		if (e.cancel === e.index || e.cancel === true) {
			l('Cancelling delete');
		} else {
			
			buttons = _.filter(buttons, function(b) {
				return b.id != btn.id;
			})
			saveButtons();
			
			Ti.App.fireEvent('publish', {data:[btn], topic: 'control.button.deleted'});
	    }
	
	    //confirm.close();
	}.bind(this));
	
	confirm.show();
}

RemoteApplication.prototype.onActuate = function(node, states) {
	
	var self = this;
	
	if (node == 'undefined') {
		statusbar.postMessageInProgress((states[0].state.state?'Enabling':'Disabling') + " rule '" + states[0].button.deviceName + "''");
	} else {
		statusbar.postMessageInProgress("Actuating device" + (states.length > 1?'s',''));
	}
	
	var localIps = Ninja.Data.localIps.get();
	var token = Ninja.Data.token.get();
	
	console.log("Got ips : " + localIps);

	var success = 0, error = 0;
	
	function checkComplete() {
		if (success + error == states.length) {
			if (error > 0) {
				statusbar.postImmediateErrorMessage('Device(s)' /*error + ' device' + (error>1?'s':'')*/ + ' failed to actuate.', 4.0);
			} else {
				statusbar.postImmediateFinishMessage("Command received successfully", 3.0);
			}
		}
	}

	Ti.API.info('Publishing node ' + node + ' states ' + JSON.stringify(states));

	states.forEach(function(state) {
		Titanium.API.info('Actuating device: ' + state.device.guid + ' with state: ' + state.state);
		
		if (state.device.guid === 'rule') {
			l('Its a rule... ');
			self.actuateRule(state.button.rule, state.state, function() {
				Titanium.API.info('Rule success. ' + state.button.rule);
				success++;
				checkComplete();
			}, function() {
				Titanium.API.info('Rule failed.' + state.button.rule + ' - ' + JSON.stringify(e));
				error++;
				checkComplete();
			})
			
			return;
		}
		
		var ips = JSON.parse(JSON.stringify(localIps[node] || []));
		ips.push('http://api.ninja.is')
		function tryNextIp() {
			Titanium.API.info('Trying block address : ' + ips[0]);

			var ip = ips.shift();
			var url = ip + '/rest/v0/device/' + state.device.guid + '?user_access_token=' + token;
			
			var client = Ti.Network.createHTTPClient({
				timeout: ip.indexOf('ninja.is') > -1? 3000 : 500,
				onload : function(e) {
					Titanium.API.info('IP success. ' + ip);
					success++;
					checkComplete();
				},
				// function called when an error occurs, including a timeout
				onerror : function(e) {
					Titanium.API.info('URL failed.' + url + ' - ' + JSON.stringify(e));
					if (ips.length) {
						setTimeout(tryNextIp, 50);
					} else {
						error++;
					}
					checkComplete();
				}
			});
		
			client.open('PUT', url);
			client.setRequestHeader("Content-Type", 'application/json');
			client.send(JSON.stringify({DA:state.state}));

		}

		setTimeout(tryNextIp, 50);
	});

};

RemoteApplication.prototype.actuateRule = function(ruleId, enabled, successCb, errorCb) {
	
	var token = Ninja.Data.token.get();
	
	var url = Ninja.Data.getServer() + '/rest/v0/rule/' + ruleId + '/suspend?user_access_token=' + token;;
	
	l('Actuating rule ' + url + ' with state ' + enabled);
			
	var client = Ti.Network.createHTTPClient({
		onload : successCb,
		// function called when an error occurs, including a timeout
		onerror :errorCb
	});

	client.open(enabled?'POST':'DELETE', url);
	client.setRequestHeader("Content-Type", 'application/json');
	client.send();
	
};

module.exports = RemoteApplication;