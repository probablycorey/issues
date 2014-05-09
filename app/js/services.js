'use strict';

var FIREBASE_URL="https://corey.firebaseio.com/";

angular.module('issuesApp.services', [])
  .service('GithubService', function($http, $q) {
    this.setToken = function(token) {
      this.token = token;
    };

    this.getConfig = function() {
      return {headers: {'Authorization': 'token ' + this.token}};
    };

    this.issuesForRepo = function(repo) {
      return this.get('https://api.github.com/repos/' + repo + '/issues');
    };

    this.get = function(url) {
      var deferred = $q.defer();
      var results = [];
      var self = this;
      $http.get(url, this.getConfig())
        .catch(function(response) {
          console.error(response);
          deferred.reject(response.data);
        })
        .then(function(response) {
          results = results.concat(response.data);
          var match = response.headers('link').match(/<(.*?)>; rel="next"/);
          if (!match) {
            deferred.resolve(results);
          }
          else {
            self.get(match[1]).then(function(moreResults) {
              deferred.resolve(results.concat(moreResults));
            });
          }
        });

        return deferred.promise;
    };
  })
  .factory("FirebaseService", function($firebase, $firebaseSimpleLogin, $q) {
    var deferred = $q.defer();
    var firebase = new Firebase(FIREBASE_URL);
    var oauthOptions = {rememberMe: true, scope: 'user,gist,repo'};
    // var user = {accessToken:"wow"};

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
