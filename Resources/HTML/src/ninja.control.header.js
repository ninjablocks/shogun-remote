
(function(ns) {

	var defaultTitle;

	ns.setTitle = function(title) {
		$('header .title').text(title);
	};


	ns.reset = function() {
		if ($('body.edit').length) {
			$('header .title').text('Edit Actions');
		} else {
			$('header .title').text(defaultTitle);

		}
	};

	$(function() {
		defaultTitle = $('header .title').text();
	});

})(namespace('ninja.control.header'));
