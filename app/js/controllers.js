'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', 'issues', function($scope, issues) {
    $scope.name = 'corey';
    $scope.issues = "loading";
    $scope.assigneeImageUrl = function(assignee) {
      return assignee ? assignee.avatar_url : "https://github.global.ssl.fastly.net/images/modules/logos_page/GitHub-Mark.png";
    };
    $scope.assigneeUrl = function(assignee) {
      return assignee ? assignee.html_url : "#";
    };

    issues().then(function(data) {
      console.log(data[0]);
      $scope.issues = data;
    });
  }])
  .controller('MyCtrl2', [function() {

  }]);
