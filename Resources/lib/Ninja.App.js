module.exports.fireWebkit = function(topic) {
	var params = Array.prototype.slice.call(arguments, 1);
	try {
		Ti.App.fireEvent('publish', {data:params, topic: topic});
	} catch(e) {
		Ti.API.error('Failed to fire webkit event ' + topic + ' - ' + e);
	}
}

module.exports.onHttpError = function(task) {
	return function(e) {
		Ti.API.error('Status: ' + JSON.stringify(e));
	    Ti.API.error('ResponseText: ' + this.responseText);
	    Ti.API.error('connectionType: ' + this.connectionType);
	    Ti.API.error('location: ' + this.location);
	    statusbar.postImmediateErrorMessage('Network error ' + task, 3);
	};
};