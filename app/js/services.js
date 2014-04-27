'use strict';

/* Services */

var notifyService = angular.module('myApp.services', []);

// notifyService.factory('notify', ['$window', function(win) {
//   var msgs = [];
//   return function(msg) {
//     win.alert(msg);
//   };
// }]);

notifyService.factory('issues', ['$http', function($http) {
  return function() {
    return $http({method: 'GET', url: 'https://api.github.com/repos/atom/find-and-replace/issues'}).
      catch(function(data, status, headers, config) {
        console.log(status);
        throw new Error(data);
      }).
      then(function(data, status, headers, config) {
        return data.data;
      });
  };
}]);
