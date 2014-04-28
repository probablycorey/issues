'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('IssuesCtrl', ['$scope', '$anchorScroll', 'Issues', 'hotkeys', function($scope, $anchorScroll, Issues, hotkeys) {
    $scope.activeIssueIndex = 0;
    $scope.issues = "loading";
    $scope.assigneeImageUrl = function(assignee) {
      return assignee ? assignee.avatar_url : "https://github.global.ssl.fastly.net/images/modules/logos_page/GitHub-Mark.png";
    };
    $scope.assigneeUrl = function(assignee) {
      return assignee ? assignee.html_url : "#";
    };

    Issues().then(function(issues) {
      $scope.issues = issues;
    });

    var selectNextIssue = function() {
      $scope.activeIssueIndex++;
    };

    var selectPreviousIssue = function() {
      $scope.activeIssueIndex--;
      if ($scope.activeIssueIndex < 0) $scope.activeIssueIndex = $scope.issues.length - 1;
      $anchorScroll();
    };

    hotkeys.add({
      combo: 'j',
      description: 'Select down',
      callback: selectNextIssue
    });

    hotkeys.add({
      combo: 'k',
      description: 'Select up',
      callback: selectPreviousIssue
    });

  }]);
