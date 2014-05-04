'use strict';

/* Filters */

angular.module('issuesApp.filters', []).
  filter('reverse', [function() {
    return function(items) {
      return items.slice().reverse();
    };
  }]);
