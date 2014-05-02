'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', function($scope, $window, $q, _, FirebaseService, GithubService, ScrollToElementService, hotkeys) {
    var updateIssues = function (repos, keys) {
      keys = keys ? keys : repos.$getIndex();
      if (keys.length === 0) return;

      var repo = repos.$child(keys.pop());
      var elapsedMinutes = (Date.now() - repo.lastUpdated) / 1000 / 60;

      if (elapsedMinutes > 10) {
        repo.$update({lastUpdated: Date.now()});
        GithubService.issuesForRepo(repo.name).then(function(issues) {
            refreshIssues(issues, repo.name);
            updateIssues(repos, keys);
        });
      }
      else {
        updateIssues(repos, keys);
      }
    };

    var repoNameFromUrl = function(url) {
      return url.match(/repos\/(.*?)\/issues\/\d+/)[1];
    };

    var refreshIssues = function(issues, repoName) {
      // Get all existing cards for repo
      var cards = [];
      var closedCards = [];
      lists.forEach(function(list) {
        list.$getIndex().forEach(function(id) {
          var card = list.$child(id);
          if (repoNameFromUrl(card.url) == repoName) cards.push(card);
          if (!_.find(issues, function(issue) {return issue.id == card.id;})) {
            closedCards.push(card);
          }
        });
      });

      // Update or create existing cards
      issues.forEach(function(issue) {
        var card = _.find(cards, function(card) {return card.id == issue.id;});
        if (!card) card = $scope.iceboxIssues.$child(issue.id);
        card.$update(issue);
      });

      console.log("Closed cards", closedCards);

      if (!$scope.activeIssueId) setActiveIssues();
    };

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

    var lists;
    var loadingDefer = $q.defer();
    var repos;
    var activeIssues;

    FirebaseService.then(function(firebase) {
      $scope.currentIssues = firebase.$child("current");
      $scope.iceboxIssues = firebase.$child("icebox");
      $scope.backlogIssues = firebase.$child("backlog");
      lists = [$scope.currentIssues, $scope.backlogIssues, $scope.iceboxIssues];

      setActiveIssues();
      updateIssues(firebase.$child('repos'));
    });

});
