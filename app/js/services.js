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
    var firebase = $firebase(new Firebase("https://corey.firebaseio.com/"));

    return {
      getList: function(name) {
        return firebase.$child(name);
      }
    };
  }])
  .factory("ScrollToElementService", ['$window', '$document', function($window, $document) {
    var isElementInViewport = function(element) {
      var rect = element.getBoundingClientRect();
      return rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $window.innerHeight &&
        rect.right <= $window.innerWidth;
    };

    var scrollToElement = function(element) {
      if (!isElementInViewport(element)) element.scrollIntoView(false);
    };

    return function(idString) {
      var element = $document[0].getElementById(idString);
      scrollToElement(element);
    };
  }]);
