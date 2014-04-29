'use strict';

/* Directives */
angular.module('issuesApp.directives', []).
  directive('issue', function() {
    return {
      restrict: 'E',
      scope: {
        issue: '=content'
      },
      templateUrl: 'app/partials/issue.html'
    };
  });
