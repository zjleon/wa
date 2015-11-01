define([
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