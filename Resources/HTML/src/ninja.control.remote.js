/*global $: true,
	$T: true,
    console: true,
    namespace: true,
    ninja: true,
    _: true
 */

/*	This component is responsible for rendering the remotes ui.

	It fires the following useful events :
		control.button.activate	- Array<Button> buttons
		control.button.delete - Button button
		control.button.edit - Button button
		control.button.update - Array<Button> buttons

		control.remote.rendered - JQueryElement container

	It listens to :
		control.button.activated - Array<Button> buttons
		control.button.updated - Array<Button> buttons
		control.button.deleted - Button button

	It is 10% beautiful new code. 90% I-decided-I-was-wasting-my-time code.
*/

(function(ns) {

	var buttons,
		buttonsById = {},
		remotesById = {},
		cols,
		rows,
		container,
		mainRemote;

	var widgets = {};


	$.subscribe('control.button.deleted', function(topic, button) {
		var btnEl = $('[data-button-id="' + button.id + '"]');

		// Ha, this may fail if they have no empty buttons! Add an extra hidden one on render?
		btnEl.replaceWith($('.remote-button.empty').first().clone());
	});


	$.subscribe('control.button.updated', function(topic, button, oldButton) {
		if (!buttons) {
			// We have't rendered yet, so don't care
			return;
		}

		buttonsById[button.id] = button;
		_.filter(buttons, function(b) {
			return b.id != button.id;
		});
		buttons.push(button);

		function getContainers(button) {
			var c = $('#wrap-' + [button.parent||'main',button.y,button.x].join(''));

			if (button.type == 'menu') {
				return c.add($('#wrap-' + [button.id,button.y,button.x].join('')));
			} else {
				return c;
			}

		}

		console.log('Rendering updated button', button, 'was', oldButton);

		var previous = $('[data-button-id="' + button.id + '"]');
		console.log('Previous containers - ', previous);
		previous.parents('td').empty().append($('.remote-button.empty').first().clone());


//		console.log('THE REMOTE', remote, button);

		///var target = remote.find('tr:nth-child(' + (button.y+1) + ') td:nth-child(' + (button.x+1) + ')');
		renderButton(button, getContainers(button));

	});

	$.subscribe('control.button.added', function(topic, button) {
		buttonsById[button.id] = button;
		buttons.push(button);

		var remote = $('.remote.main');
		if (button.parent) {
			remote = $('.remote[data-remote-id="' + button.parent + '"]');
		}

		var target = remote.find('tr:nth-child(' + (button.y+1) + ') td:nth-child(' + (button.x+1) + ')');
		renderButton(button, target);

		if (button.type == 'menu') {
			renderRemote(button.id, []);
		} else if (button.widget) {
			buildWidgetForButton(button);
		}
	});

	function renderButton(button, targetEl) {

		console.log('rendering button into ', targetEl);

		_.each(targetEl, function(btnEl) {
			btnEl = $(btnEl);

			var active = btnEl.parents('[data-remote-id="' + button.id + '"]').length > 0;

			//var replacement = $($.parseHTML($('#buttonTmpl').process({button:button, cols:cols})));
			var html =  $('#buttonTmpl').process({
				button:button
			});

			btnEl.html(html);

			if (active) {
				btnEl.find('.remote-button').addClass('active').removeAttr('data-remote');
			}

			$.publish('control.button.rendered.' + button.id, button);
		});

	}

	ns.render = function(options) {
		buttons = options.buttons;

		_.each(buttons, function(button) {
			buttonsById[button.id] = button;
		});

		console.log('Building remote using buttons', buttons);
		cols = options.cols;
		rows = options.rows;

		if (container) container.empty();

		container = options.container;
		container.empty();

		render();

		_.each(buttons, function(button) {
			buildWidgetForButton(button);
		});

		mainRemote = $('.remote.main');

	};

	$(function() {
		addListeners();
	});

	function buildWidgetForButton(button) {
		var container = button.type == 'widget'? $('[data-button-id="' + button.id + '"]') : null;
		widgets[button.id] = ninja.control.widget.build(button.widget, button, buttonsById[button.parent], container);
	}

	// Accepts string id or jquery element of button
	function getBtn(id) {
		return typeof id == 'string' ? buttonsById[id] : buttonsById[id.data('button-id')];
	}

	ns.getBtn = getBtn;

	$.subscribe('control.device.state', function(topic, dev, state) {
		$('[data-device="' + dev + '"]').attr('data-state', state);
	});

	function render() {

		$('.remote').remove();

		var parentIds = _.chain(buttons).filter(function(b) {
			return b.type == 'menu';
		}).map(function(b){
			return b.id;
		}).value();

		parentIds.push('undefined');


		console.log('parentIds', parentIds);

		// Build our arrays of buttons to render
		_.each(parentIds, function(parentId) {
			parentId = (parentId === 'undefined'? undefined : parentId);

			console.log('id', parentId);
			var children = _.filter(buttons, function(b) {
				return b.parent == parentId;
			});
			console.log('children', children);

			// As it was used for a key, undefined comes through as a string

			renderRemote(parentId, children);
		});

		//$.publish('control.remote.rendered', container);

	}

	function renderRemote(parentId, children) {

		console.debug('Rendering remote id', parentId, 'containing buttons', children);

		if (parentId) {
			var parent = _.clone(buttonsById[parentId]);
			parent.active = true;
			parent.type = 'menu-active';
			children = _.union(children, [parent]);
		}

		var byLocation = _.groupBy(children, function(b) {return b.x + '-' + b.y;});

		var buttonArray = _.times(rows, function(row) {
			return _.times(cols, function(col) {
				var button = byLocation[col + '-' + row];
				return button? button[0] : {empty:true};
			});
		});

		// Delete extra add buttons if our buttons are using colspan/rowspan
		for (var y = 0; y < buttonArray.length; y++) {
			for (var x = 0; x < buttonArray[y].length; x++) {
				var btn = buttonArray[y][x];
				if (btn) {
					var colspan = btn.width || 1,
						rowspan = btn.height || 1;

					for (var c = 0; c < colspan; c++) {
						for (var r = 0; r < rowspan; r++) {
							if (!(c === 0 && r === 0)) { // Don't delete ourselves!
								buttonArray[y+r][x+c] = null;
							}
						}
					}

				}
			}
		}


		/*

		// If we are in landscape mode... rotate the matrix
		function rotateLeft(m) {

			var rotateM = [];


			for (var i= 0; i< m.length; i++){
				rotateM[i] = [];
				for (var j= 0; j< m[0].length; j++){
					rotateM[i][j] = m[j][m.length-i-1];
				}
			}

			return rotateM;
		}

		console.log(JSON.stringify(buttonArray));

		buttonArray = rotateLeft(buttonArray);

		console.log(JSON.stringify(buttonArray));

		*/

		container.append($('#remoteTmpl').process({id:parentId||false, buttons:buttonArray, rows:rows, cols:cols}));
		if (parentId) {
			remotesById[parentId] = $('[data-remote-id="' + parentId + '"]');

			// We need to pre-run all the selectors to give us the absolute quickest
			// remote display time. If you want to make this app feel faster... start here.
			// The biggest wins will likely be in the css related to .remote.hidden, .remote.parent

			showRemoteFunctions[parentId] = (function() {
				var remote = remotesById[parentId],
					activeButton = remote.find('.active'),
					title = activeButton.find('.title').text();
				return function() {
					remote.removeClass('hidden');
					mainRemote.addClass('parent');
					activeButton.addClass('hover');
					ninja.control.header.setTitle(title);
				};
			})();
		}

	}

	var showRemoteFunctions = {};

	function showRemote(id) {
		if (!showRemoteFunctions[id]) {
			createShowRemoteFunction(id);
		}
		showRemoteFunctions[id]();
	}

	function addListeners() {
		uglyOldCode();
	}


	function uglyOldCode() {
		// Elliot: Here be dragons. I'll replace it at some point. Maybe.

		var lastButton = null;
		var delayTimeout, endTouchingTimeout;

		var touching = false;

		var tapTimeout;

		function cancelTap() {
			clearTimeout(tapTimeout);
		}

		function startTap() {

		}

		/*$(document).on('button-tap', '.remote-button[data-remote]', function(e) {
			clearTimeout(endTouchingTimeout);
			console.log('Switching to pete mode.');
			$('body').addClass('second-level').removeClass('touching');
		});*/

		$(document).on('touchmove', doTouch);

		function doTouch(e) {
			if(touching && e.touches.length == 1){

				var touch = e.touches[0];

				var target = $(document.elementFromPoint(touch.clientX, touch.clientY));

				if (!target.hasClass('remote-button')) {
					target = target.parents('.remote-button');
				}

				if (target.length) {

					if (target.hasClass('activated')) {
						target.trigger('ninjatouchmove', e);
					}

					if (!lastButton || target[0] != lastButton[0]) {

						clearTimeout(delayTimeout);

						$('.hover').removeClass('hover');

						lastButton = null;
						if (!target.hasClass('empty')) {
							target.addClass('hover');
						}

						if (!target.hasClass('active') && !target.hasClass('empty')) {
							delayTimeout = setTimeout(function() {
								console.group('Activating button', lastButton);
								activateButton(lastButton);
								console.groupEnd('Activating button', lastButton);
							}, 1000);
							lastButton = target;
						}

					}
				}

				//target.addClass('hover').parent().parent().find('.hover').not(target).removeClass('hover');
			}

			//e.preventDefault();
		}

		ns.resetUI = resetUI;
		function resetUI() {
			$('[data-remote-id]').addClass('hidden');
			$('.remote.parent').removeClass('parent');
			$('.remote-button.hover').removeClass('hover');
			$('body').removeClass('touching').removeClass('second-level');
			touching = false;
			ninja.control.header.reset();
		}

		var activeButton = null;

		function activateButton(button) {
			if (button.hasClass('activated')) {
				return;
			}

			button.addClass('activated');

			button.addClass('hover');

			activeButton = button;

			var buttonObj = getBtn(button);
			if (!buttonObj) {
				resetUI();
				return; // Get out. This is an empty button.
			}

			$.publish('control.button.activate.' + buttonObj.id, buttonObj, function() {
				if (touching) {
					resetUI();
					deactivateCurrentButton();
				} else {
					// We aren't in a submenu, let the activated state stick for a beat.
					setTimeout(function() {
						deactivateCurrentButton();
					}, 100);
				}
			});

		}

		function deactivateCurrentButton() {
			if (activeButton) {
				activeButton.removeClass('activated');
				activeButton.removeClass('hover');
				$.publish('control.button.deactivate.' + activeButton.data('button-id'), activeButton.data('button-id'));
				activeButton = null;
			}
		}

		$.subscribe('control.remote.show', function(topic, button) {
			showRemote(button.data('button-id'));
		});

		$(document).on('touchstart', 'body:not(.edit) [data-widget]', function(e) {
			if (activeButton && !$(this).is('.activated')) {
				deactivateCurrentButton();
			} else {

				activateButton($(this));

			}
			e.preventDefault();
		});

		$(document).on('touchstart', 'body:not(.edit) .remote-button.active', function(e) {
			if (activeButton) {
				deactivateCurrentButton();
			} else {
				resetUI();
			}
			e.preventDefault();
		});

		$(document).on('touchstart', '[data-remote]', function(e) {

			console.time('start touching');

			if (document.body.className.match(/edit/)) {
				return;
			}

			if (activeButton) {
				deactivateCurrentButton();
			} else {
				$('body').addClass('touching');
				touching = true;
				lastButton = false;
				showRemote($(this).data('button-id'));
			}
			e.preventDefault();
			console.timeEnd('start touching');
		});

		$(document).on('touchstart', 'body:not(.edit) .remote-button.empty', function(e) {
			if (activeButton) {
				deactivateCurrentButton();
			}
			e.preventDefault();
		});

		$(document).on('touchend', '.touching', function(e) {
			// Let the tap event have a chance to see if this should be a click
			endTouchingTimeout = setTimeout(function() {
				if (touching) {
					console.log('ending touch');
					clearTimeout(delayTimeout);

					if (activeButton) {
						deactivateCurrentButton();
						resetUI();
					} else if(lastButton) {
						activateButton(lastButton);
					} else {
						resetUI();
					}

				}
			}, 1);
		});

	}


})(namespace('ninja.control.remote'));
