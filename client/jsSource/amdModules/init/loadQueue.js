define([
	'data/push',
	'core/exports',
	'util/log'
], function(push, exports, log){
	function load(q){
		var i,
				tmp1;
		i = q.length;
		while(i--){
			push.apply(this, q[i]);
		}
	}
	
	return load;
});