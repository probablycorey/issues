'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.services',
  'myApp.controllers',
  'cfp.hotkeys'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider.when('/issues', {templateUrl: 'app/partials/issues.html', controller: 'IssuesCtrl'});
  $routeProvider.otherwise({redirectTo: '/issues'});

}]);
