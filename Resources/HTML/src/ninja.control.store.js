/*global $: true,
    console: true,
    namespace: true,
    setTimeout: true,
    localStorage: true,
    ninja: true,	// A ninja is always there, always watching.
    yourmum: true,	// Your mum is just always available.
    _: true
 */

(function(ns) {

	var token =  null;

	var devices;

	ns.getDevice = function(id) {
		for (var device in devices) {
			if (devices[device].guid === id) {
				return devices[device];
			}
		}
		return null;
	};

	ns.getDevicesByType = function(type) {
		return _.chain(devices).map(function(d) {return d;}).filter(function(d) {
			return d.device_type == type;
		}).value();
	};

	$.subscribe('ninja.devices', function(topic, d) {
		devices = d;
	});

	

	$.subscribe('control.button.update', function(topic, button) {
		console.group('Updating button', button.id);

		if (!buttons) {
			alert('updating too early!');
		}

		console.log('updating button', button);

		var oldButton = getButton(button.id);
		buttons = _.filter(buttons, function(b) {
			return b.id != button.id;
		});

		buttons.push(button);

		$.publish('control.button.updated.' + button.id, button, oldButton);

		console.groupEnd();
	});

})(namespace('ninja.control.store'));
