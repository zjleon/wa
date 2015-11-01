// there will be two parameters pass to the onReady callback:
// first: queue data,
// second: all storageKeys in this queue 

define([
	'data/queue/q',
	'data/queue/k',
	'util/log',
	'time/api'
], function(q, k, log, time){
	var onReady,
			lastSend = null,
			firstPush = null,
			queuePromise = null,
			queueCheckTimer = null;
	
	function pub(cmd, value){
		if(cmd === 'check'){
			check();
			return;
		}
		if(cmd === 'later'){
			later(value);
			return;
		}
		if(cmd === 'ready'){
			ready(value);
			return;
		}
	}
	function sub(func){
		// register the callback function. 
		onReady = func;
	}
	// add data to queue, and do the initial task.
	// 'skipCheck' can be true, this is called by the ajax failed
	function add(data, key, skipCheck){
		var now = time.now();
		// store the data
		q.push(data);
		// store the key
		k.push(key);
		
		if(!firstPush){
			// record the first push time stamp
			firstPush = now;
		}
		// record last send time stamp, 
		// make sure the first push call can use queue
		if(!lastSend){
			lastSend = now;
		}
		// publish message.
		pub('check');
	}
	// this function should return the queue if the queue can be sent,
	// return false if queue can not be sent.
	function check(){
		var tmp1,
				now,
				r = {},
				keys = [],
				sendInterval = 1500,
				pushInterval = 1500;
		now = time.now();
		// console.log(now - lastSend);
		// console.log(now - firstPush);
		if(
			// when queue length over 50
			q.length>50
			||
			// when queue has data and it over 1.5 second from last send and 1.5 second from the first push
			q.length>0 && (now - lastSend) > sendInterval && (now - firstPush) > pushInterval
		){
			lastSend = now;
			firstPush = null;
			// new an Array then give it to the result
			r.q = [].concat(q);
			r.k = [].concat(k);
			q = [];
			k = [];
			
			// cancel the check timer
			pub('later', false);
			pub('ready', r);
		}else if(
			// make sure there will not make an infinite loop
			q.length>0
		){
			// check later
			pub('later', true);
		}
	}
	function later(checkLater){
		var timerInterval = 800;
		// clear timer no matter what hapen
		clearTimeout(queueCheckTimer);
		queueCheckTimer = null;
		
		if(checkLater){
			// set a timer to check queue later.
			queueCheckTimer = setTimeout(function(){
				pub('check');
			}, timerInterval);
		}
	}
	function ready(r){
		// console.dir(r);
		// return;
		if(onReady){
			onReady(r.q, r.k);
		}else{
			log('onReady callback not defined');
		}
	}
	
	return {
		add:add,
		sub:sub
		// isReadyDefined:(function(){
			// return onReady ? true : false;
		// })()
	};
});