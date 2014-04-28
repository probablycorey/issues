'use strict';

var notifyService = angular.module('myApp.services', []);

notifyService.factory('github', ['$http', function($http) {
  return {
    issues: function() {
      return $http({method: 'GET', url: 'https://api.github.com/repos/atom/find-and-replace/issues'}).
        catch(function(data, status, headers, config) {
          console.log(status);
          throw new Error(data);
        }).
        then(function(data, status, headers, config) {
          var issues = data.data;
          return issues;
        });
    }
  };
}]);
