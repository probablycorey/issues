'use strict';

/* Directives */
angular.module('issuesApp.directives', []).
  directive('issues', function() {
    return {
      restrict: 'E',
      scope: {
        issues: '=issues',
        activeIssueId: '=activeIssueId'
      },
      templateUrl: 'app/partials/issues.html'
    };
  });
