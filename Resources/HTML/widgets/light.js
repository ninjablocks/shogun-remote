var container = this.container,
	devices = this.devices,
	log = this.log,
	subscribe = this.subscribe,
	publishState = this.publishState,
	widget = this.widget,
	button = this.button;

var onComplete;

if (container) { // We may just be an action

	container.on('touchend', function() {
		
		if (onComplete) {
			onComplete();
		}
		
	});

	var editor = container.find('.editor');

	var last = null;


	container.on('touchmove', handleTouch);
	container.on('ninjatouchmove', function(e) {
		// This is a wrapped up event that's part of a longer chain of touch interaction.
		handleTouch(e.data);
	});

	function handleTouch(e) {

		console.log(e);

		var touch;
	
		if(e.touches.length == 1){
			touch = e.touches[0];
		}
	

		if (touch) {
			var pos = editor.offset();

			var x = (touch.clientX - pos.left) / editor.width(),
				y = (touch.clientY - pos.top) / editor.height();

			var colour = widget.findColour(x,y, false);

			try {

				//if (colour.hex() != last) {
				//	last = colour.hex();

					rateLimitedPublishColour(colour);
					//container.css('background-color', 'rgb(' + colour[0] + ',' + colour[1] + ',' + colour[2] + ')');

					console.log(colour.hex().substr(1));

					container.css({
						'background-color' : colour.hex(),
						'color' : getContrastYIQ(colour.hex().substr(1)) + ' !important'
					});

					/*container.parents('.remote').css({
						'background-color' : colour.hex(),
						'color' : getContrastYIQ(colour.hex().substr(1)) + ' !important'
					});*/
					
				//}
			} catch(ex) {
				console.error(ex);
			}
		
		}

		e.stopPropagation();

	}
}

function getContrastYIQ(hexcolor){
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);
	var yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? '#1D1E1D' : '#E9E9EA';
}

function publishColour(colour) {
	log('Publishing colour', colour, 'to ', devices.length, 'devices');
	
	_.each(devices, function(device) {
		var data;
		switch(device.device_type) {
			case "rgbled" : // Nina's eyes
			case "rgbled8" : // Limitless
				data = colour.hex().substring(1);
				break;
			case "light" : // Hue, Zigbee light etc
				data = {
					hue: Math.floor(colour.hue() * 65535),
					bri: Math.floor(colour.value() * 255),
					sat: Math.floor(colour.saturation() * 255),
					transitionTime: 1
				};

				data.on = (data.bri > 0);
				break;
			default:
				console.error('Unknown light device type', device);
		}
		log("Publishing data", JSON.stringify(data), "to device", device.guid);

		publishState(data, [device]);
	});
}

var rateLimitedPublishColour = _.debounce(_.throttle(publishColour, 300), 50);

subscribe('state', function(data) {
	//log('Got state', data);
	//container.css('background-color', '#' + data);
});

subscribe('activate', function(complete) {

	if (button.type == 'action') {
		// We are just being used to send a state, no ui of our own.
		if (button.state == 'off') {
			publishColour(one.color(button.state));
		} else {
			publishColour(one.color(button.state));
		}

		complete();
		
	} else {

		widget.startLean = widget.lean;

		onComplete = complete;
	}

});

subscribe('deactivate', function(complete) {

	container.parents('.remote').css({
		'background-color' : colour.hex(),
		'color' : getContrastYIQ(colour.hex().substr(1)) + ' !important'
	});

});



// The following is only run once as it can be reused for all the same type of widget.

if (widget.firstRun) {

	// Only have one of these canvases on the page!

	var ctx, canvas;
    var img = new Image();
    img.onload = function() {
		// Create an empty canvas element
		canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;
		// ES: Should I be hiding the canvas? Can't see it apparently...

		// Copy the image contents to the canvas
		ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);

		log('Colour wheel image loaded');
	};
    img.src = 'widgets/colour_picker.png';

    widget.findColour = function(x, y, useGyroscope) {
		//log('Finding colour at location ',x,y);
		x = Math.floor(x * canvas.width);
		y = Math.floor(y * canvas.height);
		var data = ctx.getImageData(x, y, 1, 1).data;
		var colour = one.color([data[0], data[1], data[2], 1]);

		if (useGyroscope && widget.lean) {

			var lean = widget.lean - widget.startLean + 30;
			var lightness = lean / 60;
			if (lightness < 0) {
				lightnesss = 0;
			}
			if (lightness > 1) {
				lightness = 1;
			}
			colour = colour.lightness(lightness);
		}

		return colour;
    };

    
    window.ondeviceorientation = function(e) {
		widget.lean = e.gamma;
	};
}
