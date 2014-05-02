'use strict';

angular.module('issuesApp.services', [])
  .factory('GithubService', ['$http', function($http) {
    return {
      issuesForRepo: function(repo) {
        return $http({method: 'GET', url: 'https://api.github.com/repos/' + repo + '/issues'}).
          catch(function(data, status, headers, config) {
            throw new Error(data);
          }).
          then(function(data, status, headers, config) {
            var issues = data.data;
            return issues;
          });
      }
    };
  }])
  .factory("FirebaseService", function($firebase, $q) {
    var deferred = $q.defer();

    var firebase = $firebase(new Firebase("https://corey.firebaseio.com/")).$on('loaded', function() {
      deferred.resolve(firebase);
    });

    return deferred.promise;
  })
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
