(function () {
    'use strict';

    angular
        .module('webcastApp')
        .factory('beforeUnload', beforeUnload);
        //.run(function () {
            // Must invoke the service at least once
        //});

    beforeUnload.$inject = ['$rootScope','$window'];
    function beforeUnload($rootScope, $window) {

        $window.onbeforeunload = function () {
            var confirmation = {};
            var event = $rootScope.$broadcast('onBeforeUnload', confirmation);
            if (event.defaultPrevented) {
                return confirmation.message;
            }
        };

        $window.onunload = function () {
            $rootScope.$broadcast('onUnload');
        };
        return {};
    }
}());