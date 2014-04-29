'use strict';

/* Directives */
angular.module('issuesApp.directives', []).
  directive('issues', function() {
    return {
      restrict: 'E',
      scope: {
        issues: '=content'
      },
      templateUrl: 'app/partials/issues.html',
      controller: function($scope) {
        $scope.activeIssueIndex = 0;
      }
    };
  });
