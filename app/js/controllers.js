'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('IssuesCtrl', ['$scope', '$anchorScroll', '$location', '$document', '$window', 'github', 'hotkeys', function($scope, $anchorScroll, $location, $document, $window, github, hotkeys) {
    $scope.activeIssueIndex = 0;
    $scope.issues = "loading";
    $scope.assigneeImageUrl = function(assignee) {
      return assignee ? assignee.avatar_url : "https://github.global.ssl.fastly.net/images/modules/logos_page/GitHub-Mark.png";
    };
    $scope.assigneeUrl = function(assignee) {
      return assignee ? assignee.html_url : "#";
    };

    github.issues().then(function(issues) {
      $scope.issues = issues;
    });

    var getActiveIssue = function() {
      return $scope.issues[$scope.activeIssueIndex];
    };

    var isElementInViewport = function(element) {
      var rect = element.getBoundingClientRect();
      return rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= $window.innerHeight &&
        rect.right <= $window.innerWidth;
    };

    var scrollToIssue = function(issue) {
      var element = $document[0].getElementById("issue-" + issue.id);
      if (!isElementInViewport(element)) element.scrollIntoView();
    };

    var selectNextIssue = function() {
      $scope.activeIssueIndex++;
      $scope.activeIssueIndex = $scope.activeIssueIndex % $scope.issues.length;
      scrollToIssue(getActiveIssue());
    };

    var selectPreviousIssue = function() {
      $scope.activeIssueIndex--;
      if ($scope.activeIssueIndex < 0) $scope.activeIssueIndex = $scope.issues.length - 1;
      scrollToIssue(getActiveIssue());
    };

    var moveActiveIssueByDelta = function(delta) {
      var previousIndex = $scope.activeIssueIndex;
      $scope.activeIssueIndex += delta;
      if ($scope.activeIssueIndex < 0) {
        $scope.activeIssueIndex = $scope.issues.length - 1;
      }
      else if ($scope.activeIssueIndex >= $scope.issues.length) {
        $scope.activeIssueIndex = 0;
      }

      $scope.issues.splice($scope.activeIssueIndex, 0, $scope.issues.splice(previousIndex, 1)[0]);
      scrollToIssue(getActiveIssue());
    };

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
