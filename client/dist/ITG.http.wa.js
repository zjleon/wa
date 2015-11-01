/*! webAnalytic - v0.1.0 - 2015-10-02 */
(function(){
/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
define('core/exports',[],function(){
	return window;
});

define('data/queue/q',[],function(){
	return [];
});
define('data/queue/k',[],function(){
	return [];
});
define('config/info',{
	server:{
		protocol: 'http',
		host: 'c0007294.itcs.hp.com',
		port: '8088',
		postSuffix: 'MetricService.ashx',
		getSuffix: ''
	},
	user:{},
	app: {
		appId: null,
		env: null
	},
	logMsg: true
	// cookie: {
		// trackID_cookieName: '_wa_trackID',
		// trackID_expires: 0,
		// machineID_cookieName: '_wa_machineID',
		// machineID_expires: 1438560, // 999 days
		// sessionID_cookieName: '_wa_sessionID',
		// sessionID_expires: 20
	// }
});
define('util/log',[
	'config/info',
	'core/exports'
], function(info, win){
	return function(obj){
		if(!win.console || !info.logMsg){
			return;
		}
		if(obj.stack){
			// if this is a try catch error, the obj will have a error stack
			win.console.log(obj.stack);
		}else{
			win.console.log(obj);
		}
	};
});
/*
	* Should look like:
	* 'timerName': {
			'begin': now(),
			'pause': [],
			'resume': []
		}
*/

define('time/timerList',{});
define('time/timer',[
	'core/exports',
	'util/log',
	'time/timerList',
], function(exports, log, timerList){
	function now(){
		if(exports.Date.now){
			return exports.Date.now().valueOf();
		}else{
			return (new exports.Date()).valueOf();
		}
	}
	
	// The timer only can be one of these two state, paused or counting.
	function isPaused(timer){
		// the pause array can not be add data until the timer is resume, 
		// so we can use totally equal here.
		if(timer.pause.length === timer.resume.length + 1){
			return true;
		}else{
			return false;
		}
	}
	
	function begin(name){
		if(!name){
			log('Must give a name to begin a timer, abort create.');
			return false;
		}
		if(timerList[name]){
			log('timer ' + name + ' is exsited, abort create.');
			return false;
		}
		timerList[name] = {
			'begin': now(),
			'pause': [],
			'resume': []
		};
	}
	
	function pause(name){
		if(!timerList[name]){
			log('timer ' + name + ' is not exsited, abort pause.');
			return false;
		}
		// make sure the timer is resumeed.
		if(isPaused(timer)){
			log('timer ' + name + ' is paused, abort pause.');
			return false;
		}
		timerList[name].pause.push(now());
	}
	
	function resume(name){
		var t,
				tmp1;
		t = timerList[name];
		if(!t){
			log('timer ' + name + ' is not exsited, abort resume.');
			return false;
		}
		// make sure the timer is paused.
		if(!isPaused(timer)){
			log('timer ' + name + ' is counting, abort resume.');
			return false;
		}
		
		timerList[name].resume.push(now());
	}
	
	function elapse(name){
		var r,
				i,
				t,
				tmp1,
				pauseArr,
				resumeArr,
				totalPaused,
				stopTimePoint;
		t = timerList[name];
		if(!t){
			log('timer ' + name + ' is not exsited, abort elapse.');
			return;
		}
		pauseArr = timerList[name].pause;
		resumeArr = timerList[name].resume;
		if(pauseArr > resumeArr){
			// If the timer is paused, use the last time stamp as the end point.
			stopTimePoint = pauseArr[pauseArr.length - 1];
		}else{
			// Otherwise use current time stamp as end point.
			stopTimePoint = now();
		}
		
		totalPaused = 0;
		i = resumeArr.length;
		if(i){
			while(i--){
				// Calculate the total pause time.
				totalPaused += resumeArr[i] - pauseArr[i];
			}
		}
		
		r = stopTimePoint - totalPaused - t.begin;
		return r;
	}
	
	function reset(name){
		timerList[name] = {
			'begin': now(),
			'pause': [],
			'resume': []
		};
		log('timer ' + name + ' has been reset.');
	}
	
	
	return {
		begin: begin,
		pause: pause,
		resume: resume,
		elapse: elapse,
		reset: reset,
		now: now
	};
	
});
define('time/api',[
	'time/timer'
], function(timer){
	return timer;
});
// there will be two parameters pass to the onReady callback:
// first: queue data,
// second: all storageKeys in this queue 

define('data/queue/service',[
	'data/queue/q',
	'data/queue/k',
	'util/log',
	'time/api'
], function(q, k, log, time){
	var onReady,
			lastSend = null,
			firstPush = null,
			queuePromise = null,
			queueCheckTimer = null;
	
	function pub(cmd, value){
		if(cmd === 'check'){
			check();
			return;
		}
		if(cmd === 'later'){
			later(value);
			return;
		}
		if(cmd === 'ready'){
			ready(value);
			return;
		}
	}
	function sub(func){
		// register the callback function. 
		onReady = func;
	}
	// add data to queue, and do the initial task.
	// 'skipCheck' can be true, this is called by the ajax failed
	function add(data, key, skipCheck){
		var now = time.now();
		// store the data
		q.push(data);
		// store the key
		k.push(key);
		
		if(!firstPush){
			// record the first push time stamp
			firstPush = now;
		}
		// record last send time stamp, 
		// make sure the first push call can use queue
		if(!lastSend){
			lastSend = now;
		}
		// publish message.
		pub('check');
	}
	// this function should return the queue if the queue can be sent,
	// return false if queue can not be sent.
	function check(){
		var tmp1,
				now,
				r = {},
				keys = [],
				sendInterval = 1500,
				pushInterval = 1500;
		now = time.now();
		// console.log(now - lastSend);
		// console.log(now - firstPush);
		if(
			// when queue length over 50
			q.length>50
			||
			// when queue has data and it over 1.5 second from last send and 1.5 second from the first push
			q.length>0 && (now - lastSend) > sendInterval && (now - firstPush) > pushInterval
		){
			lastSend = now;
			firstPush = null;
			// new an Array then give it to the result
			r.q = [].concat(q);
			r.k = [].concat(k);
			q = [];
			k = [];
			
			// cancel the check timer
			pub('later', false);
			pub('ready', r);
		}else if(
			// make sure there will not make an infinite loop
			q.length>0
		){
			// check later
			pub('later', true);
		}
	}
	function later(checkLater){
		var timerInterval = 800;
		// clear timer no matter what hapen
		clearTimeout(queueCheckTimer);
		queueCheckTimer = null;
		
		if(checkLater){
			// set a timer to check queue later.
			queueCheckTimer = setTimeout(function(){
				pub('check');
			}, timerInterval);
		}
	}
	function ready(r){
		// console.dir(r);
		// return;
		if(onReady){
			onReady(r.q, r.k);
		}else{
			log('onReady callback not defined');
		}
	}
	
	return {
		add:add,
		sub:sub
		// isReadyDefined:(function(){
			// return onReady ? true : false;
		// })()
	};
});
define('data/queue/api',[
	'data/queue/service'
], function(service){
	return service;
});
define('config/api',[
	'config/info',
	'util/log'
], function(info, log){
	function get(cate, name){
		return info[cate][name];
	}
	function set(name, value){
		if(info.user.hasOwnProperty(name)){
	    info.user[name] = value;
	    return true;
    }
		if(info.app.hasOwnProperty(name)){
	    info.app[name] = value;
	    return true;
    }
		if(name === 'logMsg'){
	    info.app.logMsg = value;
	    return true;
    }
    log('could not find "' + name + '" in info.js.');
		return false;
	}
	// function set(cate, name, value){
		// if(info[cate].hasOwnProperty(name)){
	    // info[cate][name] = value;
	    // return true;
    // }
    // log('could not find "' + name + '" in ' + cate + '.');
		// return false;
	// }
	
	return {
		server:{
			getPostURL:(function(){
				var url;
				url = info.server.protocol;
				url += '://';
				url += info.server.host;
				url += ':';
				url += info.server.port;
				url += '/';
				url += info.server.postSuffix;
				return url;
			})()
		},
		set: set,
		user:{
			get:function(value){
				return get('user', value);
			},
			// set:function(name, value){
				// return set('user', name, value);
			// },
			all:function(){
				return info.user;
			}
		},
		app:{
			// set:function(name, value){
				// return set('app', name, value);
			// },
			all:function(){
				return info.app;
			}
		},
		log: info.logMsg
	};
});
// Time is base on minutes
define('cookie/cookie',[],function(){
	function getCookie(name){
	    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
	     if(arr != null){
	     	return unescape(arr[2]);
	     }
	     return null;
	}
	function setCookie(name, value, minutes){
    var cookie = name + "="+ escape (value);
		var expires;
		if(typeof minutes === 'string'){
			//try to parse string to number
			minutes = parseInt(minutes);
		}
		//if expires equal to 0, don't set cookie expires
		if(minutes){
			expires = new Date();
    	expires.setTime((new Date()).getTime() + minutes*60*1000);
    	cookie += ";expires=" + expires.toGMTString();
		}
    cookie += ';path=/';
    document.cookie = cookie;
	}
	function updateCookie(name, minutes){
		var val;
		if((val = getCookie(name))){
			setCookie(name, val, minutes);
		}
	}
	function delCookie(name){
	    var val = getCookie(name);
    	setCookie(name, '', -5);
	}
	var cookie = {
		set: setCookie,
		get:getCookie,
		update:updateCookie,
		del:delCookie
	};
	
	return cookie;
});

define('cookie/guid',[],function(){
	return function(){
		return 'xxxxxxxx-xxxx-zxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g , function(c){
			var r = Math.random()*16|0,
						v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}).toUpperCase();
	};
});
// This module return json type string

