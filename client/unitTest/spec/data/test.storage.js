describe('storage test', function(){
	var tmp2,
			firstKey,
			secondKey;
	var store = require('data/storage/api');
	var ls = window.localStorage;
	var obj1 = {a: 1};
	var obj2 = {b: 2};
	var keyName = 'storageKey';
	
	// clear all storages.
	describe('clear all localStorages.', function() {
		// console.log(store.all().length);
		it('should get no value', function(){
			store.clear();
			var v = store.all();
			expect(ls.length).toBe(0);
		});
  });
	
	describe('add localStorage with obj1.', function() {
		it('should return "key" that is numberic', function(){
	    firstKey = store.set(obj1);
	    expect(firstKey).toMatch(/^wa_\d+$/g);
		});
		it('function "get" should get obj1', function(){
	    var v = store.get(firstKey);
	    expect(v).toEqual(obj1);
		});
  });
  
	describe('add localStorage with obj2.', function() {
		it('function "all" should get an Array with obj1 and obj2', function(){
	    secondKey = store.set(obj2);
	    var v = store.all();
	    if(v[0].key === firstKey){
		    expect(v[0].value).toEqual(obj1);
	    }else if(v[0].key === secondKey){
		    expect(v[0].value).toEqual(obj2);
	    }else{
	    	expect('the first item is wrong').toBe(0);
	    }
	    if(v[1].key === firstKey){
		    expect(v[1].value).toEqual(obj1);
	    }else if(v[1].key === secondKey){
		    expect(v[1].value).toEqual(obj2);
	    }else{
	    	expect('the second item is wrong').toBe(0);
	    }
		});
  });
  
	describe('remove localStorage.', function() {
		it('should remove the second localStorage', function(){
	    store.remove(secondKey);
	    var v = store.all();
	    expect(v.length).toEqual(1);
	    expect(v[0].value).not.toEqual(obj2);
		});
  });
	
});

