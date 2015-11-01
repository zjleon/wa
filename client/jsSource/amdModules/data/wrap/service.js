define([
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