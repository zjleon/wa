// Time is base on minutes
define(function(){
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
