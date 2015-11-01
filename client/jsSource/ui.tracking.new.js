"use strict";

/*
Copyright (c) 2011 Wojo Design
Dual licensed under the MIT or GPL licenses.
*/
(function(){
	//var window = this;
	// check to see if we have localStorage or not
	if( !window.localStorage ){		

		// globalStorage
		// non-standard: Firefox 2+
		// https://developer.mozilla.org/en/dom/storage#globalStorage
		if ( window.globalStorage ) {
			// try/catch for file protocol in Firefox
			try {
				window.localStorage = window.globalStorage;
			} catch( e ) {}
			return;
		}

		// userData
		// non-standard: IE 5+
		// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
		var div = document.createElement( "div" ),
			attrKey = "localStorage";
		div.style.display = "none";
		document.getElementsByTagName( "head" )[ 0 ].appendChild( div );
		if ( div.addBehavior ) {
			div.addBehavior( "#default#userdata" );
			//div.style.behavior = "url('#default#userData')";

			var localStorage = window["localStorage"] = {
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
					return n ? n.name : n;
				}

			},

			// convert invalid characters to dashes
			// http://www.w3.org/TR/REC-xml/#NT-Name
			// simplified to assume the starting character is valid
			cleanKey = function( key ){
				return key.replace( /[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );
			};


			div.load( attrKey );
			localStorage["length"] = div.XMLDocument.documentElement.attributes.length;
		} 
	} 
})();

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
			storageKey:null,
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
		req.storageKey = opt.storageKey;
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
				param.success(data, req);
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
		//this.url = url || 'http://c0007294.itcs.hp.com:8088/MetricService.ashx';
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
	var storagePrefix = 'wa_';
	//return object
	function getStorage(key){
		var r;
		try{
			r = JSON.parse(localStorage.getItem(storagePrefix + key));
		}catch(e){
			_log(e);
			r = null;
		}
		return r;
	}
	// return all wa storage in an Array.
	function getAllStorages(){
		var key,
				reg,
				i = 0,
				r = [],
				storage = _win.localStorage;
	  reg = new RegExp('^' + storagePrefix + '.+', 'g');
	  try{
			for(; i<storage.length ; i++){
			  // storage.key(i);
			  // storage.getItem(storage.key(i));
			  key = storage.key(i);
			  reg.lastIndex = 0;
			  if(reg.test(key)){
					r.push(JSON.parse(storage.getItem(key)));
			  }
			}
		}catch(e){
			_log(e);
			r = [];
		}
		return r;
	}
	function roll(start , end){
		return Math.floor(Math.random() * (end - start + 1) + start);
	}
	// return the key, without prefix
	// add the key to value automaticlly.
	function setStorage(value){
		var key,
				v,
				storage = _win.localStorage;
		key = roll(0, 99999);
		if(getStorage(key)){
			// remove the key before set it.
			storage.removeItem(key);
		}
		
		// create a new obj to make this function can be cycle
		v = _extend({
			srcElement: null,
			time: null,
			type: null,
			storageKey: key
		}, value);
		//v.storageKey = key;
		storage.setItem(storagePrefix + key, JSON.stringify(v));
		
		return key;
	}
	// key can be an Array(multiple) or a string(single)
	function removeStorage(key){
		var i,
				keys = [],
				storage = _win.localStorage;
		// support for single or multiple remove
		if(typeof key === 'number'){
			keys.push(key);
		}else{
			keys = key;
		}
		i = keys.length;
		while(i--){
			storage.removeItem(storagePrefix + keys[i]);
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
		
		result.storageKey = setStorage(result);
		
		this.storeToQueue(result);
	}
	//TODO:check the Queue and if the condition is reached, send the queue to server
	function storeToQueue(data){
		var tmp1,
				i,
				now,
				result,
				hasTimer,
				storageKey,
				keys = [],
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
			if(!this.firstPush){
				// record the first push time stamp
				this.firstPush = now;
			}
		}
		if(
			// when queue length over 50
			this.requestQueue.length>50
			||
			// when queue has data and it over 1.5 second from last send and 1.5 second from the first push
			this.requestQueue.length>0 && (now - this.lastSend) > requestInterval && (now - this.firstPush) > requestInterval
		){
			this.lastSend = now;
			// clear the last push time stamp if queue sent
			this.firstPush = null;
			
			//TODO:there should put each object into one single object, then use json format to send it 
			targetData.push(getID());
			targetData.push(JSON.stringify(this.basicInfo).replace(/^{/g, '').replace(/}$/g, ''));
			targetData.push(JSON.stringify(this.appInfo).replace(/^{/g, '').replace(/}$/g, ''));
			
			// XXX: DON'T merge this part
			i = this.requestQueue.length;
			while(i--){
				tmp1 = this.requestQueue[i].storageKey;
				keys.push(tmp1);
				delete this.requestQueue[i].storageKey;
			}
			targetData.push('"queue":' + JSON.stringify(this.requestQueue));
			targetData.push('"time":' + now);
			// --------------------------
			
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
				// storageKey: keys,
				success:function (data, req) {
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
			
			// remove the localStorages after the request sending function called,
			// whether the request sending success or fail.
    	removeStorage(keys);
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
		}
		tmp1.push('"tracking-id":"'+tID+'"');
		
		mID = getCookie(machineID_cookieName);
		if(!mID){
			mID = guid();
			setID('m', mID);
		}
		else{
			//keep cookie alive while user doing operation
			updateCookie(machineID_cookieName, 999);
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
	
	function pushStorage(){
		var i,
				storages;
		storages = getAllStorages();
		i = storages.length;
		if(i){
			while(i--){
				storeToQueue.call(_wa, storages[i]);
			}
		}
	}
	
	//use this function replace the _waq array's push function
	//push function will trigger _wa's push function.
	function push(){
		//console.log(this);
		try{
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
	
	//push storage data
	pushStorage();
	
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
// })(window);

	var jQuery, $,
		$configuration,
		$utils,
		$storage,
		$event;
	
	/******************************************************************************************************************************/
	/**
	 * The $configuration is responsible for common configuration depends on different environment.
	 * No dependency on other global objects.
	 */
	$configuration = {
		server: {
			//http://c0007294.itcs.hp.com:8088/MetricService.ashx
			host: 'bana-itg.itcs.hp.com',
			port: '80',
			context: 'analytics_tracking',
			
			toURL: function() {
				if("https:" === window.location.protocol) {
					return "https://" + this.host + '/' + this.context + '/';
				} else {
					return "http://" + this.host + ':' + this.port + '/' + this.context + '/';
				}
			},
			trackURL: function(){
				return this.toURL() + 'tracking/async_pool/' + _wa.appInfo.appId;
			}
		},
		events: {
			EVENT_TYPE_ACCESS: {name: "PV", flag: true},
			EVENT_TYPE_MOUSE_MOVE: {name: "MouseMove", flag: false},
			EVENT_TYPE_MOUSE_STOP: {name: "MouseStop", flag: false},
			EVENT_TYPE_MOUSE_IN: {name: "MouseIn", flag: false},
			EVENT_TYPE_MOUSE_OUT: {name: "MouseOut", flag: false},
			EVENT_TYPE_CLICK: {name: "Click", flag: true},
			EVENT_TYPE_CHANGE: {name: "Change", flag: true},
			EVENT_TYPE_SCROLL: {name: "", flag: true},
			EVENT_TYPE_PERF_ACTION: {name: "PerformanceAction", flag: true},
			EVENT_TYPE_PERF_RESOURCE: {name: "PerformanceResource", flag: true}
		},
		settings: {
			
		},
		version: '0.0.1-SNAPSHOT'
	};
	_wa.url = $configuration.server.trackURL();
	
	/******************************************************************************************************************************/
	/**
	 * The $log is responsible for logging function.
	 * No dependency on other global objects, but dependent on JQuery.
	 */
	$utils = {
		// get XPATH for the HTML tag
		xpath: function(node) {
			var xpath = '',
				content = '',
				current = node;
			
			while(current.get(0).tagName !== 'HTML') {
				// get tag name
				content = '/' + current.get(0).tagName;
				// get attribute
				if(current.attr('id') && current.attr('class')) {
					content = content + "[@id='" + current.attr('id') + "' and @class='" + current.attr('class') + "']";
				} else if(current.attr('id')) {
					content = content + "[@id='" + current.attr('id') + "']";
				} else if(current.attr('class')) {
					content = content + "[@class='" + current.attr('class') + "']";
				}
				// concat the xpath
				xpath = content + xpath;
				// set the current node ad the parent node
				current = current.parent();
			}
			xpath = '/HTML' + xpath;
			
			return xpath;
		},
		isString: function(variable) {
			return variable.constructor === String;
		},
		isArray: function(variable) {
			return variable.constructor === Array;
		}
	};
	
	/******************************************************************************************************************************/
	/**
	 * The $storage is responsible for saving all the operations.
	 * Dependency: $configuration, $serverProxy, $session and JQuery.
	 */
	$storage = function() {
		var _operations = [];
		
		function _fun_push(_operation) {
			// get current event
			var _event = _operation.operation_type;
			
			// discard the event if the flag is false
			if(_event.flag === false) {
				return;
			}
			
			// log
			if(_event === $configuration.events.EVENT_TYPE_MOUSE_MOVE) {
				_log("mousemove: " + event.pageX + ", " + event.pageY);
			} else if(_event === $configuration.events.EVENT_TYPE_MOUSE_IN || 
					_event === $configuration.events.EVENT_TYPE_MOUSE_OUT || 
					_event === $configuration.events.EVENT_TYPE_MOUSE_STOP) {
				_log(_event.name + ": " + _operation.operation_position.x + ", " + _operation.operation_position.y);
			} else if(_event === $configuration.events.EVENT_TYPE_CLICK) {
				_log("click: " + _operation.operation_data.content + " [" + _operation.operation_element + "]");
			} else if(_event === $configuration.events.EVENT_TYPE_PERF_ACTION || _event === $configuration.events.EVENT_TYPE_PERF_RESOURCE) {
				_log("performance: " + _operation.operation_data.tag + " - " + _operation.operation_data.time);
			} else {
				_log(_event.name);
			}
			
			// reset the operation_type and save it to the _operations stack
			delete _operation.operation_type
			_waq.push([
				_event.name,
				_operation
			]);
		}

		return {
			save: _fun_push
		};
	}();
	
	
	/********************************************************event bind function*****************************************************************/
	/**
	 * The $event is responsible for binding and handling the all events.
	 * Dependency: $configuration, $storage, $session and JQuery.
	 */
	$event = function() {
		
		var _last_move_position, _current_move_position;
		
		function _fun_bind_events() {
			
			// bind mouse move related events to <HTML>
			if($configuration.events.EVENT_TYPE_MOUSE_MOVE === true
					|| $configuration.events.EVENT_TYPE_MOUSE_STOP === true
					|| $configuration.events.EVENT_TYPE_MOUSE_IN === true
					|| $configuration.events.EVENT_TYPE_MOUSE_OUT === true
					) {
				$("html").bind("mousemove", function(event) {
					_fun_handle_events_mousemove("mousemove", event);
				}).bind("mouseenter", function(event) {
					_fun_handle_events_mousemove("mouseenter", event);
				}).bind("mouseleave", function(event) {
					_fun_handle_events_mousemove("mouseleave", event);
				});
			}
			
			// bind click & change related event to real element 
			$("html").bind("click", function(event) {
				_fun_handle_events_click("click", event);
			}).bind("change", function(event) {
				_fun_handle_events_change("change", event);
			});
		}
		
		function _fun_send_event(type, data) {
			var _operation = {
				operation_time_stamp: (new Date()).getTime()
			};
			if(type === "PerformanceAction") {
				_operation.operation_type = $configuration.events.EVENT_TYPE_PERF_ACTION;
				_operation.operation_data = {
					tag: data.tag,
					time: data.time
				};
				
				// push it
				$storage.save(_operation);
			} else if(type === "PerformanceResource") {
				_operation.operation_type = $configuration.events.EVENT_TYPE_PERF_RESOURCE;
				_operation.operation_data = {
					tag: data.tag,
					time: data.time
				};
				
				// push it
				$storage.save(_operation);
			} else if(type === "Access") {
				_operation.operation_type = $configuration.events.EVENT_TYPE_ACCESS;
				_operation.operation_data = {};
				
				// push it
				$storage.save(_operation);
			}
		}
		
		function _fun_handle_events_click(type, event) {
			// prepare the operation
			var _operation = {
					operation_time_stamp: event.timeStamp,
					operation_position: {
						x: event.pageX,
						y: event.pageY
					},
					operation_window: {
						width: $(window).width(),
						height: $(window).height()
					},
					operation_type: $configuration.events.EVENT_TYPE_CLICK
				},
				_element;
			
			/**
			 * find content:
			 * 	1, find it from the label "for"
			 * 	2, find the "title" attribute
			 * 	3, find the parent if it is label
			 * 	4, find the brother if it is label
			 * 	5, find the parent
			 */
			function _fun_find_content(_element) {
				var content = undefined,
					label = $('lable[for="' + _element.attr('id') + '"]'),
					brother,
					brothers,
					i;
				
				if(label.length > 0) {
					content = label.text();
				} else if(_element.attr('title')) {
					content = _element.attr('title');
				} else if(_element.parent()[0].tagName === 'LABEL') {
					content = _element.parent().text();
				} else {
					brothers = _element.siblings();
					for(i=0; i<brothers.length; i++) {
						brother = brothers[i];
						if(brother.tagName === 'LABEL') {
							content = brother.text();
							break;
						}
					}
					
					if(content === undefined) {
						content = _element.parent().text();
					}
				}
				return content;
			}
			
			// populate the _operation.operation_data = {};
			_operation.operation_data = {};
			if(event.target) {
				_element = $(event.target);
				switch(_element[0].tagName) {
					case "INPUT":
						if(_element.attr('type') === 'radio') {
							// find value in the "radio" 
							if(_element.attr('value')) {
								_operation.operation_data.value = _element.attr('value');
							}
							_operation.operation_data.content = _fun_find_content(_element);
						} else if(_element.attr('type') === 'checkbox') {
							// find checked or unchecked for it
							if(_element.prop('checked')) {
								_operation.operation_data.selected = true;
							} else {
								_operation.operation_data.selected = false;
							}
							// find value in the "checkbox" 
							if(_element.attr('value')) {
								_operation.operation_data.value = _element.attr('value');
							}
							_operation.operation_data.content = _fun_find_content(_element);
						} else if(_element.attr('type') === 'button') {
							if(_element.attr('name')) {
								_operation.operation_data.name = _element.attr('name');
							}
							if(_element.attr('value')) {
								_operation.operation_data.value = _element.attr('value');
							}
							_operation.operation_data.content = _element.text();
						} else if(_element.attr('type') === 'submit') {
							if(_element.attr('name')) {
								_operation.operation_data.name = _element.attr('name');
							}
							if(_element.attr('value')) {
								_operation.operation_data.value = _element.attr('value');
							}
							_operation.operation_data.content = _element.text();
						} else {
							
						}
						break;
					case "BUTTON":
						if(_element.attr('name')) {
							_operation.operation_data.name = _element.attr('name');
						}
						if(_element.attr('value')) {
							_operation.operation_data.value = _element.attr('value');
						}
						_operation.operation_data.content = _element.text();
						break;
					case "A":
						if(_element.attr('href')) {
							_operation.operation_data.href = _element.attr('href');
						}
						_operation.operation_data.content = _element.text();
						break;
					case "DIV":
						_operation.operation_data.content = _element.text();
						break;
					case "SPAN":
						_operation.operation_data.content = _element.text();
						break;
					default:
						_operation.operation_data.content = _element.text();
				}
				
				_operation.operation_data.tag = _element[0].tagName;
				_operation.operation_element = $utils.xpath($(event.target));
			} else {
				// TODO: add extra handle if we can't find the target
				_log("It can't get the source element.");
			}
			
			// push it
			$storage.save(_operation);
		}
		
		function _fun_handle_events_change(type, event) {
			// prepare the operation
			var _operation = {
					operation_time_stamp: event.timeStamp,
					operation_window: {
						width: $(window).width(),
						height: $(window).height()
					},
					operation_type: $configuration.events.EVENT_TYPE_CHANGE
				},
				_element;
			
			// populate the _operation.operation_data = {};
			_operation.operation_data = {};
			if(event.target) {
				_element = $(event.target);
				switch(_element[0].tagName) {
					case "INPUT":
						if(_element.attr('type') === 'text') {
							_operation.operation_data.value = _element.val();
						} else {
							
						}
						break;
					case "SELECT":
						_operation.operation_data.value = _element.find("option:selected").val();
						_operation.operation_data.content = _element.find('option:selected').text();
						break;
					default:
				}
				
				_operation.operation_data.tag = _element[0].tagName;
				_operation.operation_element = $utils.xpath($(event.target));
			} else {
				// TODO: add extra handle if we can't find the target
				_log("It can't get the source element.");
			}
			
			// push it
			$storage.save(_operation);
		}
		
		function _fun_handle_events_mousemove(type, event) {
			// check the current point is a start point or not (maybe from 'mouseenter' or 'mousemove')
			var isStartPoint = false,
				idEndPoint,
				stay,
				_last_operation,
				_operation;
			
			if(
					(_last_move_position === undefined && _current_move_position === undefined) ||
					(type === 'mouseenter')
				) {
				isStartPoint = true;
			}
			
			// check the current point is a end point or not (only from 'mouseleave')
			idEndPoint = (type === 'mouseleave');
			
			// set last/current move position
			_last_move_position = _current_move_position;
			_current_move_position = {
				x: event.pageX,
				y: event.pageY,
				event: event,
				type: type,
				start: isStartPoint,
				end: idEndPoint
			};
			
			// check the last point is a pause point or not
			// condition: 
			//	1. if the last point or current point doesn't exist, it is not a pause point
			//	2. if the last point is a end point, it is not a pause point
			//	3. the last move if the user stay more than 2s, we consider it as a mouse pause
			if(_last_move_position && _current_move_position && _last_move_position.end !== true) {
				stay = _current_move_position.event.timeStamp - _last_move_position.event.timeStamp;
				if(stay >= 2000) {
					_last_move_position.pause = true;
					_last_move_position.stay = stay;
				}
			}
			
			// if current point is start point, do nothing
			if(_current_move_position.start === true) {
				return;
			}
			
			// normaly, we just push the last point to storage
			_last_operation = {
				operation_time_stamp: _last_move_position.event.timeStamp,
				operation_position: {
					x: _last_move_position.event.pageX,
					y: _last_move_position.event.pageY
				},
				operation_window: {
					width: $(window).width(),
					height: $(window).height()
				}
			};
			
			if(_last_move_position.pause && _last_move_position.pause === true) {
				if(_last_move_position.start === true) {
					_last_operation.operation_type = $configuration.events.EVENT_TYPE_MOUSE_IN;
				} else {
					_last_operation.operation_type = $configuration.events.EVENT_TYPE_MOUSE_STOP;
				}
				
				_last_operation.operation_data = {
					stay: _last_move_position.stay
				};
				
				if(_last_move_position.event.target) {
					_last_operation.operation_element = $utils.xpath($(_last_move_position.event.target));
				}
			} else if(_last_move_position.type === 'mouseenter'){
				_last_operation.operation_type = $configuration.events.EVENT_TYPE_MOUSE_IN;
			} else if(_last_move_position.type === 'mouseleave'){
				_last_operation.operation_type = $configuration.events.EVENT_TYPE_MOUSE_OUT;
			} else {
				_last_operation.operation_type = $configuration.events.EVENT_TYPE_MOUSE_MOVE;
			}

			// push
			$storage.save(_last_operation);
			
			// if current point is the end point, also push current point
			if(type === 'mouseleave') {
				_operation = {
					operation_time_stamp: _current_move_position.event.timeStamp,
					operation_position: {
						x: _current_move_position.event.pageX,
						y: _current_move_position.event.pageY
					},
					operation_window: {
						width: $(window).width(),
						height: $(window).height()
					},
					operation_type: $configuration.events.EVENT_TYPE_MOUSE_OUT
				};
				
				// push
				$storage.save(_operation);
			}
		}
		
		return {
			bind: _fun_bind_events,
			send: _fun_send_event
		};
	}();
	
	
	/**---------------------------------------------- code for initialize ----------------------------------------------**/
	function initialize(myJQuery) {
		// re-assign jQuery/$
		jQuery = $ = myJQuery;
		
		$event.send("Access");
		
		// bind events
		$event.bind();
	}
	
	
	/******************************************************************************************************************************/
	/**
	 * jQuery missing/conflict handler
	 */
	(function() {
		
		// load single JavaScript file and execute the callback
		function loadJavascript(resource, callback) {
			// generate a valid ID for the script
			var id = resource.replace(/(\.|\/|:|#|\s+)/g, "_"),
				idLoaded,
				head,
				script;
			
			// check if the resource has been loaded
			idLoaded = document.getElementById(id) ? true : false; 
			
			// if exist, execute the callback directly
			if(idLoaded) {
				if(callback) {
					callback();
				}
				return;
			}
			
			// create the new script tag for the resource in the head tag
			head = document.getElementsByTagName('head').item(0);
			script = document.createElement("script");
			script.id = id;
			script.type = "text/javascript"; 
			script.src = $configuration.server.toURL() + resource;
			head.appendChild(script);
			
			// bind callback
			if(callback) {
				script.onload = script.onreadystatechange = function() {
					if(!this.readyState || this.readyState==='loaded' || this.readyState==='complete') {						
						callback();
					}
					script.onload = script.onreadystatechange = null;
				};
			}
			return;
		}
		
		// load batch of JavaScript files and execute the callback
		function loadJavascripts(resources, callback) {
			if(!(resources instanceof Array)) {
				throw new Error('loadJavascripts [parameter is invalid]: ' + resources);
			}

			if(resources.length === 0) {
				if(callback) {
					callback();
				}
			} else {
				var script = loadJavascript(resources[0]);
				
				// bind callback
				script.onload = script.onreadystatechange = function() {
					if(!this.readyState || this.readyState==='loaded' || this.readyState==='complete') {						
						var remainResources = resources.slice(1, resources.length);
						loadJavascripts(remainResources, callback);
					}
					script.onload = script.onreadystatechange = null;
				};
			}
		}
		
		try {
			var isJQueryExist = false,
				version;
			
			// check if we need to load jQuery ourselves
			if(window.jQuery) {
				isJQueryExist = true;
			}
			
			// if jQuery exist, initialize our application
			// else, load the jQuery firstly and then initialize the application
			// TODO
			if(isJQueryExist === true) {
				initialize(window.jQuery);
			} else {
				loadJavascript('lib/jquery/jquery-2.0.0.min.js', function() {
					initialize(window.$.noConflict(true));
				});
			}
		} catch(error) {
			_log(error);
		}
	})();
	
	
	/******************************************************************************************************************************/
	/**
	 * Global object definition
	 * expose the global variable to "window" so that user make the setting
	 * interfaces:
	 * 	set: API used for customizing 
	 * 	perf: API usef for generate performance log 
	 */
	_win._wa.set = function(options) {
		$configuration.settings = $configuration.settings ? $configuration.settings : {};
		for(var key in options) {
			$configuration.settings.key = options[key];
		}
	};
	_win._wa.perfAction = function(tag) {
		var name = tag,
			start = new Date(),
			end = null;
		
		return {
			stop: function() {
				if(end === null) {
					end = new Date();
					_win._waq.push([
						'PerformanceAction', 
						{
							tag: name,
							time: end.getTime() - start.getTime()
						}
					]);
				} else {
					throw new Error("The perf watch of action[" + name + "] has been stopped.");
				}
			}
		};
	};
	_win._wa.perfResource = function(tag) {
		var name = null,
			start = new Date(),
			end = null,
			i = 0, j = 0, size = 0;
		
		function getFullNameOfResource(file) {
			var name = file, pos = -1;
			
			pos = name.lastIndexOf("/");
			if(pos > 0) {
				name = name.substring(pos + 1, name.length);
			}

			pos = name.lastIndexOf(".");
			if(pos > 0) {
				name = name.substring(0, pos);
			}
			
			return name;
		}
		if(tag === "resources") {
			name = "resource";
			
			for(i=1; i<arguments.length; i++) {
				if($utils.isArray(arguments[i])) {
					
					for(j=0; j<arguments[i].length; j++) {
						if(/.css$/i.test(arguments[i][j])) {
							continue;
						}
						
						size ++;
						
						if(size <= 2) {
							name = name + "_" + getFullNameOfResource(arguments[i][j]);
						}
					}
				}
			}
			
			if(size > 2) {
				name = name + "_with_" + size;
			}
		} else if($utils.isString(tag)) {
			name = tag;
		} else {
			name = tag + "";
		}
		
		return {
			stop: function() {
				if(end === null) {
					end = new Date();
					_win._waq.push([
						"PerformanceResource", 
						{
							tag: name,
							time: end.getTime() - start.getTime()
						}
					]);
				} else {
					throw new Error("The perf watch of resource[" + name + "] has been stopped.");
				}
			}
		};
	};
})(window);