'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', function($scope, $window, IssueService, ScrollToElementService, hotkeys) {
    $scope.activeIssueId = null;
    $scope.currentIssues = IssueService("current");
    $scope.backlogIssues = IssueService("backlog");
    $scope.iceboxIssues = IssueService("icebox");
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

    var switchIssueList = function(delta) {
      var lists = [$scope.currentIssues, $scope.backlogIssues, $scope.iceboxIssues];
      var index = lists.indexOf(activeIssues);
      index += delta;
      if (index < 0) index = lists.length - 1;
      else if (index >= lists.length) index = 0;

      activeIssues = lists[index];
      $scope.activeIssueId = activeIssues.$getIndex()[0];
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

    hotkeys.add({
      combo: 'h',
      description: 'Move left',
      callback: function() {switchIssueList(-1);}
    });

    hotkeys.add({
      combo: 'l',
      description: 'Move right',
      callback: function() {switchIssueList(1);}
    });

    var addIssue = function() {
      var title = $window.prompt("Create new issue", "cool");
        if (title) {
        activeIssues.$add({title: title});
      }
    };

    hotkeys.add({
      combo: 'a',
      description: 'Add issue',
      callback: addIssue
    });
});
