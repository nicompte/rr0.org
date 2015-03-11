angular.module('rr0.nav')
  .service('searchService', ['$rootScope', '$http', function ($rootScope, $http) {
    "use strict";
    return {
      search: function (toSearch) {
        $http.get("https://www.googleapis.com/customsearch/v1?key=AIzaSyCBM8ZUsYyJNdwKTKxoARTr673_8IaWKSo&cx=014557949845581334805:gdnqsazbu8i&q=" + toSearch)
          .success(function (data, status, headers, config) {
            $rootScope.$emit('searchResult', data);
          });
      }
    };
  }]);