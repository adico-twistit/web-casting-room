(function() {
    'use strict';

    angular
        .module('webcastApp')
        .filter('AssocArrayGen', AssocArrayGen);

    function AssocArrayGen() {
        return function(items, callback) {
            var filtered = {};

            angular.forEach(items, function(item, key) {
                if (callback(item)) {
                    filtered[key] = item;
                }
            });

            return filtered;
        };
    };
})();
