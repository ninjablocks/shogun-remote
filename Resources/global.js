var osname = Ti.Platform.osname;
var ios = (osname === 'iphone' || osname === 'ipad');


var logHistory = [];

function l(x) {
	if (!developerMode) return;
	
	x = new Date().toLocaleString() + ' - ' + x;
	logHistory.push(x);
	if (logHistory.length > 200) {
		logHistory.shift();
	}
	Ti.API.info(x);
}

function sendLogHistory() {
	l('Sending debug log history email');
	var emailDialog = Ti.UI.createEmailDialog();
	emailDialog.subject = " [REMOTEDEBUG] Ninja Remote Debug Log";
	emailDialog.toRecipients = ['help@ninjablocks.com'];
	emailDialog.messageBody = 'Please describe the problem :\n\n';
	
	var tempFile = Ti.Filesystem.createTempFile();
    tempFile.write(logHistory.join('\n'));
	
    emailDialog.addAttachment(tempFile.read());
	
	/*var f = Ti.Filesystem.getFile('cricket.wav');
	emailDialog.addAttachment(f);*/
	emailDialog.open();
}

var _ = require('lib/underscore-1.4.4');

var statusbar = require('ui/StatusBar');

var Ninja = {};
Ninja.UI = require('lib/Ninja.UI');
Ninja.App = require('lib/Ninja.App');
Ninja.Data = require('lib/Ninja.Data');

var developerMode = Ti.App.Properties.getBool('developerMode');

function setDeveloperMode(mode, hideMessage) {
	developerMode = mode;

	if (!hideMessage || mode) {
		statusbar.postMessage('Ninja mode - ' + (mode?'Enabled':'Disabled'), 3);
	}
	Ti.App.Properties.setBool('developerMode', developerMode);
	
	Ti.App.fireEvent('developerMode', {developerMode: developerMode});

	if (!mode) {
		setWakaiMode(false, true);
	}
}
setDeveloperMode(developerMode, true);

var wakaiMode = Ti.App.Properties.getBool('wakaiMode');

function setWakaiMode(mode, hideMessage) {
	wakaiMode = mode;

	if (!hideMessage) {
		statusbar.postMessage('Wakai mode - ' + (mode?'Enabled':'Disabled'));
	}
	Ti.App.Properties.setBool('wakaiMode', wakaiMode);
}

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}