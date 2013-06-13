var _ = require('/lib/underscore-1.4.4');

module.exports.createWindow = function(config) {
	
	var title = config.title;
	
  	delete(config.title); 
  	
  	var defaultConfig = {
  		layout: 'vertical' 
  	};
  	
  	if (ios) {
  		defaultConfig.barImage = 'nav_bar_bg.png';
        defaultConfig.barColor = '#515181';
  		defaultConfig.backgroundColor = '#eff1fa';
  	} else {
  		//defaultConfig.backgroundColor = '#ffffff';
  		//defaultConfig.backgroundImage = '/images/nav_bar_bg.png';
  	}
	
	config = _.extend(defaultConfig, config); 
 	Ti.API.info("Config created : " + JSON.stringify(config));
 	
 	var win = Ti.UI.createWindow(config);
 	
 	if (ios) {
 		
 		var toolbarLabel = Ti.UI.createLabel({
	    	text:title,
		    font:{fontSize:16,fontWeight:'bold'},
	    	shadowColor: '#40415d',
	    	shadowOffset: {x:0, y:1},
	    	color:'#eeeef3',
	    	textAlign:'center'
		});
		
	    win.titleControl = toolbarLabel;

 	} else {
 		// Use Android 3+ action menu
 		win.title = title;
 		
 		var rightNavButton, leftNavButton;

		var activity = win.activity;
		
		activity.onCreateOptionsMenu = function(e) {
			if (rightNavButton) {
				var menu = e.menu;
				var menuItem = menu.add({
					title : rightNavButton.title,
					icon : "images/ic_action_save.png",
					showAsAction : Ti.Android.SHOW_AS_ACTION_ALWAYS
				}); 
				menuItem.addEventListener("click", function(e) {
					rightNavButton.fireEvent("click");
				});
			}
			
			if (leftNavButton) {
				var actionBar = win.activity.actionBar;
	            if (actionBar) {
	            	actionBar.displayHomeAsUp = true;
	                //actionBar.title = title;
	                actionBar.onHomeIconItemSelected = function() {
	                   leftNavButton.fireEvent('click');
	                };
	            }
			}
			
		};
		
		win.setRightNavButton = function(button) {
			Ti.API.info('Right nav button Added!' + button.title);
			rightNavButton = button;
		};
		
		win.setLeftNavButton = function(button) {
			Ti.API.info('Left nav button Added!' + button.title);
			leftNavButton = button;
		};
			 	
 	} /*else {
 		// Draw a custom navbar
 		var navbar = Ti.UI.createView({
 			height: 48,
 			backgroundImage: '/images/nav_bar_bg@2x.png'
 		});
 		
 		navbar.add(Ti.UI.createLabel({
 			width: '100%',
 			height: '100%',
 			text: title
 		}));
 		
 		win.add(navbar);
 		
		win.setRightNavButton = function(button) {
			button.right = 0;
			navbar.add(button);
		};
		
		//win.add(navBar);
 		
 	}*/
 	
    return win;
};

module.exports.createSaveButton = function(config) {
	return Ti.UI.createButton(_.extend({
	    title: "Save",
	    style: ios? Titanium.UI.iPhone.SystemButtonStyle.DONE : undefined
	}, config || {}));
}

module.exports.createListSection = function(config) {
	if (!ios) {
		_.each(config.items, function(item) {
			Ti.API.log('Item' + JSON.stringify(item));
			if (!item.properties) {
				item.properties = {};
			}
			item.properties.height = item.properties.height || 60;
		});
	}
	return Ti.UI.createListSection(config);
}

module.exports.createListView = function(config) {
	
	if (ios) {
		config.backgroundColor = '#eff1fa';
		config.style = Titanium.UI.iPhone.ListViewStyle.GROUPED;
	} else {
		
	}
	
    return Ti.UI.createListView(config);
};

function createAndroidNavigationGroup() {
	
    var self = this,
    	windows = [];

    self.open = function(windowToOpen) {
        windowToOpen.navBarHidden = windowToOpen.navBarHidden || false;

    	var close = Ti.UI.createButton({
		    title: "Close"
		});
		
		close.addEventListener("click", function() {
			self.close(windowToOpen);
		});
    	windowToOpen.setLeftNavButton(close);

		var animate = false;

        if(!self.rootWindow) {
        	animate = true;
            self.rootWindow = windowToOpen;
        }
        
        windowToOpen.open(/*{
			activityEnterAnimation: Ti.Android.R.anim.slide_in_left
   	    }*/);
        
        Ti.API.info("Opening window in navgroup : " + windowToOpen.title);
        
        windows.push(windowToOpen);
    };

    self.close = function(win) {
    	if (win) {
    		win.close();
    	} else {
			_.each(windows, function(w) {
				try{w.close();}catch(e){}; // Ugly. But handles all cases.
			});
		}
    };

    return self;
};

module.exports.createNavigationGroup = ios? Ti.UI.iPhone.createNavigationGroup : createAndroidNavigationGroup;
