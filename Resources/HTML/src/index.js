console.log('Webkit starting up');

$.subscribe('control.load', function(topic, buttons, devices, widgets) {

	console.log('Control loaded with buttons', buttons, 'and devices', devices);
	
	ninja.control.widget.load(widgets);

	$.publish('ninja.devices', devices);

	$(function() {

		// Finds the best number of rows and columns for the screen size
		// where best is the most squarish buttons with side_min < side < side_max
		function optimumRemoteSize(width, height) {

			var SIDE_MIN = 80, SIDE_MAX = 135, MIN_ROW = 3;

			var side = SIDE_MIN, minDiff = SIDE_MIN;

			for (var s = SIDE_MIN; s <= SIDE_MAX; s++) {
				var diff = (width % s) + (height % s);
				if (diff < minDiff && ((width / s) >= MIN_ROW) && (height / s) >= MIN_ROW) {
					side = s;
				}
			}
			console.log('The best side length for', width, 'x', height, 'is', side);

			return {
				rows : Math.floor(height / side),
				cols : Math.floor(width / side)
			};
		}

		var size = optimumRemoteSize(window.innerWidth, window.innerHeight);
		ninja.control.remote.render({
			buttons : buttons,
			rows : size.rows,
			cols : size.cols,
			container : $('#remotes')
		});
	});

});

$.publish('control.ready');
