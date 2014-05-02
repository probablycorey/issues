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
      templateUrl: 'app/partials/issues.html',
      controller: function($scope) {
        $scope.assigneeImageUrl = function(assignee) {
          return assignee ? assignee.avatar_url : "https://github.global.ssl.fastly.net/images/modules/logos_page/GitHub-Mark.png";
        };

        $scope.repoFromIssue = function(issue) {
          return issue.url.match(/repos\/(.*?)\/issues\/\d+/)[1];
        };
      }
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
