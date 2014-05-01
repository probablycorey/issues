'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', function($scope, $window, $q, $firebase, GithubService, IssueService, ScrollToElementService, hotkeys) {
    $scope.activeIssueId = null;
    $scope.currentIssues = IssueService("current");
    $scope.iceboxIssues = IssueService("icebox");
    $scope.backlogIssues = IssueService("backlog");
    $scope.githubIssues = null;

    var activeIssues = $scope.currentIssues;

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
      activeIssues = $scope.iceboxIssues;
      $scope.activeIssueId = activeIssues.$getIndex()[0];

      $scope.githubIssues.forEach(function(issue) {
        var card = $scope.currentIssues[issue.id] || $scope.backlogIssues[issue.id] || $scope.iceboxIssues[issue.id];
        if (!card) {
          card = $scope.iceboxIssues.$child(issue.id);
          card.$update(issue);
        }
        else {
          angular.forEach(issue, function(value, key) {card[key] = value;});
        }
      });

      $scope.currentIssues.$save();
      $scope.backlogIssues.$save();
      $scope.iceboxIssues.$save();
    });

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
      var activeIssueIndex = activeIssues.$getIndex().indexOf($scope.activeIssueId);
      if (activeIssueIndex + delta < 0 || activeIssueIndex + delta >= activeIssues.$getIndex().length) return;

      var issue = getActiveIssue();
      var otherIssueId = activeIssues.$getIndex()[activeIssueIndex + delta];
      var otherIssue = activeIssues[otherIssueId];
      var tmp = issue.$priority;
      issue.$priority = otherIssue.$priority - 1;
      otherIssue.$priority = tmp;

      activeIssues.$save();
    };

    var switchIssueList = function(delta) {
      var lists = [$scope.currentIssues, $scope.backlogIssues, $scope.iceboxIssues];
      var index = lists.indexOf(activeIssues);
      index += delta;
      if (index < 0 || index >= lists.length) return;

      activeIssues = lists[index];
      $scope.activeIssueId = activeIssues.$getIndex()[0];
    };

    var moveCard = function(delta) {
      var lists = [$scope.currentIssues, $scope.backlogIssues, $scope.iceboxIssues];
      var currentIndex = lists.indexOf(activeIssues);
      var newIndex = currentIndex + delta;
      if (newIndex < 0 || newIndex >= lists.length) return;

      var issue = getActiveIssue();
      activeIssues.$remove($scope.activeIssueId);

      activeIssues = lists[newIndex];
      var topCard = activeIssues[activeIssues.$getIndex()[0]];
      var lowestPriority = topCard ? topCard.$priority : 0;
      var card = activeIssues.$child(issue.id);
      angular.extend(card, issue);
      card.$priority = lowestPriority;
      card.$save();
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
      callback: function() {switchIssueList(-1);}
    });

    hotkeys.add({
      combo: 'ctrl+h',
      description: 'Move card left',
      callback: function() {moveCard(-1);}
    });

    hotkeys.add({
      combo: 'l',
      description: 'Move right',
      callback: function() {switchIssueList(1);}
    });

    hotkeys.add({
      combo: 'ctrl+l',
      description: 'Move card right',
      callback: function() {moveCard(1);}
    });
});
