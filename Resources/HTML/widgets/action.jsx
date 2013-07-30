// The simplest possible widget.
// Just sends a state to a device

(function(opts) {
var container = opts.container,
	devices = opts.devices,
	log = opts.log,
	subscribe = opts.subscribe,
	publishState = opts.publishState,
	widget = opts.widget,
	button = opts.button;

subscribe('activate', function(complete) {
	publishState(button.state);
	complete();
});

});