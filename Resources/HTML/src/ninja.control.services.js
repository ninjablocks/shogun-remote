/*global $: true,
    console: true,
    namespace: true,
    setTimeout: true,
    Pusher: true,
    ninjablocks: true,
    ninja: true,	// A ninja is always there, always watching.
    yourmum: true,	// Your mum is just always available.
    _: true
 */

(function(ns) {

	var api;
	var userAccessToken;

	var devices;

	var pendingState = {};

	$.subscribe('control.device.state.update', function(topic, device, state, button) {

		if (typeof state !== 'string') {
			state = JSON.stringify(state);
		}

		var d = ninja.control.store.getDevice(device);

		if (!pendingState[d.node]) {
			pendingState[d.node] = [];
		}

		pendingState[d.node].push({device:d, state: state, button: button});

		sendPendingState(); // debounced... cuts down on traffic to/from Ti, and allows us to potentially multi-actuate later
	});

	function sendStates(node, states) {
		Ti.App.fireEvent('control.states', {node:node, states:states});
	}

	var sendPendingState = _.debounce(function sendPendingState() {
		console.log('sendpendingstate', JSON.stringify(pendingState));

		var working = pendingState;
		pendingState = {};

		_.each(working, function(states, node) {
			sendStates(node, states);
		});

	}, 1);

})(namespace('ninja.control.services'));
