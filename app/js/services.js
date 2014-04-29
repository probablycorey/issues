'use strict';

angular.module('issuesApp.services', [])
  .factory('GithubService', ['$http', function($http) {
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
  }])
  .factory("IssueService", ["$firebase", function($firebase) {
    var ref = new Firebase("https://glowing-fire-7680.firebaseio.com/issues");
    return $firebase(ref);
  }])
