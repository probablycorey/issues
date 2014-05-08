'use strict';

/* Directives */
angular.module('issuesApp.directives', [])
  .directive('issues', function() {
    return {
      restrict: 'E',
      scope: {
        issues: '=issues',
        filter: '=filter',
        activeCard: '=activeCard'
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
  .directive('ribbon', function() {
    return {
      restrict: 'E',
      scope: {
        issue: '=issue',
      },
      templateUrl: 'app/partials/ribbon.html',
      controller: function($scope) {
        $scope.isNew = function(issue) {
          var createdAt = new Date(issue.created_at);
          var delta = new Date() - createdAt;
          var hours = delta / 1000 / 60 / 60;
          return hours < 24;
        };

        $scope.isUnhandled = function(issue) {
          return !issue.handled && !issue.assignee;
        };

        $scope.isClosed = function(issue) {
          return issue.state == 'closed';
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
