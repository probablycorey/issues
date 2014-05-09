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
          if (!_.find(issues, function(issue) {return issue.id.toString() == card.$id;})) {
            card.$update({state: 'closed'});
            closedCards.push(card);
          }
        });
      });

      // Update or create existing cards
      issues.forEach(function(issue) {
        var card = _.find(cards, function(card) {return card.$id == issue.id.toString();});
        if (!card) {
          card = laterList.$child(issue.id.toString());
          var priority = 100;
          var lowestPriorityCardId = laterList.$getIndex()[0];
          if (lowestPriorityCardId) {
            var lowestPriorityCard = laterList[lowestPriorityCardId];
            priority = lowestPriorityCard.$priority - 1;
          }

          card.$update(issue);
          card.$priority = priority;
          card.$save();
        }
        else {
          card.$update(issue);
        }
      });

      if (!activeList) setActiveList();
    };

    var setActiveList = function(list) {
      if (!list) list = _.find(lists, function(list) {return list.$getIndex().length;});
      if (!list) return;

      activeList = list;
      var card = activeCardByList[list.$id];
      var ids = list.$getIndex();
      if (!card || ids.indexOf(card.$id) == -1) {
        card = list.$child(_.last(ids));
      }

      setActiveCard(card);
    };

    var getActiveCard = function() {
      return activeCardByList[activeList.$id];
    };

    var setActiveCard = function(card) {
      activeCardByList[activeList.$id] = card;
      $scope.activeCard = card;
    };

    var selectActiveIssueByDelta = function(delta) {
      var ids = activeList.$getIndex();
      var index = ids.indexOf(getActiveCard().$id) - delta; // They are sorted in reverse order
      if (index >= ids.length || index < 0) return;

      var card = activeList.$child(ids[index]);
      setActiveCard(card);
      ScrollToElementService("issue" + card.$id);
    };

    var moveActiveIssueByDelta = function(delta) {
      var ids = activeList.$getIndex();
      var newIndex = ids.indexOf(getActiveCard().$id) - delta; // They are sorted in reverse order
      if (newIndex >= ids.length || newIndex < 0) return;

      var activeCard = getActiveCard();
      var otherCard = activeList.$child(ids[newIndex]);

      var tmp = activeList[activeCard.$id].$priority;
      activeCard.$priority = activeList[otherCard.$id].$priority;
      otherCard.$priority = tmp;
      activeCard.$save();
      otherCard.$save();
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
      setActiveList(list);
    };

    var moveCardToList = function(card, list) {
      if (activeList == list) return;
      var priority;
      var topCardId = _.last(list.$getIndex());
      if (topCardId) {
        priority = list[topCardId].$priority;
      }

      priority = (isNaN(priority)) ? 100 : priority + 1;

      var newCard = list.$child(card.$id);
      card.$getIndex().forEach(function(key) { newCard[key] = card[key]; });
      newCard.$priority = priority;
      newCard.$save();
      card.$remove();

      setActiveList(list);
      setActiveCard(newCard);
    };

    hotkeys.add({
      combo: 'j',
      description: 'Select down',
      callback: function() {selectActiveIssueByDelta(1);}
    });

    hotkeys.add({
      combo: 'ctrl+j',
      description: 'Move down',
      callback: function() {moveActiveIssueByDelta(1);}
    });

    hotkeys.add({
      combo: 'k',
      description: 'Select up',
      callback: function() {selectActiveIssueByDelta(-1);}
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

    hotkeys.add({
      combo: 'e',
      description: 'Toggle handled state',
      callback: function() {getActiveCard().$update({handled: !getActiveCard().handled});}
    });

    var lists;
    var activeList;
    var laterList;
    var activeCardByList = {};
    var loadingDefer = $q.defer();

    FirebaseService.then(function(results) {
      var firebase = results.firebase;
      var user = results.user;
      laterList = firebase.$child("later");
      lists = [firebase.$child("now"), firebase.$child("next"), laterList];

      GithubService.setToken(user.accessToken);

      $scope.lists = lists;
      $scope.user = user;
      $scope.activeCard = null;
      setActiveList();
      updateIssues(firebase.$child('repos'));
    });
});
