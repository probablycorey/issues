'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', ['$scope', 'IssueService', function($scope, IssueService) {
    $scope.currentIssues = IssueService("current");
    $scope.nextIssues = IssueService("next");
  }]);
