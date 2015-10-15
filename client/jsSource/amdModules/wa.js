require([
	// 'http/api',
	// 'config/api',
// 	
	// 'cookie/id',
	// // 'util/JSON',
	'core/exports',
	'init/api',
	'util/log',
	
	// get userInfo just run once, nullModule is for the exclude funcion.
	'config/getUserInfo',
	'nullModule'
], function(exports, init, log){
	var q;
	function begin(q){
		var env,
				tmp1,
				appId;
		// define the queue ready callback, 
		// in this callback, it will send the data, 
		// then remove these data from localStorage.
		init.setQueueReady();
		
		// set the appId and env
		if(q.length){
			// get the first data
			tmp1 = q.shift();
			appId = tmp1[0];
			env = tmp1[1];
			init.setEnv(appId, env);
		}else{
			log('miss the appId and env');
		}
		
		// change the push function of _waq
		// XXX: after change the push method of _waq,
		//      the datas will goes into the push function instead of going into the _waq
		init.changePush(q);
		
		init.loadStorages();
		init.loadQueue(q);
		
		// send the pv data
		init.sendPV();
	}
	
	q = exports._waq;
	if(q){
		begin(q);
	}else{
		log('the _waq is missed');
	}
});
