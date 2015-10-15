describe('cookie test', function(){
  var cookie = require('cookie/cookie');
	
  describe('get', function(){
    it('Should get a cookie "a=undefined"', function(){
      expect(cookie.get('a')).toBeNull();
    });
  });
  describe('save', function(){
    it('Should create a cookie "a=1"', function(){
    	cookie.set('a', 1);
      expect(cookie.get('a')).toEqual('1');
    });
    it('Should cookie a to 2', function(){
    	cookie.set('a', 2);
      expect(cookie.get('a')).toEqual('2');
    });
  });
  describe('delete', function(){
  	it('Should delete cookie a', function(){
	  	cookie.del('a');
	    expect(cookie.get('a')).toBeNull();
    });
  });
  
});