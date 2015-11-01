define([
	'data/queue/api',
	'data/wrap/api',
	'data/storage/api',
	'http/api',
	'util/JSON',
	'util/log'
], function(queue, wrap, storage, http, JSON, log){
	function callback(queue, keys){
		var result,
				couldTry;
		result = wrap(queue);
		// console.log(result);
		
		// if the retry times reach max try times,
		// just keep this queue in the localStorage,
		// otherwise load all localStorages and send
		couldTry = http.retry.couldTry();
		if(couldTry){
			http.post({
				data: result
			}).then(
				function(r){
					log('ajax success');
					// log(r);
					
					// if there is a succees request happened,
					// reset the failedTimes and let all failed request can be sent
					http.retry.reset();
				}, function(r){
					var i,
							data;
					log('ajax failed');
					log(r.message);
					// log(r.request);
					
					data = JSON.parse(r.request.opt.data);
					// add the failed queue into current queue
					http.retry.tried(data.queue);
				}
			);
			
			// remove all local storage data
			storage.remove(keys);
		}
	}
	function set(){
		queue.sub(callback);
	}
	
	return set;
});