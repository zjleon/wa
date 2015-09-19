define([
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