'use strict';

// Declare app level module which depends on filters, and services
angular.module('issuesApp', [
  'cfp.hotkeys',
  'firebase',
  'ngRoute',
  'ngAnimate',
  'issuesApp.services',
  'issuesApp.controllers',
  'issuesApp.directives'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/issues', {templateUrl: 'app/partials/dashboard.html', controller: 'IssuesCtrl'});
  $routeProvider.otherwise({redirectTo: '/issues'});
}]);
