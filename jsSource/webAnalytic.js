"use strict";



//object to json, make old browser support json convert
if (typeof JSON !== 'object') {
    JSON = {};
}
(function () {
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
}());


(function(_win){
	function _extend(obj1, obj2, keepOwnProperty) {
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
	}
	function _parseUrl(url) {
        if (typeof url === "object") {
            return url;
        }
        var matches = /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/.exec(url);
        var data = matches ? {
            href: matches[0] || "",
            hrefNoHash: matches[1] || "",
            hrefNoSearch: matches[2] || "",
            domain: matches[3] || "",
            protocol: matches[4] || "",
            authority: matches[5] || "",
            username: matches[7] || "",
            password: matches[8] || "",
            host: matches[9] || "",
            hostname: matches[10] || "",
            port: matches[11] || "",
            pathname: matches[12] || "",
            directory: matches[13] || "",
            filename: matches[14] || "",
            search: matches[15] || "",
            hash: matches[16] || ""
        } : {};
        if(data.port == ""){
            if(data.protocol == "http:") 
                data.port = "80";
            if(data.protocol == "https:")
                data.port = "443";
        }
        return {
			domain: data.domain,
            origin: data.protocol + '//' + data.hostname + ':' + data.port
        };
    }
	function _log(obj){
		if(!_win.console || !_wa.option.logMsg){
			return;
		}
		_win.console.log(obj);
	}
	function setCookie(name, value, days){
		var exp;
	    var Days = days ? days : 0;
	    var tmp1 = name + "="+ escape (value);
	    if(days){
		    exp  = new Date();
		    exp.setTime(exp.getTime() + Days*24*60*60*1000);
	    	tmp1 += ";expires=" + exp.toGMTString();
	    }
	    tmp1 += ';path=/';
	    document.cookie = tmp1;
	}
	function updateCookie(name, days){
		var tmp1;
		if((tmp1 = getCookie(name))){
			setCookie(name, tmp1, days);
		}
	}
	function getCookie(name){
	    var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
	     if(arr != null){
	     	return unescape(arr[2]);
	     }
	     return null;
	}
	function delCookie(name){
	    var exp = new Date();
	    exp.setTime(exp.getTime() - 1);
	    var cval=getCookie(name);
	    if(cval!=null){
	    	document.cookie = name + "="+cval+";expires="+exp.toGMTString();
	    }
	}
	
	function createRequest(){
		var XMLHttpReq;
		if(XMLHttpRequest && 'withCredentials' in (XMLHttpReq = new XMLHttpRequest())){
			
		}else if(typeof XDomainRequest != 'undefined'){
			XMLHttpReq = new XDomainRequest();
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
		}else{
			//if not support cross request, just return null;
			XMLHttpReq = null;
		}
		return XMLHttpReq;
	}
	//TODO:using queue in xml request sending
	//only use 'post' method
	function sendRequestByPost(param){
	    var url,
	    	opt,
	    	req = createRequest();
	    if(!req){
	    	return;
	    }
	    opt = _extend({
			url:null,
			dataType:'noraml',
			data:null,
			begin:null,
			success:null,
			error:null,
			timeout:0,
			retry:0
		} , param);
		if(!opt.url){
			return;
		}else{
			url = _parseUrl(opt.url);
			if (url.domain === "" || url.origin === origin) {
				_log('not a cross domain request');
				return;
			}
		}
		req.open('POST' , opt.url, true);
		req.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=utf-8');
		if(opt.data && opt.dataType==='json'){
			opt.data = JSON.stringify(opt.data);
			req.setRequestHeader('Accept','application/json, text/javascript');
			// req.setRequestHeader('Accept','*/*');
			// Accept: application/json, text/javascript, */*; q=0.01
		}else{
			req.setRequestHeader('Accept','*/*');
		}
		if(opt.begin){
			opt.begin(req, opt);
		}
		if(typeof opt.timeout==='number' && opt.error){
			req.timeout = opt.timeout;
			req.ontimeout = function(){
				processError(req, opt, 'request timeout');
			};
		}
		if(opt.error){
			//error callback
			req.onerror = function(){
				processError(req, opt, 'request error');
			};
		}
		// if('withCredentials' in req){
			req.withCredentials = true;
		// }
		//XXX:onload works on IE8, so don't need readyStateChange listener anymore
		// req.onreadystatechange = function(){
			// processStateChange(req, opt);
		// };
		req.onload = function(){
			processOnLoad(req, opt);
		};
		req.send(opt.data);
		
	}
	function processResponse(req, param) {
		var data;
		if(param.dataType==='json'){
			// _log(req);
			data = JSON.parse(req.responseText);
		}else{
			data = req.responseText;
		}
		return data;
	}
	function processStateChange(req, param) {
		var data;
	    if(req.readyState === 4){
	    	//status code explaination
			//http://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81
			if (req.status === 200 || req.status ===202 || req.status ===204){	
				if(param.success){
					data = processResponse(req, param);
					param.success(data);
				}
			}else{	
				if(param.error){
					param.error(req, 'response error');
				}
			}
			req = null;
		}
	}
	function processOnLoad(req, param) {
		var data,
			responseText;
		//in this state, there must be a string return by server, 
		//so we don't need to handle the state code
		responseText = JSON.parse(req.responseText);
		if(responseText.result === 0){
			if(param.success){
				data = processResponse(req, param);
				param.success(data);
			}
		}else{
			if(param.error){
				param.error(req, 'response error');
			}
		}
		//TODO:check if this release works
		req = null;
	}
	function processError(req, param, type){
		var opt = param;
		//call the custom error handle
		opt.error(req, type);
		
		if(typeof opt.retry == 'undefined'){
			opt.retry = 0;
		}else{
			opt.retry++;
		}
		if(opt.retry < 3){
			setTimeout(function(){
				sendRequestByPost(opt);
			}, (opt.retry+1)*5000);
		}
		req = null;
	}
	function sendRequestByGet(data){
		//TODO:how to send data, cause the url that reciving get method may be different to post,
		//		so how to save the get url?
		
	}
	
	function getBasicInfo() { 
	    var d = _win.document, w = _win, l = d.location, n = _win.navigator, s = w.screen, h = "https:" == l.protocol ? "https:" : "http:";
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
	    var result = {};
	    var tmp1 = new Date();
	    //result.now = (new Date()).getTime(); 
	    var path = l.pathname.split("\/");
	    result.page = path[path.length - 1];
	    result.location = l.href;
	    result.referrer = d.referrer || ""; 
	    result.language = (n.systemLanguage || n.language).toLowerCase();
	    result.browserName = n.appName; 
	    result.userAgent = n.userAgent; 
	    result.timezone = GetTimeZone(tmp1.toString(), result.browserName);
	    result.offset = tmp1.getTimezoneOffset() / 60 * (-1);
	    return result;
	}
	function setBasciInfo(name, value){
	    if(this.basicInfo.hasOwnProperty(name)){
    	    this.basicInfo[name] = value;
    	    return true;
	    }
	    _log('could not find "' + name + '" in basicInfo');
	}
	function setAppInfo(appId, env, url){
		//this will point to _wa object
		if(arguments.length<2){
			_log('lack init parameter');
			return;
		}
		this.url = url || 'http://c0007294.itcs.hp.com:8088/MetricService.ashx';
		this.appInfo = {
			appId:appId,
			env:env
		};
	}
	function config(){
		var i,
			name,
			value,
			opt = [];
		for(i=0 ; i<arguments.length ; i++){
			opt[i] = arguments[i];
		}
		i = opt.length;
		while(i--){
			value = opt.pop();
			name = opt.pop();
			this.option[name] = value;
		}
	}
	function track(type, msg, cfg){
		if(!this.appInfo.appId || !this.appInfo.env || !this.url){
			_log('_wa has not been initial correctly');
			return;
		}
		var i,
			opt,
			tmp1,
			group,
			groupArr,
			groupName,
			result = {};
		opt = cfg || {};
		if(typeof type=='undefined' || typeof msg=='undefined'){
			_log('need type and msg');
			return;
		}
		//TODO:use a bettoer way to support group function
		if(opt.group){
			groupName = opt.group;
			if(_wag[groupName]){
				group = _wag[groupName];
			}else{
				//TODO: load from other name space
				try{
					group = groupName;
				}catch(e){
					_log('can not find the group "'+ groupName +'" in global space');
					return;
				}
				if(!group){
					_log('can not find the group "'+ groupName +'" in _wag');
					return;
				}
			}
			if(!this.group[groupName]){
				//set the group if it not exsit
				this.group[groupName] = {};
			}
			//check if the group's member have value
			groupArr = group.split(/;{2}/g);
			i = groupArr.length;
			result = true;
			while(i--){
				tmp1 = this.group[groupName][groupArr[i]];
				if(tmp1){
					if(groupArr[i] === type){
						_log('type "' + type + '" in goup "' +group+ '" is exsit already.new data:"' + msg + '" will overwrite old data:"' + tmp1 + '"');
						this.group[groupName][groupArr[i]] = msg;
					}
				}else{
					if(groupArr[i] === type){
						this.group[groupName][groupArr[i]] = msg;
					}else{
						//if there are data that had no value, don't send this group
						result = false;
					}
				}
			}
			if(result){
				//modify result object, add group value to it
				result = {};
				result.type = 'group';
				//XXX:srcElment equals msg
				result.srcElement = group;
				result.group = this.group[groupName];
				//reset this group
				this.group[groupName] = {};
			}else{
				return;
			}
		}else{
			result.type = type;
			result.srcElement = msg;
		}
		
		result.timeStamp = (new Date()).valueOf();
		// result.offset = tmp1.getTimezoneOffset() / 60 * (-1);
		
		this.storeToQueue(result);
	}
	//TODO:check the Queue and if the condition is reached, send the queue to server
	function storeToQueue(data){
		var tmp1,
				now,
				result,
				hasTimer,
				_this = this,
				targetData = [],
				requestInterval = 1500,
				queueCheckInterval = 800;
		now = (new Date()).valueOf();
		// record last send time stamp, 
		// make sure the first push call can use queue
		if(!this.lastSend){
			this.lastSend = now;
		}
		// clear timer no matter what hapen
		if(this.queueTimer){
			hasTimer = true;
			clearTimeout(this.queueTimer);
			this.queueTimer = null;
		}else{
			hasTimer = false;
		}
		if(data){
			this.requestQueue.push(data);
		}
		if(
			// when queue length over 50
			this.requestQueue.length>50
			||
			// when queue has data and it over 1.5 second from last send and there is a timer 
			this.requestQueue.length>0 && (now - this.lastSend) > requestInterval && hasTimer
		){
			this.lastSend = now;
			//TODO:there should put each object into one single object, then use json format to send it 
			targetData.push(getID());
			targetData.push(JSON.stringify(this.basicInfo).replace(/^{/g, '').replace(/}$/g, ''));
			targetData.push(JSON.stringify(this.appInfo).replace(/^{/g, '').replace(/}$/g, ''));
			targetData.push('"queue":' + JSON.stringify(this.requestQueue).replace(/^{/g, '').replace(/}$/g, ''));
			targetData.push('"time":' + now);
			
			if($configuration){
				// set the application name
				if($configuration.settings && $configuration.settings.application) {
					if(typeof $configuration.settings.application === 'function') {
						tmp1 = $configuration.settings.application();
					} else {
						tmp1 = $configuration.settings.application;
					}
					targetData.push(JSON.stringify(tmp1).replace(/^{/g, '').replace(/}$/g, ''));
				}
				
				// set the page name
				if($configuration.settings && $configuration.settings.page) {
					if(typeof $configuration.settings.page === 'function') {
						tmp1 = $configuration.settings.page();
					} else {
						tmp1 = $configuration.settings.page;
					}
					targetData.push(JSON.stringify(tmp1).replace(/^{/g, '').replace(/}$/g, ''));
				}
				
				// set the user name
				if($configuration.settings && $configuration.settings.user) {
					if(typeof $configuration.settings.user === 'function') {
						tmp1 = $configuration.settings.user();
					} else {
						tmp1 = $configuration.settings.user;
					}
					targetData.push(JSON.stringify(tmp1).replace(/^{/g, '').replace(/}$/g, ''));
				}
				
				// set the client version
				targetData.push('"client_version":' + JSON.stringify($configuration.version));
			}
			
			result = '{';
			result += targetData.join(',');
			result += '}';
			
			// targetData = targetData.join('&');
			_log(result);
			this.requestQueue = [];
			
			sendRequestByPost({
				url:this.url,
				data:result,
				success:function (data) {
			    	//_log(JSON.stringify(data));
			    	_log(data);
			    	//setID(data);
			    },
			    error:function (req, type) {
			    	_log('error type:'+type+':');
			    	_log(req);
			    },
				timeout:12000
			});
		}else{
			// set a timer to make sure no data miss
			this.queueTimer = setTimeout(function(){
				_this.storeToQueue.call(_this);
			}, queueCheckInterval);
		}
	}
	
	var trackID_cookieName = '_wa_trackID', 
		machineID_cookieName = '_wa_machineID',
		sessionID_cookieName = '_wa_sessionID';
	function guid(){
		return 'xxxxxxxx-xxxx-zxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g , function(c){
			var r = Math.random()*16|0,
						v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		}).toUpperCase();
	}
	//return json type string
	function getID(){
		var tID,
			mID,
			sID,
			tmp1;
		tmp1 = [];
		tID = getCookie(trackID_cookieName);
		if(!tID){
			tID = guid();
			setID('t', tID);
		}else{
			//keep cookie alive while user doing operation
			updateCookie(machineID_cookieName, 999);
		}
		tmp1.push('"tracking-id":"'+tID+'"');
		
		mID = getCookie(machineID_cookieName);
		if(!mID){
			mID = guid();
			setID('m', mID);
		}
		tmp1.push('"machine-id":"'+mID+'"');
		
		sID = getCookie(sessionID_cookieName);
		if(!sID){
			sID = guid();
			setID('s', sID);
		}else{
			//keep cookie alive while user doing operation
			updateCookie(sessionID_cookieName, 0.02);
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
	function setID(key, value){
		if(key === 't'){
			setCookie(trackID_cookieName, value, 0);
		}
		if(key === 'm'){
			setCookie(machineID_cookieName, value, 999);
		}
		if(key === 's'){
			setCookie(sessionID_cookieName, value, 0.02);
		}
	}
	//use this function replace the _waq array's push function
	//push function will trigger _wa's push function.
	function push(){
		//console.log(this);
		try{
			// TODO: if pass one argument and it is a string, convert it to Array.
			_wa.track.apply(_wa, arguments[0]);
		}catch(e){
			_log(e);
		}
		//Array.prototype.push.apply(this, arguments);
	}
	
	//XXX:defined private variation
	//store page domain to check if the request is a cross domain request
	var origin = _parseUrl(_win.location.href).origin;
	
	//XXX:defined export
	//TODO:prevent duplicate _wa object
	var _wa = {};
	_wa.appInfo = {};
	//get the bacis info and store it in _wa object
	_wa.basicInfo = getBasicInfo();
	_wa.setInfo = setBasciInfo;
	_wa.init = setAppInfo;
	_wa.config = config;
	_wa.option = {};
	_wa.requestQueue = [];
	_wa.group = {};
	_wa.track = track;
	_wa.getID = getID;
	_wa.storeToQueue = storeToQueue;
	
	//XXX:export _wa to window
	_win._wa = _wa;
	
	//XXX:do other init things
	//modify the _waq push function
	_waq.push = push;
	if(_waq.length){
		//automaticly init _wa object
		_wa.init.apply(_wa, _waq.shift());
	}
	if(_waq.length){
		var i,
			l;
		for(i=0, l=_waq.length ; i<l ; i++){
			if(_waq[i][0].toLowerCase() === 'config'){
				_waq[i].shift();
				_wa.config.apply(_wa, _waq[i]);
			}else{
				_wa.track.apply(_wa, _waq[i]);
			}
		}
	}
	//TODO:use below code to trigger unload event, 
	// _waq.push([
		// 'Config',
		// 'trackUnload',
		// false
	// ]);
	// _win.onbeforeunload = function(e){
		// _wa.track('PageUnload', (new Date()));
	// };
})(window);

