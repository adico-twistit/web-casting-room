(function () {
    'use strict';
 
    angular
        .module('webcastApp')
        .controller('LogoutController', LogoutController);
 
    LogoutController.$inject = ['$location', '$auth'];
    function LogoutController($location, $auth) {
        //if (!$auth.isAuthenticated()) { return; }
        $auth.logout()
          .then(function() {
            $location.path('/');
          });
    }
 
})();