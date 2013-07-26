var me = {};

module.exports = me;

me.getServer = function() {
	return 'https://api.ninja.is'; // TODO: Add beta mode check here!
}

var updateInterval;
me.startUpdating = function() {
	me.stopUpdating();
	
	updateInterval = setInterval(me.updateAll, 60000);
	me.localIps.update();
	me.rules.update();
};

me.updateAll = function() {
	me.devices.update();
	me.localIps.update();
	me.rules.update();
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
		token = t;
		Ti.App.Properties.setString('token', token);
		if (token) {
			me.startUpdating();
		}
	}
};

var buttons;
me.buttons = {
	get: function() {
		buttons = Ti.App.Properties.getObject('buttons.' + token);
		if (!buttons || buttons.length == 0) {
			l('Setting default buttons');
			buttons = require('./defaultButtons');
			me.buttons.save();
		}
		return buttons;
	},
	save: function(b) {
		buttons = b;
		Ti.App.Properties.setObject('buttons.' + token, buttons);
	}
}

var devices = Ti.App.Properties.getObject('devices') || {};
me.devices = {
	get: function(cb) {
		if (devices) {
			cb(devices);
		} else {
			me.devices.update(cb);
		}
	},
	save: function(d) {
		l('Saving ' + _.keys(d).length + ' devices');
		devices = d;
		Ti.App.Properties.setObject('devices', devices);
	},
	update: function(cb) {
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

var rules = Ti.App.Properties.getObject('rules');
me.rules = {
	get: function(cb) {
		if (rules) {
			cb(rules);
		} else {
			me.rules.update(cb);
		}
	},
	save: function(r) {
		l('Saving ' + r.length + ' rules');
		rules = r;
		Ti.App.Properties.setObject('rules', rules);
	},
	update: function(cb) {
		var client = Ti.Network.createHTTPClient({
			onload : function(e) {
				Ti.API.info("Received rules text: " + this.responseText);
				//alert('ajax success');
				var result = JSON.parse(this.responseText);
				me.rules.save(result.data);
	
				cb && cb(rules);
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
				Ti.API.info("Received blocks : " + this.responseText);
	
				var result = JSON.parse(this.responseText);
				
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
			Ti.API.info("Received user text: " + this.responseText);
			//alert('ajax success');
			var result = JSON.parse(this.responseText);
			user = result;

			Ti.API.info('Fetched user' + JSON.stringify(user));

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