'use strict';

var notifyService = angular.module('issuesApp.services', []);

notifyService.factory('github', ['$http', function($http) {
  return {
    issues: function() {
      return $http({method: 'GET', url: 'https://api.github.com/repos/probablycorey/issues/issues'}).
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
