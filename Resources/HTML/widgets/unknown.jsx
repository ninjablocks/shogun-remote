(function(opts) {
var container = opts.container,
	devices = opts.devices,
	log = opts.log,
	subscribe = opts.subscribe,
	publishState = opts.publishState,
	widget = opts.widget,
	button = opts.button;

container.find('widgetId').text(button.widget);
log('conatiner for unknown', container);

});