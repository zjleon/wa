define([
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
