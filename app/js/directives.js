'use strict';

/* Directives */
angular.module('issuesApp.directives', [])
  .directive('issues', function() {
    return {
      restrict: 'E',
      scope: {
        issues: '=issues',
        filter: '=filter',
        activeIssueId: '=activeIssueId'
      },
      templateUrl: 'app/partials/issues.html'
    };
  })
  .directive('escapable', function() {
    var escapeKey = 27;
    return function(scope, element, attrs) {
      element.on('keydown', function (event) {
        if (event.keyCode == escapeKey) element[0].blur();
      });
    };
  });
