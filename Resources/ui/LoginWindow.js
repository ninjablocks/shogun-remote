
function encode(val) {
    return Ti.Network.encodeURIComponent(val);
};

function params(data) {
    if (data == null || typeof(data) == 'undefined') {
        return '';
    }
    var x = [];
    for (idx in data) {
        var param = encode(idx) + '=' + encode(data[idx]);
        x.push(param);
    }
    return x.join('&');
}

var request = function(opts, cb) {
	opts.data = JSON.stringify(opts.json);
	opts.url += '?' + params(opts.qs);
	opts.contentType = 'application/json';

	var client = Ti.Network.createHTTPClient({
		onload : function(e) {
			//l("Received text: " + this.responseText);
			//alert('ajax success');
			var result = this.responseText;
			try {
				result = JSON.parse(this.responseText)
			} catch (e){}
			cb(result.error, {statusCode: this.status}, result);
		},
		// function called when an error occurs, including a timeout
		onerror : function(e) {
			Ti.API.error('Status: ' + JSON.stringify(e));
		    Ti.API.error('ResponseText: ' + this.responseText);
		    Ti.API.error('connectionType: ' + this.connectionType);
		    Ti.API.error('location: ' + this.location);
		    try {
				var result = JSON.parse(this.responseText)
			} catch (e){}
			cb(result?result.error || e:e, {statusCode: e.status}, e);
			//alert('ajax error');
		}
	});
	
	if (opts.timeout) {
		client.timeout = opts.timeout;
	}

	client.open(opts.method, opts.url);
	client.setRequestHeader("Content-Type", opts.contentType);
	client.send(opts.data);

}



function LoginWindow(onLogin) {

    var win = Ti.UI.createWindow({
		navBarHidden : true,
        modal : false,
        backgroundImage: 'images/bg-small-purple.png'
    });


	function doLogin() {
		login.enabled = false;

	    usernameField.editable = false;
		passwordField.editable = false;

		activityIndicator.show();

		request({
			url: 'https://a.ninja.is/signin',
	    method: 'POST',
	    json: {
				email: usernameField.value,
				password: passwordField.value,
				rememberMe: true
			}

		}, function(error, status, result) {


			if (error) {
				usernameField.editable = true;
				passwordField.editable = true;
				login.enabled = true;
				activityIndicator.hide();
				alert(error);
			} else {
				l('Got Session ' + result.data['ninja.sid']);
				request({
					url: 'https://a.ninja.is/you',
					method: 'GET'
				}, function(a,b,c) {
					
					if (a) {
						alert('An error occurred fetching your access token: ' + a);
						return;
					}
					if (c.match(/Enable API Access/)) {
						//https://a.ninja.is/rest/v0/virtual_block_access
						//{"result":1,"error":null,"id":0,"data":{"token":"My621OWq2lLhnXvrtBr1tXG85rgM8mXK6ZPvXxJBI"}}
						l('Virtual block access is not enabled. Enabling.');
						request({
							url: 'https://a.ninja.is/rest/v0/api_access',
							method: 'POST'
						}, function(a,b,c) {
							l('Got a token after enabling access : ' + c.data.token);
							onLogin(c.data.token);
							win.close();
						});
					} else {
						var result = c.match(/api-token-holder">([^<]*)</);
						if (!result || result.length < 2) {
							alert('Couldn\'t find your access token');
							return;
						}
						l('Access Token! ' + JSON.stringify(result));
	
						onLogin(result[1]);
						win.close();
					}

				});
			}
		});

	}


    var style;
	if (ios){
	  style = Ti.UI.iPhone.ActivityIndicatorStyle.PLAIN;
	} else {
	  style = Ti.UI.ActivityIndicatorStyle.DARK;
	}
	var activityIndicator = Ti.UI.createActivityIndicator({
	  top:412,
	  font: {fontFamily:'Helvetica Neue'},
	  message: '',
	  style:style,
	  color:'white',
	  width:'100%'
	});
	
	
    
	var view = Titanium.UI.createScrollView({
		width:'100%'
	});
	
	
    var block = Titanium.UI.createView({
		backgroundImage:(ios?'':'/images/') + 'ninja-logo-small'+(ios?'':'@2x')+'.png',
		width:92,
		height:123,
		top:60
	});
	
	view.add(block);
   
	var usernameField = Titanium.UI.createTextField({
		top:250,
		left:'10%',
		width:'80%',
		height:40,
		hintText:'Email Address',
		keyboardType:Titanium.UI.KEYBOARD_EMAIL,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	
	if (!ios) {
		usernameField.color = 'white';
	}
	
	usernameField.addEventListener('return', function() {
    	passwordField.focus();
	});
	
	var passwordField = Titanium.UI.createTextField({
		top: 320,
		left:'10%',
		width:'80%',
		height:40,
		hintText:'Password',
		passwordMask: true,
		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
		borderStyle:Titanium.UI.INPUT_BORDERSTYLE_ROUNDED
	});
	if (!ios) {
		passwordField.color = 'white';
	}
	
	passwordField.addEventListener('return', doLogin);
	
	var login = Titanium.UI.createButton({
		//title:'Login',
		backgroundImage:(ios?'':'../images/') + 'login_up'+(ios?'':'@2x')+'.png',
		backgroundSelectedImage:(ios?'':'/images/') + 'login_down'+(ios?'':'@2x')+'.png',
		backgroundDisabledImage:(ios?'':'/images/') + 'login_blank'+(ios?'':'@2x')+'.png',
		top:390,
		width:320,
		height:63
	});
	
	login.addEventListener("click", doLogin);
	
	/*win.addEventListener('click', function(e){
        usernameField.blur();
        passwordField.blur();
	});*/
		
	view.add(usernameField);
	view.add(passwordField);
	view.add(login);
	
	win.add(view);
	
	view.add(activityIndicator);
	
    return win;
}

module.exports = LoginWindow;
