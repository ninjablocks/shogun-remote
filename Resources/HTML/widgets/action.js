// The simplest possible widget.
// Just sends a state to a device


var container = this.container,
	button = this.button,
	devices = this.devices,
	log = this.log,
	subscribe = this.subscribe,
	publishState = this.publishState,
	widget = this.widget;


subscribe('activate', function(complete) {
	publishState(button.state);
	complete();
});