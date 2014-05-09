'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', function($scope, $window, $q, _, FirebaseService, GithubService, ScrollToElementService, hotkeys) {
    var updateRepos = function() {
      firebase['repos'] = firebase['repos'] ? firebase['repos'] : [];
      var existingRepos = firebase['repos'];
      return GithubService.reposForOrg('atom').then(function(repos) {
        repos.forEach(function(repo) {
          var nameWithOrg = "atom/" + repo.name;
          var exists = _.find(existingRepos, function(object) {return object.nameWithOrg == nameWithOrg;});
          if (!exists) {
            existingRepos.push({nameWithOrg:nameWithOrg, lastUpdatedAt:0});
          }
        });
        return firebase.$save().then(function() {return existingRepos;});
      });
    };

    var updateIssues = function (repos) {
      if (repos.length === 0) return;

      var repo = repos[0];
      repos = repos.slice(1);

      var elapsedMinutes = (Date.now() - repo.lastUpdatedAt) / 1000 / 60;

      if (elapsedMinutes > 10) {
        repo.lastUpdatedAt = Date.now();
        firebase.$save();
        $scope.status = "Updating " + repo.nameWithOrg;
        GithubService.issuesForRepo(repo.nameWithOrg).then(function(issues) {
            refreshIssues(issues, repo.nameWithOrg);
            updateIssues(repos);
        });
      }
      else {
        $scope.status = repo.nameWithOrg + " doesn't need updating.";
        updateIssues(repos);
      }
    };

    var nameWithOrgFromUrl = function(url) {
      return url.match(/repos\/(.*?)\/issues\/\d+/)[1];
    };

    var refreshIssues = function(issues, nameWithOrg) {
      // Get all existing cards for repo
      var cards = [];
      var closedCards = [];
      lists.forEach(function(list) {
        list.$getIndex().forEach(function(id) {
          var card = list.$child(id);
          if (nameWithOrgFromUrl(card.url) == nameWithOrg) cards.push(card);
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
      callback: function() {
        if (getActiveCard().assignee.login != $scope.user.username) return;

        if (getActiveCard().handled) getActiveCard().$update({handled: $scope.user.username});
        else getActiveCard().$update({handled: null});
      }
    });

    hotkeys.add({
      combo: 'o',
      description: 'Open issue',
      callback: function() {$window.open(getActiveCard().html_url, "_blank");}
    });

    var lists;
    var activeList;
    var laterList;
    var firebase;
    var activeCardByList = {};
    var loadingDefer = $q.defer();

    FirebaseService.then(function(results) {
      var user = results.user;
      firebase = results.firebase;
      laterList = firebase.$child("later");
      lists = [firebase.$child("now"), firebase.$child("next"), laterList];

      GithubService.setToken(user.accessToken);

      $scope.lists = lists;
      $scope.user = user;
      $scope.activeCard = null;
      setActiveList();

      $scope.status = "Checking for new repos";
      updateRepos().then(function(repos) {
        updateIssues(repos);
      });
    });
});
