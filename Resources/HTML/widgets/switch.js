// Has log, container, subscribe and publishState
// Events available 'state', 'activate',

var subscribe = this.subscribe,
	publishState = this.publishState,
	conatiner = this.container;

var state = true;

var onState = this.button.onState || '1';
var offState = this.button.offState || '0';

subscribe('state', function(data) {
	state = (data == onState);
	if (this.container) {
		this.container.removeClass('true false');
		this.container.addClass(state+'');
	}
});

subscribe('activate', function(complete) {
	state = !state;
	publishState(state?onState:offState);
	setTimeout(complete, 200);
});