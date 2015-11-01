define([
	'init/setQueueReady',
	'init/changePush',
	'init/setEnv',
	'init/loadStorages',
	'init/loadQueue',
	'init/sendPV'
], function(setQueueReady, changePush, setEnv, loadStorages, loadQueue, sendPV){
	return {
		setQueueReady: setQueueReady,
		setEnv: setEnv,
		changePush: changePush,
		loadStorages: loadStorages,
		loadQueue: loadQueue,
		sendPV: sendPV
	};
});