define([
	'data/push',
	'util/log'
], function(push, log){
	function change(q){
		q.push = function(arr){
			push.apply(this, arr);
			return;
		};
	}
	
	return change;
});