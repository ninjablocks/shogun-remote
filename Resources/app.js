Titanium.include("global.js");

var RemoteApplication = require('RemoteApplication');
/*
       _       _                                  _       
      (_)     (_)                                | |      
 _ __  _ _ __  _  __ _   _ __ ___ _ __ ___   ___ | |_ ___ 
| '_ \| | '_ \| |/ _` | | '__/ _ \ '_ ` _ \ / _ \| __/ _ \
| | | | | | | | | (_| | | | |  __/ | | | | | (_) | ||  __/
|_| |_|_|_| |_| |\__,_| |_|  \___|_| |_| |_|\___/ \__\___|
             _/ |                                         
            |__/    © 2013 - Ninja Blocks Pty. Ltd.       
*/

l('Starting Remote. Version : ' + Titanium.App.version);

Ti.App.addEventListener('*', function(e) {
	 l('Evt: ' + e.topic + ' - ' + JSON.stringify(e.data).replace(/\s+/g, ' '));
});

Ti.App.addEventListener('webview.log', function(e) {
	 l('Web: ' + e.level + '-' + e.data);
});

var app = new RemoteApplication();