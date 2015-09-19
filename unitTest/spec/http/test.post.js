describe('post request test', function(){
  require('../lib/promise');
  var post = require('http/post');
  var config = require('config/api');
  var fakePath = 'http://test.com/a';
  var fakeText1 = '{"result":0}';
  var fakeText2 = '{"result":1, "message":"aaa"}';
  var callback = {
  	success: function(){
	  	
	  },
  	fail:function(){
	  	
	  }
	};

	beforeEach(function() {
		config.server.getPostURL = fakePath;
		spyOn(callback, 'success');
		spyOn(callback, 'fail');
	  jasmine.Ajax.install();
	  
	});
	afterEach(function() {
	  jasmine.Ajax.uninstall();
	});
	
  it('The success callback should be called at right time', function(done){
    var promise = post({
    	data:1
    }).then(
    	function(data){
	    	// console.log('s-1');
	    	callback.success(data);
	    	return data;
	    }
    );
    
    expect(jasmine.Ajax.requests.mostRecent().url).toBe(fakePath);
    expect(callback.success).not.toHaveBeenCalled();
    
		jasmine.Ajax.requests.mostRecent().response({
			"status": 200,
			"contentType": 'text/plain',
			"responseText": fakeText1
		});
		promise.then(function(){
			// the promise then function will be call AFTER the response.
			// so we need a then chain to examine the result.
			// console.log('s-2');
			expect(callback.success).toHaveBeenCalled();
			expect(callback.success).toHaveBeenCalledWith(JSON.parse(fakeText1));
			done();
		});
  });
	
  it('The fail callback should be called with response error', function(done){
    var promise = post({
    	data:2
    }).then(null, 
    	function(response){
	    	// console.log('f-1');
	    	callback.fail(response.request, response.message);
	    	return response;
	    }
    );
    
    expect(jasmine.Ajax.requests.mostRecent().url).toBe(fakePath);
    expect(callback.fail).not.toHaveBeenCalled();
    
		jasmine.Ajax.requests.mostRecent().response({
			"status": 200,
			"contentType": 'text/plain',
			"responseText": fakeText2
		});
		promise.then(function(response){
			// the promise then function will be call AFTER the response.
			// so we need a then chain to examine the result.
			expect(callback.fail).toHaveBeenCalled();
			// expect(callback.fail).toHaveBeenCalledWith();
			// console.log('f-2');
			expect(response.message).toEqual(JSON.parse(fakeText2).message);
			expect(response.request.opt.data).toEqual(2);
			done();
		});
  });
  
});