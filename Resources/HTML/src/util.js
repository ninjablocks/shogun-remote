/*jshint evil:true */
//console.log = console.info = function() {};

window.id = Math.floor(Math.random() * 100);


// Titanium's log only allows one argument :/
function fire(level) {
	return function() {
		return;
		/*var strings = _.map(Array.prototype.slice.call(arguments), function(i) {
			try {
				if (typeof i == 'string' || i === null || i === undefined || typeof i === 'number' || typeof i === 'boolean') {
					return i;
				} else if (i.jquery) {
					return $('<div>').append(i.clone()).html();
				} else if (i.outerHTML) {
					return i.outerHTML;
				}
				return i+'';//JSON.stringify(i).replace(/\s+/g, ' ');
			} catch(e) {
				return '[BAD CYCLICAL] ' + i;
			}
		});
		Ti.App.fireEvent('webview.log', {data:window.id + ' - ' + strings.join(', '), level: level});*/
	};
}
if (Ti) {
    console.log = fire('log');
    console.debug = fire('debug');
    console.warn = fire('warn');
    console.error = fire('error');
}

window.onerror = function(a,b,c,d) {
	//alert(JSON.stringify(a) + JSON.stringify(b) + JSON.stringify(c));
};

//Small Jquery/ender<->JST plugin
if (typeof window !== 'undefined') {

    (function($) {

        var tmpls = {};

        $.fn.fromTmpl = function(tmplId, data, optFlags) {
            //console.log('tmpl', $('#'+tmplId));
            var html = $('#'+tmplId).render(data, optFlags);
            //console.log('data')
            //console.log('result html', html, data);
            //console.log('target', this, $(this));
            this[0].innerHTML = html;
            return this;
        };

        $.fn.render = function(data, optFlags) {
            var el = $('#'+$(this[0]).data('template'));
            try {
                $(this).html(el.process(data));
            } catch(e) {
                console.error('Failed to process html ', e, el.process(data)+'');
            }
            return this;
        };

        $.fn.process = function(data, optFlags) {
            var el = $(this[0]);
            var id = el.attr('id');
            if (!tmpls[id]) {
                try {
                    var html = el.data('source') || el.html();
                    tmpls[id] = TrimPath.parseTemplate(html.replace('\n', ''), null);
                } catch(e) {
                    console.error('failed to parse', el.html(), e);
                    throw e;
                }
            }

            return tmpls[id].process(JSON.parse(JSON.stringify(data)), optFlags);
        };

        $.fn.tmpl = function() {
            return TrimPath.parseTemplate($(this[0]).html().replace('\n', ''));
        };

        window.$T = function(tmplId, data, optFlags) {
            return $('#'+tmplId).process(data, optFlags);
        };

    })(window.$ || window.jQuery);
}

function namespace(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';

    for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }

    return parent;
}

function namespaceLog(namespaceString) {
    return function() {
        var args = Array.prototype.slice.call(arguments); // ES: js is a jerk.
        args.unshift(namespaceString);
        console.log.apply(console, args);
    };
}

var tiEventListeners = [];

/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011 (Modified by Elliot)
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
;(function(d){

    // the topic/subscription hash
    var cache = {};
    
    function titaniumCares(topic) {

	return [
		'widgets.ready',
		'control.ready',
		'control.load',
		'control.states',
		'control.button.confirmDelete',
		'control.button.create',
		'control.button.move',
		'control.button.update',
		'control.button.edit',
		'control.settings.show'
	].indexOf(topic) > -1;
    }


    if (Ti) {
        Ti.App.addEventListener('publish',  function(e) {
            d.publish.apply(d, [e.topic].concat(e.data));
        });
    }

	function filterEl(args) {
		return _.filter(args, function(a) {
			return !a || (a && !a.ownerDocument);
		});
	}

    d.publish = function(topic){
		
        var target = topic;
        var args = Array.prototype.slice.call(arguments, 1);

        console.info('>> Event [' +topic + ']');

        var keepGoing = true;

        var go = function(t){
            if (keepGoing !== false) {
                try {
                    keepGoing = t.apply(d, [topic].concat(args) || [topic]);
                } catch(e) {}
            }
        };

        if (Ti) {
            //Ti.App.fireEvent('*', {data:[], topic: topic, windowId: window.id});
        }
        _.each(cache['*']||[], go);

        while (target) {
            _.each(cache[target]||[], go);
            if (Ti && titaniumCares(target)) {
				console.log('Firing', target, ' to titanium');
                Ti.App.fireEvent(target, {data:filterEl(args), topic: target});
            } else {
				console.log('Not firing', target, 'to titanium');
            }
            target = target.substring(0, target.lastIndexOf('.'));
        }

    };

    d.publishAsync = function() {
        var args = Array.prototype.slice.call(arguments);
        setTimeout(function() {
            d.publish.apply(null, args);
        }, 1);
    };

    d.subscribe = function(/* String */topic, /* Function */callback){
        if (typeof topic == 'function') {
            callback = topic;
            topic = '*';
        }
        if(!cache[topic]){
            cache[topic] = [];
        }
        cache[topic].push(callback);
        return [topic, callback]; // Array
    };

    d.unsubscribe = function(/* Array */handle){
        var t = handle[0];
        if (cache[t]) {
            d.each(cache[t], function(idx){
                if(this === handle[1]){
                    cache[t].splice(idx, 1);
                }
            });
        }
    };

})(window.$ || window.jQuery);


// requestAnimationFrame polyfill from : http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

$.fn.getNonColSpanIndex = function() {
    if(! $(this).is('td') && ! $(this).is('th'))
        return -1;

    var allCells = this.parent('tr').children();
    var normalIndex = allCells.index(this);
    var nonColSpanIndex = 0;

    allCells.each(
        function(i, item)
        {
            if(i == normalIndex)
                return false;

            var colspan = $(this).attr('colspan');
            colspan = colspan ? parseInt(colspan, 10) : 1;
            nonColSpanIndex += colspan;
        }
    );

    return nonColSpanIndex;
};

function evalScoped(code, scope) {
    'use strict';

    //console.log('scoping with ', scope, code);

    // execute script in 'private' context
try {
	(new Function(code)).call(scope);
} catch(e) {
	console.log('Eval Error!', e);
}
return scope;
}

Object.values = function (obj) {
    var vals = [];
    for( var key in obj ) {
        if ( obj.hasOwnProperty(key) ) {
            vals.push(obj[key]);
        }
    }
    return vals;
};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}
