//////////////////////// API START //////////////////////// 


//displays a message in the status bar, that is dismissed when tapped
//statusbaroverlay.postMessage("Posting to Twitter");

//you can also set a timeout to auto hide the message
//statusbaroverlay.postMessage("Start posting to Twitter", 2.5);

//clears the statusbar instantly and displays a message in the status bar, that is dismissed when tapped
//statusbaroverlay.postImmediateMessage("Posting to Twitter", 2.5);



//displays a message in the status bar with an activity indicator on the left side, that is dismissed when tapped
//statusbaroverlay.postMessageInProgress("Posting to Twitter", 5.0);

//you can also set a timeout to auto hide the message
//statusbaroverlay.postMessageInProgress("Posting to Twitter", 3.0);

//clears the statusbar instantly and displays a message in the status bar with an activity indicator on the left side, that is dismissed when tapped
//statusbaroverlay.postImmediateMessageInProgress("Posting to Twitter", 3.0);



//displays a message in the status bar with a check on the left side, that is dismissed after a timeout
//statusbaroverlay.postFinishMessage("Message was posted to Twitter", 2.0);

//clears the statusbar instantly and displays a message in the status bar with a check on the left side, that is dismissed after a timeout
//statusbaroverlay.postImmediateFinishMessage("Error posting to Twitter", 2.0);



//displays a message in the status bar with an X the left side, that is dismissed after a timeout
//statusbaroverlay.postErrorMessage("Error posting to Twitter", 2.0);

//clears the statusbar instantly and displays a message in the status bar with an X the left side, that is dismissed after a timeout
//statusbaroverlay.postImmediateErrorMessage("Error posting to Twitter", 2.0);



//hide the statusbaroverlay but keep its current message displayed
//statusbaroverlay.hide();

//show the statusbaroverlay if any messages were hidden
//statusbaroverlay.show();

//hide and clear the statusbar
//statusbaroverlay.stop();

//////////////////////// API END //////////////////////// 


// open a single window
var win = Ti.UI.createWindow({
	backgroundColor:'white'
});
win.open();

//Ti.UI.iPhone.statusBarStyle = Ti.UI.iPhone.StatusBar.DEFAULT; //OPAQUE_BLACK; //TRANSLUCENT_BLACK;
var statusBarOverlayActive = false;
try{
	if(Ti.Platform.osname == 'iPhone OS'){
		var statusbaroverlay = require('mattapp.statusbar');
		statusBarOverlayActive = true;
	}
}catch(e){
	Ti.API.error("Nope, statusbar is not there !");
}

//example usage
if(statusBarOverlayActive){
	statusbaroverlay.postMessage("Sync started");
	
	setTimeout(function(){
		if(statusbaroverlay.isOverlayVisible){
			Ti.API.debug("YES - statusbar is visible");
			
		}
		statusbaroverlay.postMessageInProgress("Sync in progress...",8.0);
		setTimeout(function(){
			statusbaroverlay.postImmediateFinishMessage("Sync completed", 5.0);
			
			//OR
			//statusbaroverlay.postImmediateErrorMessage("Error posting to Twitter", 3.0);
		}, 5000);
	}, 2000);
}