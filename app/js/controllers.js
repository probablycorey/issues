'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', 'issues', function($scope, issues) {
    $scope.name = 'corey';
    $scope.issues = "loading";
    issues().then(function(data) {
      $scope.issues = data;
    });
  }])
  .controller('MyCtrl2', [function() {

  }]);
