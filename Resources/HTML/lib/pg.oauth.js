/*
 *	OAuth for PhoneGap.
 *	
 *  https://github.com/jor3l/phonegap-oauth
 *  MIT 2008 License.
 *	
 *	Developed by StarBite <jose@starbite.co>
 *  Bogota, Colombia @ 2013.
 */
 
(function($) {
	$.extend($.fn, {
        oauthLogin: function(options) {
			var getAuthorizationDefault = function(service) {
				var defaults = {'facebook': "https://www.facebook.com/dialog/oauth",
								'linkedin': "https://www.linkedin.com/oauth",
								'google': "https://accounts.google.com/o/oauth2/auth",
								'instagram': "https://instagram.com/oauth/authorize/",
								'ninjablocks': 'https://api.ninja.is/oauth/authorize'};								
				return (service in defaults || typeof defaults[service] != '') ? defaults[service] : false;
			};

            var defaults = {
                client_id: false,
                redirect_uri: 'http://starbite.co/oauth/redirect.php',
				authorization: getAuthorizationDefault(options.service),
				permissions: false,
				frame: ['width=900px', 'height=400px', 'resizable=0', 'fullscreen=yes'],
				childBrowserSettings: { showLocationBar: false, showAddress: false }
            };

			var uuid = function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
					return v.toString(16);
				});
			};

			var parseQueryString = function (qs) {
				var e,
					a = /\+/g,  // Regex for replacing addition symbol with a space
					r = /([^&;=]+)=?([^&;]*)/g,
					d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
					q = qs,
					urlParams = {};

				while (e = r.exec(q))
				   urlParams[d(e[1])] = d(e[2]);

				return urlParams;
			};

			var popupWins = {};
			var windowOpener = function(url, name, args) {
				var win = null;
				if ( typeof( popupWins[name] ) != "object" ) {
					win = window.open(url,name,args.join(','));
				} else {
					if (!popupWins[name].closed){
						popupWins[name].location.href = url;
					} else {
						win = window.open(url, name,args.join(','));
					}
				}

				popupWins[name] = win;
				popupWins[name].focus();


				function checkForUrlChange() {
					try {
						var url = win.location.search.substr(1);
						win.close();
						clearInterval(i);
						$(document).trigger(options.callback.toString(), parseQueryString(url));
					} catch(e){console.log(e);}
				}
				var i = setInterval(checkForUrlChange, 2000);
			};

            var options =  $.extend(defaults, options),
				accessTokenUri = function() {
					var params = {state: uuid(), response_type: 'code', 'cb': options.callback};
						if(options.permissions !== false)
							params.scope = options.permissions.join(',');
						params = $.extend(options, params);
					return options.authorization + '?' + $.param(params);
				};

			// Get the access uri
			var oauth_uri = accessTokenUri();

            //Iterate over the current set of matched elements
            return this.each(function() {
				$(this).bind('click', function() {
					if('plugins' in window && window.plugins.childBrowser) {
						console.log('Opening childBrowser');
						window.plugins.childBrowser.showWebPage(oauth_uri, options.childBrowserSettings);
						window.plugins.childBrowser.onLocationChange = function(url) {
							if(url.indexOf(options.redirect_uri)) {
								$(document).trigger(options.callback.toString(), parseQueryString(url));
								window.plugins.childBrowser.close();
							}
						};						
					} else {
						// Fallback to popup
						console.log('Opening windowOpener');
						windowOpener(oauth_uri, options.service.toString(), options.frame);
					}
				});
            });
        }
    });	
})(window.Zepto || window.jQuery || window.jq);  