'use strict';

/* Controllers */

angular.module('issuesApp.controllers', [])
  .controller('IssuesCtrl', ['$scope', 'IssueService', function($scope, IssueService) {
    $scope.issues = IssueService;
  }]);

// var addIssue = function() {
//   var title = $window.prompt("Create new issue", "cool");
//   if (title) {
//     $scope.issues.$add({title: title});
//   }
// };
//
// hotkeys.add({
//   combo: 'a',
//   description: 'Add issue',
//   callback: addIssue
// });
