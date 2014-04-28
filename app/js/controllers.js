'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('IssuesCtrl', ['$scope', 'Issues', function($scope, Issues) {
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

  }]);
