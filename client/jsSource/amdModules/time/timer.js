define([
	'core/exports',
	'util/log',
	'time/timerList',
], function(exports, log, timerList){
	function now(){
		if(exports.Date.now){
			return exports.Date.now().valueOf();
		}else{
			return (new exports.Date()).valueOf();
		}
	}
	
	// The timer only can be one of these two state, paused or counting.
	function isPaused(timer){
		// the pause array can not be add data until the timer is resume, 
		// so we can use totally equal here.
		if(timer.pause.length === timer.resume.length + 1){
			return true;
		}else{
			return false;
		}
	}
	
	function begin(name){
		if(!name){
			log('Must give a name to begin a timer, abort create.');
			return false;
		}
		if(timerList[name]){
			log('timer ' + name + ' is exsited, abort create.');
			return false;
		}
		timerList[name] = {
			'begin': now(),
			'pause': [],
			'resume': []
		};
	}
	
	function pause(name){
		if(!timerList[name]){
			log('timer ' + name + ' is not exsited, abort pause.');
			return false;
		}
		// make sure the timer is resumeed.
		if(isPaused(timer)){
			log('timer ' + name + ' is paused, abort pause.');
			return false;
		}
		timerList[name].pause.push(now());
	}
	
	function resume(name){
		var t,
				tmp1;
		t = timerList[name];
		if(!t){
			log('timer ' + name + ' is not exsited, abort resume.');
			return false;
		}
		// make sure the timer is paused.
		if(!isPaused(timer)){
			log('timer ' + name + ' is counting, abort resume.');
			return false;
		}
		
		timerList[name].resume.push(now());
	}
	
	function elapse(name){
		var r,
				i,
				t,
				tmp1,
				pauseArr,
				resumeArr,
				totalPaused,
				stopTimePoint;
		t = timerList[name];
		if(!t){
			log('timer ' + name + ' is not exsited, abort elapse.');
			return;
		}
		pauseArr = timerList[name].pause;
		resumeArr = timerList[name].resume;
		if(pauseArr > resumeArr){
			// If the timer is paused, use the last time stamp as the end point.
			stopTimePoint = pauseArr[pauseArr.length - 1];
		}else{
			// Otherwise use current time stamp as end point.
			stopTimePoint = now();
		}
		
		totalPaused = 0;
		i = resumeArr.length;
		if(i){
			while(i--){
				// Calculate the total pause time.
				totalPaused += resumeArr[i] - pauseArr[i];
			}
		}
		
		r = stopTimePoint - totalPaused - t.begin;
		return r;
	}
	
	function reset(name){
		timerList[name] = {
			'begin': now(),
			'pause': [],
			'resume': []
		};
		log('timer ' + name + ' has been reset.');
	}
	
	
	return {
		begin: begin,
		pause: pause,
		resume: resume,
		elapse: elapse,
		reset: reset,
		now: now
	};
	
});