'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', 'issues', function($scope, issues) {
    $scope.name = 'corey';
    $scope.issues = "loading";
    issues().then(function(data) {
      console.log(data[0]);
      $scope.issues = data;
    });
  }])
  .controller('MyCtrl2', [function() {

  }]);
