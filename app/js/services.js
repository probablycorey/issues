'use strict';

var FIREBASE_URL="https://corey.firebaseio.com/";

angular.module('issuesApp.services', [])
  .factory('GithubService', ['$http', function($http) {
    return {
      issuesForRepo: function(repo, token) {
        var config = {headers: {'Authorization': 'token ' + token}};

        return $http.get('https://api.github.com/repos/' + repo + '/issues', config)
          .catch(function(data, status, headers, config) {
            console.error(data);
            console.error(status);
            throw new Error(data);
          })
          .then(function(data, status, headers, config) {
            var issues = data.data;
            return issues;
          });
      }
    };
  }])
  .factory("FirebaseService", function($firebase, $firebaseSimpleLogin, $q) {
    var deferred = $q.defer();
    var firebase = new Firebase(FIREBASE_URL);
    var oauthOptions = {rememberMe: true, scope: 'user,gist,repo'};

    var fb = $firebase(firebase);
    fb.$on('loaded', function() {
      $firebaseSimpleLogin(firebase).$login('github', oauthOptions).then(function(user) {
        deferred.resolve({firebase:fb, user:user});
      });
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
  }])
  .factory("_", function($window) {
    return $window._;
  });
