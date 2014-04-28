'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.services',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/issues', {templateUrl: 'partials/issues.html', controller: 'IssuesCtrl'});
  $routeProvider.otherwise({redirectTo: '/issues'});
}]);
