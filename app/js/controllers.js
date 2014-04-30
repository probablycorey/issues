'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', function($scope, $window, IssueService, ScrollToElementService, hotkeys) {
    $scope.activeIssueId = null;
    $scope.currentIssues = IssueService("current");
    $scope.nextIssues = IssueService("next");
    $scope.currentIssues.$on("loaded", function() {
      $scope.activeIssueId = $scope.currentIssues.$getIndex()[0];
    });

    var activeIssues = $scope.currentIssues;

    var getActiveIssue = function() {
      return activeIssues[$scope.activeIssueId];
    };

    var selectIssueByDelta = function(delta) {
      var ids = activeIssues.$getIndex();
      var index = ids.indexOf($scope.activeIssueId) + delta;

      if (index >= ids.length) $scope.activeIssueId = activeIssues.$getIndex()[0];
      else if (index < 0) $scope.activeIssueId = ids[ids.length - 1];
      else $scope.activeIssueId = ids[index];

      ScrollToElementService("issue" + getActiveIssue().$id);
    };

    var moveActiveIssueByDelta = function(delta) {
      if ($scope.activeIssueIndex + delta < 0 || $scope.activeIssueIndex + delta >= activeIssues.$getIndex().length) return;

      var issue = getActiveIssue();
      var otherIssueId = activeIssues.$getIndex()[$scope.activeIssueIndex + delta];
      var otherIssue = activeIssues[otherIssueId];
      var tmp = issue.$priority;
      issue.$priority = otherIssue.$priority;
      otherIssue.$priority = tmp;

      IssueService.$save();
    };

    hotkeys.add({
      combo: 'j',
      description: 'Select down',
      callback: function() {selectIssueByDelta(1); return true;}
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
  });
