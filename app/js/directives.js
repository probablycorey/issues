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
        $scope.activeIssueId = null;

        var getActiveIssue = function() {
          return $scope.issues[$scope.activeIssueId];
        };

        var selectIssueByDelta = function(delta) {
          var ids = $scope.issues.$getIndex();
          var index = ids.indexOf($scope.activeIssueId) + delta;

          if (index >= ids.length) $scope.activeIssueId = $scope.issues.$getIndex()[0];
          else if (index < 0) $scope.activeIssueId = ids[ids.length - 1];
          else $scope.activeIssueId = ids[index];

          ScrollToElementService("issue" + getActiveIssue().$id);
        };

        var moveActiveIssueByDelta = function(delta) {
          if ($scope.activeIssueIndex + delta < 0 || $scope.activeIssueIndex + delta >= $scope.issues.$getIndex().length) return;

          var issue = getActiveIssue();
          var otherIssueId = $scope.issues.$getIndex()[$scope.activeIssueIndex + delta];
          var otherIssue = $scope.issues[otherIssueId];
          var tmp = issue.$priority;
          issue.$priority = otherIssue.$priority;
          otherIssue.$priority = tmp;

          IssueService.$save()
        };

        hotkeys.add({
          combo: 'j',
          description: 'Select down',
          callback: function() {selectIssueByDelta(1);}
        });

        hotkeys.add({
          combo: 'ctrl+j',
          description: 'Move down',
          callback: function() {moveActiveIssueByDelta(1);}
        });

        hotkeys.add({
          combo: 'k',
          description: 'Select up',
          callback: function() {selectIssueByDelta(-1);}
        });

        hotkeys.add({
          combo: 'ctrl+k',
          description: 'Move up',
          callback: function() {moveActiveIssueByDelta(-1);}
        });
      }
    };
  });
