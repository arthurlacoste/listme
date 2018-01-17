var listmeApp = angular.module('listmeApp', ['ngRoute']);

function getApiUrl() {
  if(window.location.host==='listme.irz.fr') {
    return 'https://listmeapi.irz.fr/';
  } else {
    return 'http://' + window.location.hostname + ':1337/';
  }
}

var apiurl = getApiUrl();

listmeApp.filter('reverse', function() {
  return function(input) {
    if (!input || !input.length) { return; }
    return input.slice().reverse();
  };
});

listmeApp.config(function ($routeProvider) {
    $routeProvider
      .when('/:listID', {
        templateUrl: 'static/views/item.html',
        controller: 'mainController'
      })
  });

listmeApp.factory('serviceAjax', function serviceAjax($http) {
    return{
        getList: function(id){
            console.log(apiurl + 'get/' + id);
            return $http.get(apiurl + 'get/' + id);
        }
    }
  });

listmeApp.controller('mainController', function ($scope, $routeParams, serviceAjax) {
        $scope.listID = $routeParams.listID;
        $scope.totalPages = 0;

        var loadList = function(){
            $scope.loading = true;
            serviceAjax.getList($scope.listID).success(function(data){
                $scope.loading = false;
                $scope.list = data;
                $scope.heightHeader = '200px';
                $scope.listContent = true;
                console.log('test yessss',$scope.list);
            });
        };

        $scope.pageChanged = function(){
            loadList();
        };

        loadList();
  });
