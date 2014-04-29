'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  'myApp.services',
  'myApp.controllers',
  'cfp.hotkeys',
  'firebase'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/issues', {templateUrl: 'app/partials/priorities.html', controller: 'IssuesCtrl'});
  $routeProvider.otherwise({redirectTo: '/issues'});
}]);
