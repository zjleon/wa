define([
	'data/push',
	'time/api',
	'util/log'
], function(push, time, log){
	function send(){
		push('PV', time.now());
		
	}
	
	return send;
});