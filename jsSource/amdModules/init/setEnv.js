define([
	'config/api',
	'util/log'
], function(config, log){
	function set(appId, env){
		config.set('appId', appId);
		config.set('env', env);
	}
	
	return set;
});