// return the index of the group that contain the specify member name. 

define([
	'data/group/g',
	'util/log'
], function(groups, log){
	function get(memberName){
		var r,
				i,
				tmp1;
		r = [];
		i = groups.length;
		if(!i){
			return null;
		}
		while(i--){
			if(groups[i].hasOwnProperty(memberName)){
				// just push the index, 
				// the refer to the group object may cause memory release issue.
				r.push(i);
			}
		}
		
		// console.log(r.length);
		if(!r.length){
			r = null;
			log('can not find the group contain ' + memberName + ' in group list, is the memberName right?');
		}
		return r;
	}
	
	return get;
});