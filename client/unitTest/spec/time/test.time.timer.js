describe('time service test', function(){
  var time = require('time/api');
  var timerList = require('time/timerList');
	
  describe('timer create', function(){
    it('Should get a timer named a with the basic attributes', function(){
    	var obj = {
				'pause': [],
				'resume': []
			};
    	
    	time.begin('a');
    	expect(timerList.a.begin).toMatch(/\d+/);
      expect(timerList.a).toEqual(jasmine.objectContaining(obj));
    });
  });
  
  // TODO: ohter test case
  
});