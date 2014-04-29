'use strict';

/* Directives */
angular.module('myApp', []).
  directive('issue', function() {
    console.log("ok");
    return {
      restrict: 'E',
      scope: {
        content: '=content'
      },
      templateUrl: 'app/partials/issue.html'
    };
  });
