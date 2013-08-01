var me = {};

module.exports = me;

var backgrounded = false;
Ti.App.addEventListener('pause',function(e){
   Ti.API.info("Ninja in background");
   backgrounded = true;
});

Ti.App.addEventListener('resume',function(e){
    Ti.API.info("Ninja in foreground");
    backgrounded = false;
});

me.getServer = function() {
	return 'https://api.ninja.is'; // TODO: Add beta mode check here!
}

var updateInterval;
me.startUpdating = function() {
	me.stopUpdating();
	
	updateInterval = setInterval(me.updateAll, 180000);
	me.localIps.update();
	me.rules.update();
};

me.updateAll = function(force) {
	if (!backgrounded || force) {
		me.devices.update();
		me.localIps.update();
		me.rules.update();
	}
};

me.stopUpdating = function() {
	if (updateInterval) clearInterval(updateInterval);
};

var token = Ti.App.Properties.getString('token');
me.token = {
	get: function() {
		return token;
	},
	save: function(t) {
		l("Saving token : " + t);
		token = t;
		Ti.App.Properties.setString('token', token);
		if (token) {
			me.startUpdating();
		} else {
			me.stopUpdating();
		}
		me.buttons.get();
	}
};

me.buttons = {
	get: function() {
		var buttons = Ti.App.Properties.getObject('buttons.' + token);
		l('Got ' + (buttons?buttons.length:0) + ' buttons');
		if (!buttons || buttons.length == 0) {
			l('Setting default buttons');
			me.buttons.reset();
		}
		l('Returning buttons');
		return buttons;
	},
	reset: function() {
		me.buttons.save(require('lib/defaultButtons'));
	},
	save: function(b) {
		l('Saving buttons ' + JSON.stringify(b));
		buttons = b;
		Ti.App.Properties.setObject('buttons.' + token, buttons);
	}
}

if (token) {
	me.buttons.get();
}

me.devices = {
	get: function(cb) {
		var devices = Ti.App.Properties.getObject('devices'+token);
		if (devices && _.keys(devices).length) {
			cb(devices);
		} else {
			me.devices.update(cb);
		}
	},
	save: function(d) {
		var old = Ti.App.Properties.getObject('devices'+token);
		if (!old || _.keys(d).length != _.keys(old).length) {
			Ninja.App.fireWebkit('ninja.devices', d);
		}
		l('Saving ' + _.keys(d).length + ' devices');
		Ti.App.Properties.setObject('devices'+token, d);
	},
	update: function(cb) {
		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				l("Received text: " + this.responseText);
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
				
				me.devices.save(filteredDevices);
				cb && cb(filteredDevices);
			},
			// function called when an error occurs, including a timeout
			onerror : Ninja.App.onHttpError('fetching devices')
		});
	
		client.open('GET', 'https://api.ninja.is/rest/v0/devices?user_access_token=' + token);
		client.setRequestHeader("Content-Type", 'application/json');
		client.send();
	}
};

me.rules = {
	get: function(cb) {
		var rules = Ti.App.Properties.getObject('rules'+token);
		if (rules && rules.length) {
			cb(rules);
		} else {
			me.rules.update(cb);
		}
	},
	save: function(r) {
		l('Saving ' + r.length + ' rules');
		Ti.App.Properties.setObject('rules'+token, r);
	},
	update: function(cb) {
		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				l("Received rules text: " + this.responseText);
				//alert('ajax success');
				var result = JSON.parse(this.responseText);
				me.rules.save(result.data);
	
				cb && cb(result.data);
			},
			// function called when an error occurs, including a timeout
			onerror : Ninja.App.onHttpError('fetching rules')
		});
	
		client.open('GET', 'https://api.ninja.is/rest/v0/rule?user_access_token=' + token);
		client.setRequestHeader("Content-Type", 'application/json');
		client.send();
	}
};

var localIps = Ti.App.Properties.getObject('localIps') || {};
me.localIps = {
	get: function(cb) {
		return localIps;
	},
	save: function() {
		l('Saving ' + _.keys(localIps).length + ' localIps');
		Ti.App.Properties.setObject('localIps', localIps);
	},
	update: function() {

		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				l("Received blocks : " + this.responseText);
	
				var result = JSON.parse(this.responseText);
				
				for (var nodeId in result.data) {
	
					(function() {
						var node = nodeId;
	
						l('Requesting network config for block ' + node);
						var client = Ti.Network.createHTTPClient({
							onload : function(e) {
								l("Received block network config: " + this.responseText);
	
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
								me.localIps.save();
							},
							onerror : function(e) {
								console.log('Error getting local ip for node', node, e)
							}
						});
						//Synch version -> /rest/v0/block/{blockId}/network
						//https://wakai.ninja.is/rest/v0/block/2712BB000612/network?user_access_token=gN4xvn4YCtPYnZeURZKO8sKaHcH7MfN0rGLyVe0
						client.open('GET', me.getServer() + '/rest/v0/block/' + node + '/network?user_access_token=' + token);
						client.setRequestHeader("Content-Type", 'application/json');
						client.send();
	
					})();
	
				};
	
			},
			onerror : function(e) {
				console.log('Error getting list of blocks for local ip fetch', e);
			}
		});
	
	
		client.open('GET', me.getServer() + '/rest/v0/blocks?user_access_token=' + token);
		client.setRequestHeader("Content-Type", 'application/json');
		client.send();
	}
}


/*
function fetchUser() {
	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			l("Received user text: " + this.responseText);
			//alert('ajax success');
			var result = JSON.parse(this.responseText);
			user = result;

			l('Fetched user' + JSON.stringify(user));

			if (devices && !userPublished) {
				publishUser();
			}
		},
		// function called when an error occurs, including a timeout
		onerror : Ninja.App.onHttpError('fetching user')
	});

	client.open('GET', 'https://api.ninja.is/rest/v0/user?user_access_token=' + token);
	client.setRequestHeader("Content-Type", 'application/json');
	client.send();
}*/

/**
 * Loads all the widget html, css and js.
 */
module.exports.widgets = {
	get: function() {
		var source = {};
	
		var path = 'HTML/widgets';
	
		Titanium.Filesystem.getFile(path).getDirectoryListing().forEach(function(file) {
			var type = file.substr(file.indexOf('.') + 1);
			
			if (type == 'jsx') {
				type = 'js';
			}
			
			var id = file.substr(0, file.indexOf('.'));
			file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "HTML/widgets/" + file);
			var blob = file.read();
			if (blob && blob.text) {
				var readText = blob.text;
	
				source[id] = source[id] || {};
				source[id][type] = readText;
			}
		});
	
		//l('Loaded source ' + JSON.stringify(source));
	
		return source;
	}
}

if (token) {
	me.startUpdating();
}