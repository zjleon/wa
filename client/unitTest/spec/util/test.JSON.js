describe('JSON test', function(){
  // var cookie = require('oldBrowser/JSON');
  var JSON = require('util/JSON');
	
  describe('json parse', function(){
    it('Should get an object "{a:1}"', function(){
    	var tmp1 = JSON.parse('{"a":1}'),
    			tmp2 = {
    				a: 1
    			};
      expect(tmp1).toEqual(tmp2);
    });
  });
  describe('json stringify', function(){
    it('Should get an stringify "{"a":1}"', function(){
    	var tmp1 = JSON.stringify({a:1}),
    			tmp2 = '{"a":1}';
      expect(tmp1).toEqual(tmp2);
    });
  });
  
});