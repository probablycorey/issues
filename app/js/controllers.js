'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', function($scope, $window, $q, $firebase, GithubService, IssueService, ScrollToElementService, hotkeys) {
    $scope.activeIssueId = null;
    $scope.currentIssues = IssueService.getList("current");
    $scope.iceboxIssues = IssueService.getList("icebox");
    $scope.backlogIssues = IssueService.getList("backlog");
    $scope.githubIssues = null;

    var activeIssues = $scope.currentIssues;
    var lists = [$scope.currentIssues, $scope.backlogIssues, $scope.iceboxIssues];

    var loadingDefer = $q.defer();
    var loadingCount = 0;
    var loaded = function() {
      if (++loadingCount == 4) loadingDefer.resolve();
    };

    $scope.currentIssues.$on("loaded", loaded);
    $scope.backlogIssues.$on("loaded", loaded);
    $scope.iceboxIssues.$on("loaded", loaded);
    GithubService.issues().then(function(issues) {
      $scope.githubIssues = issues;
      loaded();
    });

    loadingDefer.promise.then(function() {
      setActiveIssues();

      $scope.githubIssues.forEach(function(issue) {
        var card = null;
        lists.forEach(function(list) {
          if (list[issue.id]) {
            card = list.$child(issue.id);
            return;
          }
        });

        if (!card) {
          card = $scope.iceboxIssues.$child(issue.id);
        }
        card.$update(issue);
      });

      setActiveIssues();
    });

    var setActiveIssues = function() {
      if ($scope.currentIssues.$getIndex().length) {
        activeIssues = $scope.currentIssues;
      }
      else if ($scope.backlogIssues.$getIndex().length) {
        activeIssues = $scope.backlogIssues;
      }
      else {
        activeIssues = $scope.iceboxIssues;
      }

      $scope.activeIssueId = activeIssues.$getIndex()[0];
    };

    var getActiveIssue = function() {
      return activeIssues.$child($scope.activeIssueId);
    };

    var selectIssueByDelta = function(delta) {
      var ids = activeIssues.$getIndex();
      var index = ids.indexOf($scope.activeIssueId) + delta;
      if (index >= ids.length || index < 0) return;
      $scope.activeIssueId = ids[index];
      ScrollToElementService("issue" + getActiveIssue().$id);
    };

    var moveActiveIssueByDelta = function(delta) {
      var activeIssueIndex = activeIssues.$getIndex().indexOf($scope.activeIssueId);
      if (activeIssueIndex + delta < 0 || activeIssueIndex + delta >= activeIssues.$getIndex().length) return;

      var issue = getActiveIssue();
      var otherIssueId = activeIssues.$getIndex()[activeIssueIndex + delta];
      var otherIssue = activeIssues.$child(otherIssueId);
      var tmp = issue.$priority;
      issue.$update({priority: otherIssue.$priority - 1});
      otherIssue.$update({priority: tmp});
    };

    var selectListByDelta = function(delta) {
      var lists = [$scope.currentIssues, $scope.backlogIssues, $scope.iceboxIssues];
      var index = lists.indexOf(activeIssues);
      do {
        index += delta;
        if (index < 0 || index >= lists.length) return;
      } while(lists[index].$getIndex().length === 0);

      activeIssues = lists[index];
      $scope.activeIssueId = activeIssues.$getIndex()[0];
    };

    var moveCardByDelta = function(delta) {
      var currentIndex = lists.indexOf(activeIssues);
      var newIndex = currentIndex + delta;
      if (newIndex < 0 || newIndex >= lists.length) return;

      var issue = getActiveIssue();

      activeIssues = lists[newIndex];
      var lowestPriority = 0;
      if (activeIssues.$getIndex().length) {
        lowestPriority = activeIssues.$child(activeIssues.$getIndex()[0]).$priority;
      }

      var card = activeIssues.$child(issue.id);
      card.$priority = lowestPriority;
      card.$update(issue);
      issue.$remove();
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

    hotkeys.add({
      combo: 'h',
      description: 'Move left',
      callback: function() {selectListByDelta(-1);}
    });

    hotkeys.add({
      combo: 'ctrl+h',
      description: 'Move card left',
      callback: function() {moveCardByDelta(-1);}
    });

    hotkeys.add({
      combo: 'l',
      description: 'Move right',
      callback: function() {selectListByDelta(1);}
    });

    hotkeys.add({
      combo: 'ctrl+l',
      description: 'Move card right',
      callback: function() {moveCardByDelta(1);}
    });
});
