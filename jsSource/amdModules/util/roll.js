define(function(){
	return function(start , end){
		return Math.floor(Math.random() * (end - start + 1) + start);
	};
});