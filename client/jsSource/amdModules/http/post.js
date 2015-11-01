// This module will return a promise object that can be chain.
// This promise will return reject format like below when ajax goes into some trouble:
/* {
			// options will put into req.opt
			request: req, 
			message: 'request timeout'
		}
*/
// 14-7-27:put the request option into the XMLRequest object 
//         to avoid option load error when it been called multi times

define([
	'config/api',
	'http/request',
	'util/JSON',
	'util/extend',
	'util/log'
], function(config, createRequest, JSON, extend, log){
	function sendRequestByPost(param){
		return new Promise(function(resolve, reject){
	    var url,
		    	opt,
		    	req = createRequest();
	    if(!req){
	    	return;
	    }
	    req.opt = extend({
				url:config.server.getPostURL,
				dataType:'normal',
				data:null,
				//begin:null,
				// success:null,
				// error:null,
				timeout:0
				// retry:0
			} , param);
			if(!req.opt.url){
				reject({
					request: req, 
					// options: opt, 
					message: 'no url'
				});
			}
			//only use 'post' method
			req.open('POST' , req.opt.url, true);
			req.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=utf-8');
			if(req.opt.dataType==='json'){
				req.opt.data = JSON.stringify(req.opt.data);
				req.setRequestHeader('Accept','application/json, text/javascript');
				// req.setRequestHeader('Accept','*/*');
				// Accept: application/json, text/javascript, */*; q=0.01
			}else{
				req.setRequestHeader('Accept','*/*');
			}
			// XXX: delete begin callback, It seems useless
			// if(opt.begin){
				// opt.begin(req, opt);
			// }
			if(req.opt.timeout){
				req.timeout = req.opt.timeout;
				req.ontimeout = function(){
					reject({
						request: req, 
						// options: opt, 
						message: 'request timeout'
					});
				};
			}
			//error callback
			req.onerror = function(){
				reject({
					request: req, 
					// options: opt, 
					message: 'request error'
				});
			};
			req.withCredentials = true;
			req.onload = function(){
				// XXX: the return data format MUST be JSON
				// function processResponse(req) {
					// var data;
					// if(req.opt.dataType==='json'){
						// // log(req);
						// data = JSON.parse(req.responseText);
					// }else{
						// data = req.responseText;
					// }
					// return data;
				// }
				var data,
						msg = '',
						isSuccess,
						responseText = '';
				if(req.responseText){
					try{
						// In this state, there must be a string return by server, 
						// so we don't need to handle the state code
						// but we can't sure if this returned data can be parse to json,
						// for example the response has a 302 return and redirect to an html page.
						// console.log(req.responseText);
						responseText = JSON.parse(req.responseText);
						if(responseText.result === 0){
							isSuccess = true;
						}else{
							isSuccess = false;
							msg = responseText.message;
						}
					}catch(e){
						// reject({
							// request: req, 
							// // options: opt, 
							// message: 'parse error'
						// });
						isSuccess = false;
						// TODO: change to the error message
						msg = 'parse error';
					}
				}else{
					// if there are no text in the responseText,
					// consider it done.
					isSuccess = true;
				}
				if(isSuccess){
					// data = JSON.parse(req.responseText);
					resolve(responseText);
				}else{
					reject({
						request: req, 
						// options: opt, 
						message: msg
					});
				}
			};
			req.send(req.opt.data);
		});
	};
	
	return sendRequestByPost;
});
