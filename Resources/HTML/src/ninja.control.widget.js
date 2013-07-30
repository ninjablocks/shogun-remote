/*global $: true,
    console: true,
    namespace: true,
    namespaceLog: true,
    setTimeout: true,
    localStorage: true,
    evalScoped: true,
    ninja: true,	// A ninja is always there, always watching.
    yourmum: true,	// Your mum is just always available.
    _: true
 */

(function(ns, log) {

	// Stores our widget html/css/js
	var source = {};

	var widgetScope = {};
	
	ns.load = function(s) {
		source = s;
	};

	function applyScopedWidgetStyle(style, scope, parentSelector){
		var css = '';
		var el = $('<style type="text/css"/>').text(style).appendTo('head');
		_.each(el[0].sheet.cssRules, function(rule) {
			css += ' ' + rule.cssText.replace(rule.selectorText, (scope + ' ' + rule.selectorText.replace(/this/g,parentSelector).replace(/,/g,',' + scope)).replace(new RegExp(' '+parentSelector, 'g'), parentSelector));
			//rule.selectorText =
		});
		el.remove();
		$('<style type="text/css"/>').text(css).appendTo('head');
		//el[0].sheet.title = 'Ninja widget styles scoped to ' + scope;
	}

	function getSource(id) {
		if (!source[id]) {
			source[id] = {};

			if (source[id].info) {
				try {
					source[id].info = JSON.parse(source[id].info);
					log('Widget id', id, 'info', source[id].info);
				} catch(e) {
					console.error('Bad widget info source', source[id].info, e);
				}

			}

			log('Got widget source', source[id]);
			if (source[id].css) {
				applyScopedWidgetStyle(source[id].css, '.widget-' + id, '.remote-button');
			}
		}
		return source[id];
	}

	ns.getHtml = function(id) {
		var s = getSource(id);
		if (!s.html && !s.css && !s.js) {
			s = getSource('unknown');
		}
		return s.html;
	};

	ns.build = function(id, button, parentButton, container) {

		log('Building widget', id, 'for button', button);

		var widget = getSource(id);

		widgetScope[id] = widgetScope[id] || {firstRun:true};

		if (!widget.html && !widget.css && !widget.js) {
			log('Unknown widget!', id);
			getSource('unknown');
		}


		var devices = [];

		function updateWidgetDevices() {

			console.log('Updating widget devices for ', button);
			devices = [];

			function findIds(deviceIds) {
				_.each(deviceIds, function(id) {
					var device = ninja.control.store.getDevice(id);
					log('Found device', device, 'for id', id);
					if (device) {
						devices.push(device);
					} else {
						if (container) {
							container.addClass('missing-device');
						} else {
							log("Missing device", id, 'for button', button, 'parent button', parentButton);
						}
					}
				});
			}


			if (button.device_type) { // Best : Own device type(s)
				var types = button.device_type;
				if (!_.isArray(types)) {
					types = [types];
				}
				devices = [];
				_.each(types, function(type) {
					devices = _.union(devices, ninja.control.store.getDevicesByType(type));
				});

			} else if (button.devices) { // Next Best : Own Device list
				findIds(button.devices);
			} else if (parentButton) {
				if (parentButton.device_type) { // Third best : Parent device type(s)
					var t = parentButton.device_type;
					if (!_.isArray(t)) {
						t = [t];
					}
					devices = [];
					_.each(t, function(type) {
						devices = _.union(devices, ninja.control.store.getDevicesByType(type));
					});
				} else if (parentButton.devices) { // Final chance : Parent device list
					findIds(button.devices);
				}
			}
		}

		updateWidgetDevices();

		$.subscribe('ninja.devices', updateWidgetDevices);

		var instance = {
			container: container,
			button: button,
			parentButton: parentButton,
			devices: devices,
			widget: widgetScope[id],
			log: namespaceLog('> Widget ' + id + '[button ' + button.id + ']'),
			publishState: function(state, d) {
				console.log('widget publishing state', state, 'to device', d);
				if (!d) {
					d = devices;
				}
				_.each(d, function(device) {
					var id = device.guid?device.guid:device;
					$.publishAsync('control.device.state.update.' + id, id, state, button);
				});
			},
			subscribe: function(channel, callback, d) {
				var that = this;

				callback = _.bind(callback, instance);

				if (!d) {
					d = devices;
				}

				if (channel == 'activate') {
					$.subscribe('control.button.activate.'+button.id, function(topic, button, complete) {
						callback(complete);
					});
				} else if (channel == 'updated') {
					$.subscribe('control.button.updated.'+button.id, function(topic, button) {
						that.button = button;
						callback(button);
					});
				} else if (channel == 'state') {
					_.each(d, function(device) {
						var id = device.guid || device;
						log("Widget listening to state on ", 'control.device.state.updated.',id);

						$.subscribe('control.device.state.updated.'+id, function(topic, dev, state) {
							callback(state, dev);
						});
					});
				} else if (channel == 'localstate') {
					_.each(d, function(device) {
						var id = device.guid || device;
						log("Widget listening to local state on ", 'control.device.state.update.',id);

						$.subscribe('control.device.state.update.'+id, function(topic, dev, state) {
							callback(state, dev);
						});
					});
				} else {
					console.warn("Widget is listening on an unknown channel ->", channel);
				}
			}
		};

		if (!widget.fn) {
			console.log('Evaluation widget js ' + widget.js);
			try {
				widget.fn = eval(widget.js);
				console.log('Evaluated : ' + widget.fn);
			} catch(e) {
				console.error('Failed to eval widget ' + button.widget + ' ' + e.message);
			}
		}
		
		try {
			widget.fn(instance);
		} catch(e) {
			console.error('Failed to initialise widget ' + button.widget + ' ' + e.message);
		}

		widgetScope[id].firstRun = false;

		log('Built widget', instance);

		return instance;
	};

})(namespace('ninja.control.widget'), namespaceLog('control.widget >'));
