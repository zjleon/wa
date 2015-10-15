define([
	'core/exports',
	'oldBrowser/JSON'
], function(exports){
	// The JSON object will add to window object if it not exsit.
	require('oldBrowser/JSON');
	return exports.JSON;
});