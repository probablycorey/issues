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
    };

    var setActiveList = function(list) {
      if (!list) list = _.find(lists, function(list) {return list.$getIndex().length;});
      activeList = list;
      var card = activeCardsByList[list.id];
      var ids = list.$getIndex();
      if (!card || ids.indexOf(card.id) == -1) {
        card = list.$child(ids[0]);
      }

      setActiveCard(card);
    };

    var getActiveCard = function() {
      return activeCardsByList[activeList.id];
    };

    var setActiveCard = function(card) {
      activeCardsByList[activeList.id] = card;
      $scope.activeCard = card;
    };

    var selectIssueByDelta = function(delta) {
      var ids = activeList.$getIndex();
      var index = ids.indexOf(getActiveCard().id) + delta;
      if (index >= ids.length || index < 0) return;

      var card = activeList.$child(ids[index]);
      setActiveCard(card);
      ScrollToElementService("issue" + card.$id);
    };

    var moveActiveIssueByDelta = function(delta) {
      var ids = activeList.$getIndex();
      var newIndex = ids.indexOf(getActiveCard().id) + delta;
      if (newIndex >= ids.length || newIndex < 0) return;

      var activeCard = getActiveCard();
      var otherCard = activeList.$child(ids[newIndex]);
      var tmp = activeCard.$priority;
      activeCard.$update({priority: otherCard.$priority});
      otherCard.$update({priority: tmp});
    };

    var listByDelta = function(delta, excludeEmpty) {
      var index = lists.indexOf(activeList);
      do {
        index += delta;
        if (index < 0 || index >= lists.length) return activeList;
      } while(excludeEmpty && lists[index].$getIndex().length === 0);

      return lists[index];
    };

    var selectListByDelta = function(delta) {
      var list = listByDelta(delta, true);
      setActiveList(lists);
    };

    var moveCardToList = function(card, list) {
      var priority = 0;
      var topCardId = list.$getIndex()[0];
      if (topCardId) {
        priority = list.$child(topCardId).$priority;
      }

      var newCard = list.$child(card.id);
      newCard.$priority = priority;
      newCard.$update(card);
      card.$remove();
      setActiveList(list);
      setActiveCard(card);
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
      callback: function() {moveCardToList(getActiveCard(), listByDelta(-1));}
    });

    hotkeys.add({
      combo: 'l',
      description: 'Move right',
      callback: function() {selectListByDelta(1);}
    });

    hotkeys.add({
      combo: 'ctrl+l',
      description: 'Move card right',
      callback: function() {moveCardToList(getActiveCard(), listByDelta(1));}
    });

    var lists;
    var activeList;
    var activeCardsByList = {};
    var loadingDefer = $q.defer();

    FirebaseService.then(function(firebase) {
      lists = [firebase.$child("current"), firebase.$child("backlog"), firebase.$child("icebox")];

      $scope.lists = lists;
      $scope.activeCard = null;
      setActiveList();
      // updateIssues(firebase.$child('repos'));
    });
});
