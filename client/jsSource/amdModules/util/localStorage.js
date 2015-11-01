define([
	'core/exports',
	'oldBrowser/localStorage'
], function(exports){
	if(exports.localStorage){
		return exports.localStorage;
	}else{
		// see the note in localStorage to figure out why use return.
		return require('oldBrowser/localStorage');
	}
	
});