define('cookie/id',[
	'cookie/cookie',
	'cookie/guid'
], function(cookie, guid){
	function setID(key, value){
		if(key === 't'){
			cookie.set('_wa_trackID', value, '0');
			return value;
		}
		if(key === 'm'){
			cookie.set('_wa_machineID', value, '1438560');
			return value;
		}
		if(key === 's'){
			cookie.set('_wa_sessionID', value, '20');
			return value;
		}
	}
	
	function getID(){
		var tID,
				mID,
				sID,
				tmp1;
		tmp1 = [];
		tID = cookie.get('_wa_trackID');
		if(!tID){
			tID = guid();
			setID('t', tID);
		}
		tmp1.push('"tracking-id":"'+tID+'"');
		
		mID = cookie.get('_wa_machineID');
		if(!mID){
			mID = guid();
			setID('m', mID);
		}else{
			//keep cookie alive while user doing operation
			cookie.update('_wa_machineID', '1438560');
		}
		tmp1.push('"machine-id":"'+mID+'"');
		
		sID = cookie.get('_wa_sessionID');
		if(!sID){
			sID = guid();
			setID('s', sID);
		}else{
			//keep cookie alive while user doing operation
			cookie.update('_wa_sessionID', '20');
		}
		tmp1.push('"session-id":"'+sID+'"');
		
		if(!tmp1.length){
			tmp1 = '';
		}else if(tmp1.length === 1){
			tmp1 = tmp1[0];
		}else{
			tmp1 = tmp1.join(',');
		}
		return tmp1;
	}
	
	
	return getID;
});
//make old browser support json convert
define('oldBrowser/JSON',[
	'core/exports'
], function (exports) {
		if(exports.JSON){
			return null;
		}
		
		var JSON = {};
		
    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx,
        escapable,
        gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
    
    exports.JSON = JSON;
    
    return null;
});
define('util/JSON',[
	'core/exports',
	'oldBrowser/JSON'
], function(exports){
	// The JSON object will add to window object if it not exsit.
	require('oldBrowser/JSON');
	return exports.JSON;
});
define('data/wrap/service',[
	'config/api',
	'cookie/id',
	'time/api',
	'util/JSON',
	'util/log'
], function(userInfo, getID, time, JSON, log){
	function wrap(queue){
		var result,
				targetData = [];
		targetData.push(getID());
		targetData.push(JSON.stringify(userInfo.user.all()).replace(/^{/g, '').replace(/}$/g, ''));
		targetData.push(JSON.stringify(userInfo.app.all()).replace(/^{/g, '').replace(/}$/g, ''));
		targetData.push('"queue":' + JSON.stringify(queue));
		targetData.push('"time":' + time.now());
		result = '{';
		result += targetData.join(',');
		result += '}';
		// log(result);
		return result;
	}
	
	return wrap;
});
define('data/wrap/api',[
	'data/wrap/service'
], function(wrap){
	return wrap;
});
// the localStorage will be add to window object,
// This module will return null.

