describe('group test', function(){
  // var cookie = require('oldBrowser/JSON');
  var group = require('data/group/api');
  var get = require('data/group/get');
  var g = require('data/group/g');
	
  describe('group define', function(){
    it('Should get two object that member are null', function(){
    	var tmp1,
    			tmp2;
      tmp1 = {
				m1: null,
				m2: null,
				m3: null
			};
			tmp2 = group.define('m1', 'm2', 'm3');
      expect(tmp2).toEqual(tmp1);
      
      tmp1 = {
				m1: null,
				m4: null
			};
			tmp2 = group.define('m1', 'm4');
      expect(tmp2).toEqual(tmp1);
			
    });
  });
  describe('group add', function(){
    it('Should set m1 that in both group to integer 1', function(){
    	var tmp1,
    			tmp2;
      // console.log(group.add);
      group.add('m1', 1);
      tmp1 = g[0].m1;
      tmp2 = g[1].m1;
      expect(tmp1).toEqual(1);
      expect(tmp2).toEqual(1);
    });
    it('Should set m2 that in the first group to string "a"', function(){
    	var tmp1,
    			tmp2;
      // console.log(group.add);
      group.add('m2', 'a');
      tmp1 = g[0].m2;
      expect(tmp1).toEqual('a');
    });
    it('Should set m2 that in the first group to integer 1', function(){
    	var tmp1,
    			tmp2;
      // console.log(group.add);
      group.add('m2', 1);
      tmp1 = g[0].m2;
      expect(tmp1).toEqual(1);
    });
    it('Set m3 that in the first group to integer 1 and function add should return an array that equal to [{m1:1, m2:1, m3:1}]', function(){
    	var tmp1,
    			tmp2;
      // console.log(group.add);
      var r = group.add('m3', 1);
      var tmp2 = [{m1:1, m2:1, m3:1}];
      expect(r).toEqual(tmp2);
      
    });
    it('The members of the first group should equal to null.', function(){
    	var tmp1,
    			tmp2;
      // console.log(group.add);
      tmp1 = g[0];
      tmp2 = {m1: null, m2: null, m3: null};
      expect(tmp1).toEqual(tmp2);
    });
  });
  
});