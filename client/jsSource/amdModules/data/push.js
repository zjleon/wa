define([
	'util/log',
	'data/group/api',
	'data/queue/api',
	// 'data/wrap/api',
	'data/storage/api',
	'data/storage/api'
], function(log, group, queue, storage, config){
	function handleData(command, value1, value2){
		var v1,
				v2,
				key,
				tmp1,
				data = {};
		// handle normal data and group data.
		data.type = command;
		if(command === 'group'){
			// add the value to the member
			// TODO: change srcElement to value
			data.srcElement = group.add(value1, value2 ? value2 : null);
		}else{
			data.srcElement = value1 ? value1 : null;
		}
		// save to localStorage
		key = storage.set(data);
		queue.add(data, key);
		
		// XXX: the callback function defined in the init part
	}
	function push(command, value1, value2){
		var i,
				tmp1;
		if(command === 'config'){
			config.set(value1, value2);
			
			return;
		}else if(command === 'groupDefine'){
			if(!value2){
				// make sure there at last two members.
				log('the group you defined is less than two member.');
				return;
			}
			
			tmp1 = [];
			i = arguments.length;
			// get the group members
			for(i=1 ; i<arguments.length ; i++){
				tmp1.push(arguments[i]);
			}
			group.define.apply(this, tmp1);
			return;
		}else{
			handleData(command, value1, value2);
			
		}
		
	}
	
	
	return push;
});