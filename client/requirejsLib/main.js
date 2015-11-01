require.config({
	baseUrl: "jsSource/amdModules"
});

require([
	'data/queue/service',
	'data/push'
], function(s, push){
	push(1);
	push(2);
});
