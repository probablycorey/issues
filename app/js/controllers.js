'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', ['$scope', '$document', '$window', 'IssueService', 'GithubService', 'hotkeys', function($scope, $document, $window, IssueService, GithubService, hotkeys) {
    $scope.activeIssueIndex = 0;
    $scope.issues = IssueService;

    var getActiveIssue = function() {
      var id = $scope.issues.$getIndex()[$scope.activeIssueIndex];
      return $scope.issues[id];
    };

    var isElementInViewport = function(element) {
      var rect = element.getBoundingClientRect();
      return rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $window.innerHeight &&
        rect.right <= $window.innerWidth;
    };

    var scrollToIssue = function(issue) {
      var element = $document[0].getElementById("issue" + issue.$id);
      if (!isElementInViewport(element)) element.scrollIntoView();
    };

    var selectNextIssue = function() {
      $scope.activeIssueIndex++;
      $scope.activeIssueIndex = $scope.activeIssueIndex % $scope.issues.$getIndex().length;
      scrollToIssue(getActiveIssue());
    };

    var selectPreviousIssue = function() {
      $scope.activeIssueIndex--;
      if ($scope.activeIssueIndex < 0) $scope.activeIssueIndex = $scope.issues.$getIndex().length - 1;
      scrollToIssue(getActiveIssue());
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

    var addIssue = function() {
      var title = $window.prompt("Create new issue", "cool");
      if (title) {
        $scope.issues.$add({title: title});
      }
    };

    hotkeys.add({
      combo: 'a',
      description: 'Add issue',
      callback: addIssue
    });

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
  }]);
