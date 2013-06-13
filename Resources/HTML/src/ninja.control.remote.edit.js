/*global $: true,
	$T: true,
    console: true,
    namespace: true,
    ninja: true,
    _: true
 */


(function(ns) {

	var dragStartedTime,
		clickTarget,
		endTouchingTimeout;

	var getPosition = _.memoize(function(id) {
		return $('#' + id).position();
	});

	var size;
	function getButtonSize(guide) {

		if (!size) {

			return {
				width: guide.width() - 3,
				height: guide.height() - 5
			};
		}

		return size;
	}

	$(document).on('touchstart', '.edit-button', function(e) {
		var button = $(this).parents('.remote-button');
		editButton(button);

		e.stopPropagation();
	});

	$(document).on('touchstart', '.delete-button', function(e) {
		var button = $(this).parents('.remote-button');

		if (Ti) {
			$.publish('control.button.confirmDelete', getBtn(button));
		} else {
			$.publish('control.button.delete', getBtn(button));
		}
		
		e.stopPropagation();
		
		return false;
	});

	$(document).on('touchstart', 'body.edit .remote', function(e) {

		if (e.originalEvent.touches.length != 1) {
			return;
		}

		var t = $(e.target);
		if (t.is('.edit-button, .delete-button') || t.parents('.edit-button, .delete-button').length) {
			return;
		}

		var touch = e.originalEvent.touches[0];
		var button = $(document.elementFromPoint(touch.clientX, touch.clientY));

		if (!button.hasClass('remote-button')) {
			button = button.parents('.remote-button');
		}

		if (!button.length || button.is('.empty')) {
			return;
		}

		var offset = {
			top:button.position().top - touch.clientY,// + 2 /*for the scaling we do*/,
			left: button.position().left - touch.clientX// + 2
		};

		if (dragSource) {
			console.warn('We were already dragging. Something is going wrong.');
			stopDrag();
		}

		console.log('Starting drag of button', button);

		startDrag(button, offset, touch);
		doDrag(e);

		dragStartedTime = new Date().getTime();
		clickTarget = button;

	});

	var dragSource, dragOffset;

	function startDrag(button, offset, touch) {
		try {
			navigator.vibrate(100);
		} catch(e) {
			try {
				navigator.notification.vibrate(100);
			} catch(e2) {
				// Yeah, I've never actually run this code... so let's be careful.
			}
		}

		dragSource = button;
		dragOffset = offset;

		button.addClass('drag-source');
		$('body').addClass('dragging');

	}

	$(document).on('touchstart', '.edit .empty', function(e) {

		var button = $(e.target);

		if (button.hasClass('.remote-button')) {
			button = button.parents('.remote-button');
		}

		var newButton = {
			x: button.parents('td').getNonColSpanIndex(),
			y: button.parents('tr').index()
		};
		console.log('Creating new button', newButton, ' at', button);



		var remote = button.parents('.remote');
		var parent;
		if (remote.data('remote-id')) {
			newButton.parent = remote.data('remote-id');
			parent = getBtn(newButton.parent+'');

			if (parent.widget) {
				newButton.widget = parent.widget;
			}
		}

		$.publish('control.button.create', newButton, parent);

		e.preventDefault();
	});

	$(document).on('tap', '.edit .remote-button', function(e) {
		clearTimeout(endTouchingTimeout);

		console.log('Considering that a click to', e);
		stopDrag();
		
		var originalTarget = $(e.originalEvent.target);

		if (originalTarget.hasClass('delete-button') || originalTarget.parents('.delete-button').length ||
			originalTarget.hasClass('edit-button') || originalTarget.parents('.edit-button').length) {
			return;
		}

		var $this = $(this);
		if ($this.is('.empty')) {
			// TODO: This is handled somewhere else...
			return;
		} else if ($this.is('.active')) {
			ninja.control.remote.resetUI();
		} else if ($this.is('[data-remote]')) {
			$.publish('control.remote.show', $this);
		} else {
			editButton($this);
		}

		console.log(e);

	});

	$(document).on('touchend', function(e) {

		if (dragSource) {
			endTouchingTimeout = setTimeout(function() {
				stopDrag(e.changedTouches[0]);
			}, 0);
		}
	});

	var getBtn = ninja.control.remote.getBtn;

	function editButton(button) {

		var buttonObj = ninja.control.remote.getBtn(button);
		$.publish('control.button.edit', buttonObj,  getBtn(button));

		// Gives us the tiny (1 frame) flash on activate
		button.removeClass('hover');
		window.requestAnimationFrame(function() {
			button.addClass('hover');

			setTimeout(function() {
				button.removeClass('hover');
			}, 100);
		});

	}

	var doDrag = (function() {

		var lastX, lastY;

		return function(e) {

			if (!dragSource) {
				return;
			}

			e.preventDefault();

			if(e.touches.length == 1){

				var touch = e.touches[0];

				//console.log(touch.clientX, touch.clientY);

				moveButtonIntoPosition(dragSource, {
					'top' : touch.clientY,
					'left' : touch.clientX
				}, dragOffset);

				dragSource.css('visibility', 'hidden');
				var target = $(document.elementFromPoint(touch.clientX, touch.clientY));
				//console.log('target', target.parents('.remote-button')[0]);
				dragSource.css('visibility', 'inherit');

				if (target.is('td')) {
					return;
				}

				if (!target.hasClass('remote-button')) {
					target = target.parents('.remote-button');
				}

				if (target.hasClass('moved')) {
					resetMovedButton();
				} else if (target.length) {
					if (!dragSource.length) {
						console.error('Things be going wrong');
						return;
					}

					resetMovedButton();

					hasSwapped = true;

					moveButtonIntoPosition(target, getPosition(dragSource.parent().attr('id')));

				}

			}

		};
	})();

	function resetMovedButton() {
		$('.moved').not('.drag-source').removeClass('moved').css({
			top: 0,
			left: 0,
			width: '100%',
			height: '100%'
		});
	}

	// ES: TODO: Add animation here
	function moveButtonIntoPosition(e, pos, offset) {

		e.css({
			top: pos.top + (offset? offset.top : 0),
			left: pos.left + (offset? offset.left : 0)
		});

		if (!e.hasClass('moved')) {
			//var size = getSize(e.parent().attr('id'));
			e.css({
				width: getButtonSize(e.parent('td')).width,
				height: getButtonSize(e.parent('td')).height
			}).addClass('moved');
		}

	}

	//$(document).on('touchmove', doDrag);

	//*
	// The following code tries to bind touchmove to requestanimationframe,
	// ensuring we aren't hammering slow *cough* android *cough* devices.
	var nextDrag;
	$(document).on('touchmove', function(e) {
		nextDrag = dragSource? e : null;
	});
	function doNextDrag() {
		if (nextDrag) {
			doDrag(nextDrag);
			nextDrag = null;
		}
		requestAnimationFrame(doNextDrag);
	}
	requestAnimationFrame(doNextDrag);
	//*/


	function stopDrag(lastTouch) {

		resetMovedButton();

		$('.dragging').removeClass('dragging');

		clickTarget = null;

		var source;
		if (dragSource) {

			source = dragSource.removeClass('drag-source').removeClass('moved').css({
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			});
			dragSource = null;
		}


		if (!lastTouch || !source) {
			// This drag was cancelled. Probably a tap. Just reset the UI.
			return;
		}


		var target = $(document.elementFromPoint(lastTouch.clientX, lastTouch.clientY));

		if (!target.hasClass('remote-button')) {
			target = target.parents('.remote-button');
		}
		console.log('Final swap', source, target);

		if (target[0] == source[0] || !target.length || (source.is('.empty') && target.is('.empty'))) {
			return;
		}



		// If we are on a submenu and the target is the owner of that submenu,
		// we need to move it, not the source.

		var toMove = target.is('.active')? target : source,
			destination = target.is('.active')? source : target;

		var button = getBtn(toMove);
		// Publish the new location of source. The store will take care of all the other buttons that need to be moved.
		$.publish('control.button.move.' + button.id, _.extend({}, button, {
			x: destination.parents('td').getNonColSpanIndex(),
			y: destination.parents('tr').index()
		}));
	}

	$(document).on('touchstart', 'header .edit', toggleEdit);

	function toggleEdit(e) {
		if (e) {
			e.preventDefault();
		}
		if ($('body').hasClass('edit')) {
			endEditMode();
		} else {
			$('body').addClass('edit');
			$(this).addClass('active');
			ninja.control.header.reset();
		}
	}

	$.subscribe('control.toggleEdit', toggleEdit);

	$(document).on('touchstart', 'header .settings', function(e) {
		$.publish('control.settings.show');
	});

	function endEditMode() {
		ninja.control.remote.resetUI();
		$('body').removeClass('edit');
		$('header .edit').removeClass('active');

		ninja.control.header.reset();
	}


})(namespace('ninja.control.remote'));
