// As this window is instantiated on load, we don't have the global Ninja object yet.
var Ninja = {UI:require('/lib/Ninja.UI')};

function IconPicker() {

    // Create our main window
    var self = Ninja.UI.createWindow({
        title: 'Icon'
    });
    
    if (ios) {
    	self.backgroundColor = '#eff1fa';
    }
    
    var scrollView = Ti.UI.createScrollView({
    	layout: 'horizontal',
    	top: 0,
    	left: 0,
        width: '100%',
        height: '100%',
        contentWidth: '100%',
		contentHeight: 'auto',
		showVerticalScrollIndicator: true,
		showHorizontalScrollIndicator: false
    });
    self.add(scrollView);
    
    var iconPath = (ios?'':'../../') + 'HTML/icons';
    
	Titanium.Filesystem.getFile(iconPath).getDirectoryListing().forEach(function(image) {
		var btn = Ti.UI.createImageView({
			image: iconPath + '/' + image,
			width: '64dp',
			height: '64dp'
		});
		
		btn.addEventListener('click', function() {
			self.onIconSelected(image.substring(0, image.indexOf('.')));
		});
		
		scrollView.add(btn);
	});
    
    return self;
}

module.exports = new IconPicker();
