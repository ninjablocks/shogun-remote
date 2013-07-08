var statusbar;
if (ios) {
	require('com.yydigital.tintswitch');
	statusbar = require('mattapp.statusbar');
} else {
	statusbar = {};
	
	var nid = 0;
	var lastMessage = null;
	
	statusbar.postMessage = statusbar.postImmediateErrorMessage = statusbar.postImmediateFinishMessage = function(text, durationSeconds) {
		/*Ti.UI.createNotification({
			message: text,
			duration: Titanium.UI.NOTIFICATION_DURATION_SHORT
		}).show();*/
		
		if (text == lastMessage) {
			return;
		}
		lastMessage = text;
		
		Titanium.Android.NotificationManager.cancelAll();
		
		var x = nid++;
		Titanium.Android.NotificationManager.notify(
        x, // <-- this is an ID that we can use to clear the notification later
        Ti.Android.createNotification({
            contentTitle: text,
           // contentText: 'Swiss',
            tickerText: text
        }));
        
        setTimeout(function() {
        	Titanium.Android.NotificationManager.cancel(x);
        }, durationSeconds * 1000)

	};

	statusbar.postMessageInProgress = function(text) {
		/*Ti.UI.createNotification({
			message: text,
			duration: Titanium.UI.NOTIFICATION_DURATION_SHORT
		}).show();*/
		
		if (text == lastMessage) {
			return;
		}
		lastMessage = text;
		
		Titanium.Android.NotificationManager.cancelAll();
		
		Titanium.Android.NotificationManager.notify(
        0, // <-- this is an ID that we can use to clear the notification later
        Ti.Android.createNotification({
            contentTitle: text,
           // contentText: 'Swiss',
            tickerText: text
        }));
	};

}

module.exports = statusbar;