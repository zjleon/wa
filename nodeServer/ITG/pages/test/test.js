var myApp = angular.module('myPage', []);
myApp.controller('myCtrl1', function($scope){
	$scope.$watch('select1', function(n, o){
		$scope.name = n;
	})
	$scope.select1 = '1';
});