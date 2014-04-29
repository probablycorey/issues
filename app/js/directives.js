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
      controller: function($scope, IssueService, ScrollToElementService, hotkeys) {
        $scope.activeIssueIndex = 0;

        var getActiveIssue = function() {
          var id = $scope.issues.$getIndex()[$scope.activeIssueIndex];
          return $scope.issues[id];
        };

        var selectNextIssue = function() {
          $scope.activeIssueIndex++;
          $scope.activeIssueIndex = $scope.activeIssueIndex % $scope.issues.$getIndex().length;
          ScrollToElementService("issue" + getActiveIssue().$id);
        };

        var selectPreviousIssue = function() {
          $scope.activeIssueIndex--;
          if ($scope.activeIssueIndex < 0) $scope.activeIssueIndex = $scope.issues.$getIndex().length - 1;
          ScrollToElementService("issue" + getActiveIssue().$id);
        };

        var moveActiveIssueByDelta = function(delta) {
          if ($scope.activeIssueIndex + delta < 0 || $scope.activeIssueIndex + delta >= $scope.issues.$getIndex().length) return;

          var issue = getActiveIssue();
          var otherIssueId = $scope.issues.$getIndex()[$scope.activeIssueIndex + delta];
          var otherIssue = $scope.issues[otherIssueId];
          if (issue.$priority == otherIssue.$priority) {
            issue.$priority = otherIssue.$priority + 1;
          }
          else {
            var tmp = issue.$priority;
            issue.$priority = otherIssue.$priority;
            otherIssue.$priority = tmp;
          }

          IssueService.$save().then(function() {

          });

          $scope.activeIssueIndex += delta;
        };

        hotkeys.add({
          combo: 'j',
          description: 'Select down',
          callback: selectNextIssue
        });

        hotkeys.add({
          combo: 'ctrl+j',
          description: 'Move down',
          callback: function() {moveActiveIssueByDelta(1);}
        });

        hotkeys.add({
          combo: 'k',
          description: 'Select up',
          callback: selectPreviousIssue
        });

        hotkeys.add({
          combo: 'ctrl+k',
          description: 'Move up',
          callback: function() {moveActiveIssueByDelta(-1);}
        });
      }
    };
  });
