define([
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