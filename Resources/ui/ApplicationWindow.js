var EditWindow = require('ui/EditWindow'),
	SettingsWindow = require('ui/SettingsWindow');

function ApplicationWindow() {
    
    var animationsOn = false;

    var osname = Ti.Platform.osname;

    // Create our main window
    var self = Ti.UI.createWindow({
        backgroundImage : '/images/bg-small-purple.png',
        navBarHidden : true, // iOS only
        modal : true,
        exitOnClose : true  // Android only
    });
    
	if (!ios) {
		Ti.Android.currentActivity.addEventListener('pause', function() {
			self.close();
			var activity = Titanium.Android.currentActivity;
	     	activity.finish();
		});
		self.addEventListener('pause', function() {
			self.close();
			var activity = Titanium.Android.currentActivity;
	     	activity.finish();
		});
	}

	var webView;
	function createWebView() {
		webView  = Ti.UI.createWebView({
	        backgroundColor:'transparent',
	        opacity: animationsOn?0:1,
	        enableZoomControls : false, // Android only
	        url : '/HTML/index.html'
	    });
	    
	    self.add(webView);
	}
    createWebView();
    self.reload = function() {
    	l('Resetting web view');
    	webView.html = ' ';
    	l('  Cleared existing one');
    	self.remove(webView);
    	l('  Remove existing');
		createWebView();
		l(  'Added new')
    }

    if (animationsOn) {
        setTimeout(function() {
            webView.animate(Ti.UI.createAnimation({
                opacity : 1,
                duration : 500
            }));
        }, 0);
    }
    
    Ti.Gesture.addEventListener('shake',function(e) {
	    Ti.App.fireEvent('publish', {data:[], topic: 'control.toggleEdit'});
	});

	
	Ti.App.addEventListener('control.button.create', function(e) {
		var btn = e.data[0], 
			parentBtn = e.data[1];

		Ti.API.info('Creating new button ' + print(btn));
		
		if (parentBtn) {
			// No point asking what type, they can't do nested menus anyway
			btn.type = 'action';
			var edit = new EditWindow(btn, parentBtn);
			if (ios) edit.open();
			return;
		}

		var dialog = Titanium.UI.createOptionDialog({
			options:['Action', 'Group', 'Cancel'],
			cancel:2,
			title:'What kind of button would you like to make?'
		});
		
		// add event listener
		dialog.addEventListener('click',function(e) {
			
			if (e.index < 2) {
				btn.type = ['action', 'menu'][e.index];
				
				var edit = new EditWindow(btn);
				if (ios) edit.open();
			}
			
		});
		
		dialog.show();
		
	});
	
	Ti.App.addEventListener('control.button.edit', function(e) {
		var btn = e.data[0];

		Ti.API.info('Editing button ' + btn);
		
		var edit = new EditWindow(btn);
		if (ios) edit.open();
	});
	
	Ti.App.addEventListener('control.settings.show', function(e) {
		new SettingsWindow().open({
			modal: true,
			modalTransitionStyle: ios? Ti.UI.iPhone.MODAL_TRANSITION_STYLE_FLIP_HORIZONTAL : undefined,
			modalStyle: ios? Ti.UI.iPhone.MODAL_PRESENTATION_PAGESHEET : undefined
		});
	});
	
	if (ios) {
		// Preload the edit window by making a hidden one.
		setTimeout(function() {
			var e = new EditWindow({
				type: 'action'
			});
			e.visible = false;
			//e.open({animated:false});
			//e.close();
		}, 3000);
	}
	
    return self;
}


//make constructor function the public component interface
module.exports = ApplicationWindow;
