define([
	'http/post',
	'http/retry'
], function(post, retry){
	var api = {
		post: post,
		retry: retry
	};
	
	return api;
});