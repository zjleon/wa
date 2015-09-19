define([
	'data/queue/q',
	'time/api'
], function(q, time){
	var lastSend = null,
			firstPush = null,
			queueCheckTimer = null;
	// add data to queue, and do the initial task.
	function add(obj){
		var now = time.now();
		q.push(obj);
		if(!firstPush){
			// record the first push time stamp
			firstPush = now;
		}
		// record last send time stamp, 
		// make sure the first push call can use queue
		if(!lastSend){
			lastSend = now;
		}
		return check();
	}
	// this function should return the queue if the queue can be sent,
	// return false if queue can not be sent.
	function check(){
		var tmp1,
				now,
				keys = [],
				r = false,
				sendInterval = 1500,
				pushInterval = 1500,
				timerInterval = 800;
		now = time.now();
		// clear timer no matter what hapen
		if(queueCheckTimer){
			clearTimeout(queueCheckTimer);
			queueCheckTimer = null;
		}
		// console.log(now - lastSend);
		// console.log(now - firstPush);
		if(
			// when queue length over 50
			q.length>50
			||
			// when queue has data and it over 1.5 second from last send and 1.5 second from the first push
			q.length>0 && (now - lastSend) > sendInterval && (now - firstPush) > pushInterval
		){
			lastSend = null;
			firstPush = null;
			// new an Array the give it to the result
			// TODO: call the wrap function
			r = [].concat(q);
			q = [];
		}else if(
			// make sure there will not make an infinite loop
			q.length>0
		){
			// set a timer to make sure no data miss
			queueCheckTimer = setTimeout(check, timerInterval);
		}
		return r;
	}
	
	return add;
});