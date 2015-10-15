// expect(true).toBe(true);
// expect(foo).not.toThrow();
// expect(a).toContain("bar");
// expect(foo).toBeTruthy();
// expect(a).toBeFalsy();
// expect(a.bar).toBeUndefined();
// expect(a.bar).toBeDefined();

describe('queue test', function(){
	var tmp1,
			tmp2;
	var queueList = require('data/queue/q');
	var q = require('data/queue/api');
	var time = require('time/api');
	var func;
	beforeEach(function(){
		// action before each 'it'.
		jasmine.clock().install();
		func = {
			callback: function(q){
				
			}
		};
		spyOn(func, 'callback');
		q.sub(func.callback);
	});
	afterEach(function(){
		// action after each 'it'.
		jasmine.clock().uninstall();
	});
	
	it('length of q should be 1', function() {
    // expect a value to be specify type and value
    q.add({a:1}, 1);
    expect(queueList.length).toBe(1);
  });
	it('readyCallback should not be called', function() {
    // expect a value to be specify type and value
    q.add({b:2}, 2);
    expect(func.callback).not.toHaveBeenCalled();
  });
	it('readyCallback should be called with queue data', function() {
    // expect a value to be specify type and value
    spyOn(time, 'now').and.callFake(function(){
    	return (new Date()).valueOf()+5000;
    });
    q.add({c:3}, 3);
    // this is the queue
    var a = [
    	{a:1}, {b:2}, {c:3}
    ];
    // this is the keys
    var b = [1, 2, 3];
    expect(func.callback).toHaveBeenCalled();
    expect(func.callback).toHaveBeenCalledWith(a, b);
  });
	
	
	
	
});

