'use strict';

// Declare app level module which depends on filters, and services
angular.module('issuesApp', [
  'cfp.hotkeys',
  'firebase',
  'ngRoute',
  'ngAnimate',
  'issuesApp.services',
  'issuesApp.filters',
  'issuesApp.controllers',
  'issuesApp.directives'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.when('/issues', {templateUrl: 'app/partials/dashboard.html', controller: 'IssuesCtrl'});
  $routeProvider.otherwise({redirectTo: '/issues'});
}]);
