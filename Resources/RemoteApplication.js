var LoginWindow = require('ui/LoginWindow');
var ApplicationWindow = require('ui/ApplicationWindow');

function RemoteApplication() {
	
	l('Building RemoteApplication');
	
	Ti.App.addEventListener('control.ready', this.webkitReady.bind(this));
	
	Ti.App.addEventListener('control.button.confirmDelete', function(e) {
		this.confirmDelete(e.data[0]);
	}.bind(this));
	
	Ti.App.addEventListener('control.states', function(e) {
		this.onActuate(e.node, e.states);
	}.bind(this));
	
	
	if (Ninja.Data.token.get()) {
		this.start();
	} else {
		this.login();
	}
	
}

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
		l('Devices are ready, sending to webkit');
		Ti.App.fireEvent('publish', {data:[Ninja.Data.buttons.get(), devices, Ninja.Data.widgets.get()], topic: 'control.load'});
	});

};

RemoteApplication.prototype.confirmDelete = function(btn) {
	l('Confirming delete of button button ' + print(btn));
	
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
	statusbar.postMessageInProgress("Actuating device(s)");
	
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

module.exports = RemoteApplication;