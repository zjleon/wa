define([
	'data/group/g',
	'util/log'
], function(groups, log){
	function def(){
		var i,
				tmp1;
		// var args = arguments;
		tmp1 = {};
		for(i=0 ; i<arguments.length ; i++){
			tmp1[arguments[i]] = null;
		}
		// console.log(groups);
		groups.push(tmp1);
		
		return tmp1;
	}
	
	return def;
});