define([
	'time/api',
	'data/queue/q',
	'data/queue/k'
], function(time, queue, keys){
	var maxTry = 2,
			retry = 0,
			lastTry = 0,
			// unit is minute
			interval = 15;
	// this function return if the request should be send again.
	// if retry happens, return the retried times.
	function couldTry(){
		var r,
				now = time.now();
		if(retry >= maxTry){
			if(now-lastTry >= interval*60*1000){
				// if it 30min from last retry, 
				// just try again and reset the lastTry time stamp.
				// if this retry success, the success callback will reset the retry times 
				lastTry = time.now();
				r = true;
			}else{
				r = false;
			}
		}else if(retry){
			r = retry;
		}else{
			r = true;
		}
		return r;
	}
	function addToQueue(q){
		// avoid trigger the queue check function
		var i;
		// console.log(q);
		i = q.length;
		while(i--){
			// add to queue without check
			queue.add(q[i].type, q[i].value), false;
		}
	}
	
	return {
		couldTry: couldTry,
		tried: function(q){
			++retry;
			// record the last fail time stamp
			lastTry = time.now();
			addToQueue(q);
			// return couldTry();
		},
		reset: function(){
			retry = 0;
		}
	};
});