define('oldBrowser/localStorage',[
	'core/exports'
], function(exports){
	// module will be run if it loaded by requirejs,
	// so need to prevent this action in modern browser
	if(exports.localStorage){
		return exports.localStorage;
	}

	// globalStorage
	// non-standard: Firefox 2+
	// https://developer.mozilla.org/en/dom/storage#globalStorage
	if ( exports.globalStorage ) {
		// try/catch for file protocol in Firefox
		// try {
			// exports.localStorage = exports.globalStorage;
		// } catch( e ) {}
		return exports.globalStorage;
	}

	// userData
	// non-standard: IE 5+
	// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
	var div = exports.document.createElement( "div" ),
			attrKey = "localStorage";
	div.style.display = "none";
	exports.document.getElementsByTagName( "head" )[ 0 ].appendChild( div );
	// if ( div.addBehavior ) {
		div.addBehavior( "#default#userdata" );
		//div.style.behavior = "url('#default#userData')";

		var localStorage = {
			"length":0,
			"setItem":function( key , value ){
				div.load( attrKey );
				key = cleanKey(key );

				if( !div.getAttribute( key ) ){
					this.length++;
				}
				div.setAttribute( key , value );

				div.save( attrKey );
			},
			"getItem":function( key ){
				div.load( attrKey );
				key = cleanKey(key );
				return div.getAttribute( key );

			},
			"removeItem":function( key ){
				div.load( attrKey );
				key = cleanKey(key );
				div.removeAttribute( key );

				div.save( attrKey );
				this.length--;
				if( this.length < 0){
					this.length=0;
				}
			},

			"clear":function(){
				div.load( attrKey );
				var i = 0;
				while ( attr = div.XMLDocument.documentElement.attributes[ i++ ] ) {
					div.removeAttribute( attr.name );
				}
				div.save( attrKey );
				this.length=0;
			}, 

			"key":function( key ){
				var n;
				div.load( attrKey );
				n = div.XMLDocument.documentElement.attributes[ key ];
				// n will be null if key is not exsit,
				// and will be an object if key is exsit and have an attribute 'name'
				return n ? n.name : n;
			}

		};

		// convert invalid characters to dashes
		// http://www.w3.org/TR/REC-xml/#NT-Name
		// simplified to assume the starting character is valid
		var cleanKey = function( key ){
			return key.replace( /[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );
		};

		div.load( attrKey );
		localStorage["length"] = div.XMLDocument.documentElement.attributes.length;
		
		// XXX:Set the localStorage object will cause error 'member not found' in IE8, weird
		// window.localStorage = localStorage;
	// }
	return localStorage;
});
define('util/localStorage',[
	'core/exports',
	'oldBrowser/localStorage'
], function(exports){
	if(exports.localStorage){
		return exports.localStorage;
	}else{
		// see the note in localStorage to figure out why use return.
		return require('oldBrowser/localStorage');
	}
	
});
define('util/roll',[],function(){
	return function(start , end){
		return Math.floor(Math.random() * (end - start + 1) + start);
	};
});
define('util/dcopy',[],function () {
    var api = {};

		/**
		 * Deep copy any object or array.
		 *
		 * @param {Object/Array} target
		 * @return {Object/Array} copy
		 * @api public
		 */
		
		api.dcopy = function (target) {
		    var copy = (target instanceof Array) ? [] : {};
		    (function read (target, copy) {
		        for (var key in target) {
		            var obj = target[key];
		            if (obj instanceof Array) {
		                var value = [],
		                    last = add(copy, key, value);
		                read(obj, last);
		            } else if (obj instanceof Object) {
		                var value = {},
		                    last = add(copy, key, value);
		                read(obj, last);
		            } else {
		                var value = obj;
		                add(copy, key, value);
		            }
		        }
		    }(target, copy));
		    return copy;
		};
		
		/**
		 * Adds a value to the copy object based on its type.
		 *
		 * @api private
		 */
		
		function add (copy, key, value) {
		    if (copy instanceof Array) {
		        copy.push(value);
		        return copy[copy.length-1];
		    } else if (copy instanceof Object) {
		        copy[key] = value;
		        return copy[key];
		    }
		}

    return api.dcopy;
});
define('data/storage/service',[
	'util/localStorage',
	'util/log',
	'util/roll',
	'util/dcopy',
	'util/JSON'
], function(localStorage, log, roll, dcopy, JSON){
	var storagePrefix = 'wa_';
	var reg = new RegExp('^' + storagePrefix + '\\d+$');
	
	//return object
	function getStorage(key){
		var r;
		try{
			r = JSON.parse(localStorage.getItem(key));
		}catch(e){
			log(e);
			r = null;
		}
		return r;
	};
	
	// return all wa stored objects in an Array.like below
	// [
		// {
			// key:key,
			// value:object
		// }
	// ]
	function getAllStorages(){
		var i,
				tmp1,
				r = [],
				storage = localStorage;
		i = storage.length;
		if(i === 0){
			return r;
		}
		// try{
			while(i--){
				tmp1 = {};
			  tmp1.key = storage.key(i);
			  reg.lastIndex = 0;
				// console.log(key);
			  if(reg.test(tmp1.key)){
			  	tmp1.value = JSON.parse(storage.getItem(tmp1.key));
					r.push(tmp1);
			  }
			}
		// }catch(e){
			// log(e);
			// r = [];
		// }
		return r;
	};
	
	// add value to localStorage with prefix.
	// return the key, with prefix
	function setStorage(value){
		var key,
				v,
				storage = localStorage;
		key = storagePrefix + roll(0, 999999);
		if(getStorage(key)){
			// remove the key before set it.
			storage.removeItem(key);
		}
		
		// create a new obj to make this function can be cycle
		v = dcopy(value);
		//v.storageKey = key;
		storage.setItem(key, JSON.stringify(v));
		
		return key;
	};
	
	// key can be an Array(multiple) or a string(single)
	function removeStorage(key){
		var i,
				keys = [],
				storage = localStorage;
		// support for single or multiple remove
		if(typeof key === 'string'){
			keys.push(key);
		}else{
			keys = keys.concat(key);
		}
		i = keys.length;
		while(i--){
			// console.log(keys[i]);
			storage.removeItem(keys[i]);
		}
	};
	// clear all storages with prefix 'wa_'.
	function clear(){
		var i,
				key,
				storage = localStorage;
		// console.log('l:'+storage.length);
		i = storage.length;
		if(i === 0){
			return;
		}
		while(i--){
		  // storage.getItem(storage.key(i));
		  key = storage.key(i);
		  reg.lastIndex = 0;
		  // console.log(reg.test(key));
		  if(reg.test(key)){
				storage.removeItem(key);
		  }
		}
	}
	
	return {
		get: getStorage,
		all: getAllStorages,
		set: setStorage,
		remove: removeStorage,
		clear: clear
	};
});
define('data/storage/api',[
	'data/storage/service'
], function(storage){
	// console.log(storage.getStorage);
	// return {
		// get: storage.getStorage,
		// all: storage.getAllStorages,
		// set: storage.setStorage,
		// remove: storage.removeStorage
	// };
	return storage;
});
define('oldBrowser/xDomaimRequest',[
	'core/exports'
], function(exports){
	return function(){
		var xdr = XDomainRequest.XDomainRequest;
		if(!xdr){
			return null;
		}
		var XMLHttpReq = new xdr();
		if (!XMLHttpReq.setRequestHeader) {
			XMLHttpReq.setRequestHeader = function(){};
		}
		if (!XMLHttpReq.getAllResponseHeaders) {
			XMLHttpReq.getAllResponseHeaders = function(){};
		}
		var open = XMLHttpReq.open;
		XMLHttpReq.open = function () {
			var sc = 'SESSION_COOKIE_NAME';
			var sessionCookie = sc in window ? window[sc] : "jsessionid";
		    var cookie = new RegExp('(?:^|; )' + sessionCookie + '=([^;]*)', 'i').exec(document.cookie);
		    cookie = cookie && cookie[1];
		    if (cookie) {
		        var q = arguments[1].indexOf('?');
		        if (q == -1) {
		            arguments[1] += '?' + sessionCookie + '=' + cookie;
		        } else {
		            arguments[1] = arguments[1].substring(0, q) + '&' + sessionCookie + '=' + cookie + arguments[1].substring(q);
		        }
		    }
		    return open.apply(this, arguments);
		};
		return XMLHttpReq;
	};
});
define('http/request',[
	'oldBrowser/xDomaimRequest'
], function(){
	function create(){
		var tmp1, 
				xdr,
				XMLHttpReq = null;
		if(XMLHttpRequest){
			XMLHttpReq = new XMLHttpRequest();
			// XMLHttpReq has NO hasOwnproperty method in IE
			if(!('withCredentials' in XMLHttpReq)){
				XMLHttpReq = null;
			}
		}
		// for mobile, just exclude compatible script
		if(!XMLHttpReq && typeof XDomainRequest !== 'undefined'){
			// XXX: notice that: if you want to exclude a module, 
			//			you must NOT define it as a parameter in the define's function, 
			//			but use a require format to save it.
			xdr = require('oldBrowser/xDomaimRequest');
			if(xdr){
				XMLHttpReq = xdr();
			}
		}
		return XMLHttpReq;
	}
	
	return create;
});

define('util/extend',[],function(){
	return function(obj1, obj2, keepOwnProperty) {
		var i, obj3 = {};
		obj2 = obj2 || {};
		for(i in obj1) {
			obj3[i] = obj1[i];
			if(obj2[i] != null) {
				if(keepOwnProperty) {
					if(obj1.hasOwnProperty[i]) {
						obj3[i] = obj2[i];
					}
				} else {
					obj3[i] = obj2[i];
				}
			}
		}
		return obj3;
	};
});
// This module will return a promise object that can be chain.
// This promise will return reject format like below when ajax goes into some trouble:
/* {
			// options will put into req.opt
			request: req, 
			message: 'request timeout'
		}
*/
// 14-7-27:put the request option into the XMLRequest object 
//         to avoid option load error when it been called multi times

define('http/post',[
	'config/api',
	'http/request',
	'util/JSON',
	'util/extend',
	'util/log'
], function(config, createRequest, JSON, extend, log){
	function sendRequestByPost(param){
		return new Promise(function(resolve, reject){
	    var url,
		    	opt,
		    	req = createRequest();
	    if(!req){
	    	return;
	    }
	    req.opt = extend({
				url:config.server.getPostURL,
				dataType:'normal',
				data:null,
				//begin:null,
				// success:null,
				// error:null,
				timeout:0
				// retry:0
			} , param);
			if(!req.opt.url){
				reject({
					request: req, 
					// options: opt, 
					message: 'no url'
				});
			}
			//only use 'post' method
			req.open('POST' , req.opt.url, true);
			req.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=utf-8');
			if(req.opt.dataType==='json'){
				req.opt.data = JSON.stringify(req.opt.data);
				req.setRequestHeader('Accept','application/json, text/javascript');
				// req.setRequestHeader('Accept','*/*');
				// Accept: application/json, text/javascript, */*; q=0.01
			}else{
				req.setRequestHeader('Accept','*/*');
			}
			// XXX: delete begin callback, It seems useless
			// if(opt.begin){
				// opt.begin(req, opt);
			// }
			if(req.opt.timeout){
				req.timeout = req.opt.timeout;
				req.ontimeout = function(){
					reject({
						request: req, 
						// options: opt, 
						message: 'request timeout'
					});
				};
			}
			//error callback
			req.onerror = function(){
				reject({
					request: req, 
					// options: opt, 
					message: 'request error'
				});
			};
			req.withCredentials = true;
			req.onload = function(){
				// XXX: the return data format MUST be JSON
				// function processResponse(req) {
					// var data;
					// if(req.opt.dataType==='json'){
						// // log(req);
						// data = JSON.parse(req.responseText);
					// }else{
						// data = req.responseText;
					// }
					// return data;
				// }
				var data,
						msg = '',
						isSuccess,
						responseText = '';
				if(req.responseText){
					try{
						// In this state, there must be a string return by server, 
						// so we don't need to handle the state code
						// but we can't sure if this returned data can be parse to json,
						// for example the response has a 302 return and redirect to an html page.
						// console.log(req.responseText);
						responseText = JSON.parse(req.responseText);
						if(responseText.result === 0){
							isSuccess = true;
						}else{
							isSuccess = false;
							msg = responseText.message;
						}
					}catch(e){
						// reject({
							// request: req, 
							// // options: opt, 
							// message: 'parse error'
						// });
						isSuccess = false;
						// TODO: change to the error message
						msg = 'parse error';
					}
				}else{
					// if there are no text in the responseText,
					// consider it done.
					isSuccess = true;
				}
				if(isSuccess){
					// data = JSON.parse(req.responseText);
					resolve(responseText);
				}else{
					reject({
						request: req, 
						// options: opt, 
						message: msg
					});
				}
			};
			req.send(req.opt.data);
		});
	};
	
	return sendRequestByPost;
});

define('http/retry',[
	'time/api',
	'data/queue/q',
	'data/queue/k'
], function(time, queue, keys){
	var maxTry = 2,
			retry = 0,
			lastTry = 0,
			// unit is minute
			interval = 15;
	// this function return if the request should be send again.
	// if retry happens, return the retried times.
	function couldTry(){
		var r,
				now = time.now();
		if(retry >= maxTry){
			if(now-lastTry >= interval*60*1000){
				// if it 30min from last retry, 
				// just try again and reset the lastTry time stamp.
				// if this retry success, the success callback will reset the retry times 
				lastTry = time.now();
				r = true;
			}else{
				r = false;
			}
		}else if(retry){
			r = retry;
		}else{
			r = true;
		}
		return r;
	}
	function addToQueue(q){
		// avoid trigger the queue check function
		var i;
		// console.log(q);
		i = q.length;
		while(i--){
			// add to queue without check
			queue.add(q[i].type, q[i].value), false;
		}
	}
	
	return {
		couldTry: couldTry,
		tried: function(q){
			++retry;
			// record the last fail time stamp
			lastTry = time.now();
			addToQueue(q);
			// return couldTry();
		},
		reset: function(){
			retry = 0;
		}
	};
});
define('http/api',[
	'http/post',
	'http/retry'
], function(post, retry){
	var api = {
		post: post,
		retry: retry
	};
	
	return api;
});
define('init/setQueueReady',[
	'data/queue/api',
	'data/wrap/api',
	'data/storage/api',
	'http/api',
	'util/JSON',
	'util/log'
], function(queue, wrap, storage, http, JSON, log){
	function callback(queue, keys){
		var result,
				couldTry;
		result = wrap(queue);
		// console.log(result);
		
		// if the retry times reach max try times,
		// just keep this queue in the localStorage,
		// otherwise load all localStorages and send
		couldTry = http.retry.couldTry();
		if(couldTry){
			http.post({
				data: result
			}).then(
				function(r){
					log('ajax success');
					// log(r);
					
					// if there is a succees request happened,
					// reset the failedTimes and let all failed request can be sent
					http.retry.reset();
				}, function(r){
					var i,
							data;
					log('ajax failed');
					log(r.message);
					// log(r.request);
					
					data = JSON.parse(r.request.opt.data);
					// add the failed queue into current queue
					http.retry.tried(data.queue);
				}
			);
			
			// remove all local storage data
			storage.remove(keys);
		}
	}
	function set(){
		queue.sub(callback);
	}
	
	return set;
});
define('data/group/g',[],function(){
	return [];
});
// return the index of the group that contain the specify member name. 

define('data/group/get',[
	'data/group/g',
	'util/log'
], function(groups, log){
	function get(memberName){
		var r,
				i,
				tmp1;
		r = [];
		i = groups.length;
		if(!i){
			return null;
		}
		while(i--){
			if(groups[i].hasOwnProperty(memberName)){
				// just push the index, 
				// the refer to the group object may cause memory release issue.
				r.push(i);
			}
		}
		
		// console.log(r.length);
		if(!r.length){
			r = null;
			log('can not find the group contain ' + memberName + ' in group list, is the memberName right?');
		}
		return r;
	}
	
	return get;
});
// if there are two group contain member a, 
// when the value of a change, 
// the value a in these two group should change at the same time.
// return:
// 	This module return null if the group can't be sent, otherwise return the group
// TODO: if the group member all setted, call the push function
// TODO: user can controll if the group member can be overwrite

define('data/group/add',[
	'http/api',
	'data/group/g',
	'data/group/get',
	'util/dcopy',
	'util/log'
], function(http, groups, getGroup, dcopy, log){
	function add(memberName, value){
		var i,
				r,
				tmp1,
				group,
				groupArr,
				groupNull,
				groupCanbeSent;
		r = [];
		groupArr = getGroup(memberName);
		// console.log(groupArr);
		if(!groupArr){
			log('the ' + memberName + ' is not a member of any group.');
			return null;
		}else{
			i = groupArr.length;
		}
		// set all group member
		while(i--){
			// groupArr.push(groups[tmp1[i]]);
			group = groups[groupArr[i]];
			group[memberName] = value;
			
			// console.log(group);
			// create an object that members are null, 
			// which can be use to replace the group when group sent
			groupNull = {};
			// start to check if the members in this group is fullfill
			groupCanbeSent = true;
			for(tmp1 in group){
				if(!group[tmp1]){
					groupCanbeSent = false;
					break;
				}
				groupNull[tmp1] = null;
			}
			
			// TODO:send this group
			if(groupCanbeSent){
				// push the copied group to result array
				r.push(dcopy(group));
				
				// reset all member to null
				groups[groupArr[i]] = groupNull;
				// console.log(groups[0].m1);
			}
		}
		
		if(!r.length){
			r = null;
		}
		return r;
	}
	
	return add;
});
define('data/group/define',[
	'data/group/g',
	'util/log'
], function(groups, log){
	function def(){
		var i,
				tmp1;
		// var args = arguments;
		tmp1 = {};
		for(i=0 ; i<arguments.length ; i++){
			tmp1[arguments[i]] = null;
		}
		// console.log(groups);
		groups.push(tmp1);
		
		return tmp1;
	}
	
	return def;
});
define('data/group/api',[
	'data/group/add',
	'data/group/define'
], function(add, def){
	return {
		add: add,
		define: def
	};
});
define('data/push',[
	'util/log',
	'data/group/api',
	'data/queue/api',
	// 'data/wrap/api',
	'data/storage/api',
	'data/storage/api'
], function(log, group, queue, storage, config){
	function handleData(command, value1, value2){
		var v1,
				v2,
				key,
				tmp1,
				data = {};
		// handle normal data and group data.
		data.type = command;
		if(command === 'group'){
			// add the value to the member
			// TODO: change srcElement to value
			data.srcElement = group.add(value1, value2 ? value2 : null);
		}else{
			data.srcElement = value1 ? value1 : null;
		}
		// save to localStorage
		key = storage.set(data);
		queue.add(data, key);
		
		// XXX: the callback function defined in the init part
	}
	function push(command, value1, value2){
		var i,
				tmp1;
		if(command === 'config'){
			config.set(value1, value2);
			
			return;
		}else if(command === 'groupDefine'){
			if(!value2){
				// make sure there at last two members.
				log('the group you defined is less than two member.');
				return;
			}
			
			tmp1 = [];
			i = arguments.length;
			// get the group members
			for(i=1 ; i<arguments.length ; i++){
				tmp1.push(arguments[i]);
			}
			group.define.apply(this, tmp1);
			return;
		}else{
			handleData(command, value1, value2);
			
		}
		
	}
	
	
	return push;
});
define('init/changePush',[
	'data/push',
	'util/log'
], function(push, log){
	function change(q){
		q.push = function(arr){
			push.apply(this, arr);
			return;
		};
	}
	
	return change;
});
define('init/setEnv',[
	'config/api',
	'util/log'
], function(config, log){
	function set(appId, env){
		config.set('appId', appId);
		config.set('env', env);
	}
	
	return set;
});
define('init/loadStorages',[
	'data/queue/api',
	'data/storage/api',
	'data/push',
	'util/log'
], function(q, storage, push, log){
	function load(){
		var i,
				tmp1,
				data;
		data = storage.all();
		i = data.length;
		if(i){
			// push all stored data into queue
			while(i--){
				// delete this data before send it.
				storage.remove(data[i].key);
				push(data[i].value.type, data[i].value.srcElement);
			}
		}
		
		return true;
	}
	
	return load;
});
define('init/loadQueue',[
	'data/push',
	'core/exports',
	'util/log'
], function(push, exports, log){
	function load(q){
		var i,
				tmp1;
		i = q.length;
		while(i--){
			push.apply(this, q[i]);
		}
	}
	
	return load;
});
define('init/sendPV',[
	'data/push',
	'time/api',
	'util/log'
], function(push, time, log){
	function send(){
		push('PV', time.now());
		
	}
	
	return send;
});
define('init/api',[
	'init/setQueueReady',
	'init/changePush',
	'init/setEnv',
	'init/loadStorages',
	'init/loadQueue',
	'init/sendPV'
], function(setQueueReady, changePush, setEnv, loadStorages, loadQueue, sendPV){
	return {
		setQueueReady: setQueueReady,
		setEnv: setEnv,
		changePush: changePush,
		loadStorages: loadStorages,
		loadQueue: loadQueue,
		sendPV: sendPV
	};
});
require([
	'config/info',
	'core/exports'
], function(info, exports){
	var d = exports.document, 
			//w = exports, 
			n = exports.navigator, 
			s = exports.screen, 
			l = d.location, 
			h = "https:" == l.protocol ? "https:" : "http:";
  function GetTimeZone(dateTimeFull, browserName) { 
  	var timezone;
      if (browserName == "Netscape") { 
          var firstPar = dateTimeFull.indexOf('('); 
          var lastPar = dateTimeFull.indexOf(')'); 
          timezone = dateTimeFull.substring(firstPar + 1, lastPar); 
      }
      if (browserName == "Microsoft Internet Explorer") { 
          var dateSplit = dateTimeFull.split(" "); 
          timezone = dateSplit[4]; 
      } 
      if (browserName == "Opera") { 
          var dateSplit = dateTimeFull.split(" ");
          timezone = dateSplit[5]; 
      } 
      return timezone;
  }
  var tmp1 = new Date();
  var path = l.pathname.split("\/");
  // use a object and pass it to info will cause object remain in memory
  info.user.page = path[path.length - 1];
  info.user.location = l.href;
  info.user.referrer = d.referrer || ""; 
  info.user.language = (n.systemLanguage || n.language).toLowerCase();
  info.user.browserName = n.appName; 
  info.user.userAgent = n.userAgent; 
  info.user.timezone = GetTimeZone(tmp1.toString(), info.user.browserName);
  info.user.offset = tmp1.getTimezoneOffset() / 60 * (-1);
  // return info;
});
define("config/getUserInfo", function(){});

define('nullModule',[],function(){
	return null;
});

require([
	// 'http/api',
	// 'config/api',
// 	
	// 'cookie/id',
	// // 'util/JSON',
	'core/exports',
	'init/api',
	'util/log',
	
	// get userInfo just run once, nullModule is for the exclude funcion.
	'config/getUserInfo',
	'nullModule'
], function(exports, init, log){
	var q;
	function begin(q){
		var env,
				tmp1,
				appId;
		// define the queue ready callback, 
		// in this callback, it will send the data, 
		// then remove these data from localStorage.
		init.setQueueReady();
		
		// set the appId and env
		if(q.length){
			// get the first data
			tmp1 = q.shift();
			appId = tmp1[0];
			env = tmp1[1];
			init.setEnv(appId, env);
		}else{
			log('miss the appId and env');
		}
		
		// change the push function of _waq
		// XXX: after change the push method of _waq,
		//      the datas will goes into the push function instead of going into the _waq
		init.changePush(q);
		
		init.loadStorages();
		init.loadQueue(q);
		
		// send the pv data
		init.sendPV();
	}
	
	q = exports._waq;
	if(q){
		begin(q);
	}else{
		log('the _waq is missed');
	}
});

define("wa", function(){});


})();