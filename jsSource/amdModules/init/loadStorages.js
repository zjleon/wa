define([
	'data/queue/api',
	'data/storage/api',
	'data/push',
	'util/log'
], function(q, storage, push, log){
	function load(){
		var i,
				tmp1,
				data;
		data = storage.all();
		i = data.length;
		if(i){
			// push all stored data into queue
			while(i--){
				// delete this data before send it.
				storage.remove(data[i].key);
				push(data[i].value.type, data[i].value.srcElement);
			}
		}
		
		return true;
	}
	
	return load;
});