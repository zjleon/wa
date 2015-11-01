define(function(){
	return function(obj1, obj2, keepOwnProperty) {
		var i, obj3 = {};
		obj2 = obj2 || {};
		for(i in obj1) {
			obj3[i] = obj1[i];
			if(obj2[i] != null) {
				if(keepOwnProperty) {
					if(obj1.hasOwnProperty[i]) {
						obj3[i] = obj2[i];
					}
				} else {
					obj3[i] = obj2[i];
				}
			}
		}
		return obj3;
	};
});