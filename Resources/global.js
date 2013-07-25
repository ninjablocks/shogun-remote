var osname = Ti.Platform.osname;
var ios = (osname === 'iphone' || osname === 'ipad');

function l(x) {
	Ti.API.info(x);
}

var _ = require('lib/underscore-1.4.4');

var statusbar = require('ui/StatusBar');

var Ninja = {};
Ninja.UI = require('lib/Ninja.UI');
Ninja.App = require('lib/Ninja.App');
Ninja.Data = require('lib/Ninja.Data');

var developerMode = Ti.App.Properties.getBool('developerMode');

function setDeveloperMode(mode) {
	developerMode = mode;

	statusbar.postMessage('Ninja mode - ' + (mode?'Enabled':'Disabled'), 3);
	Ti.App.Properties.setBool('developerMode', developerMode);

	if (!mode) {
		setWakaiMode(false, true);
	}
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