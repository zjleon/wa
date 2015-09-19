// if there are two group contain member a, 
// when the value of a change, 
// the value a in these two group should change at the same time.
// return:
// 	This module return null if the group can't be sent, otherwise return the group
// TODO: if the group member all setted, call the push function
// TODO: user can controll if the group member can be overwrite

define([
	'http/api',
	'data/group/g',
	'data/group/get',
	'util/dcopy',
	'util/log'
], function(http, groups, getGroup, dcopy, log){
	function add(memberName, value){
		var i,
				r,
				tmp1,
				group,
				groupArr,
				groupNull,
				groupCanbeSent;
		r = [];
		groupArr = getGroup(memberName);
		// console.log(groupArr);
		if(!groupArr){
			log('the ' + memberName + ' is not a member of any group.');
			return null;
		}else{
			i = groupArr.length;
		}
		// set all group member
		while(i--){
			// groupArr.push(groups[tmp1[i]]);
			group = groups[groupArr[i]];
			group[memberName] = value;
			
			// console.log(group);
			// create an object that members are null, 
			// which can be use to replace the group when group sent
			groupNull = {};
			// start to check if the members in this group is fullfill
			groupCanbeSent = true;
			for(tmp1 in group){
				if(!group[tmp1]){
					groupCanbeSent = false;
					break;
				}
				groupNull[tmp1] = null;
			}
			
			// TODO:send this group
			if(groupCanbeSent){
				// push the copied group to result array
				r.push(dcopy(group));
				
				// reset all member to null
				groups[groupArr[i]] = groupNull;
				// console.log(groups[0].m1);
			}
		}
		
		if(!r.length){
			r = null;
		}
		return r;
	}
	
	return add;
});