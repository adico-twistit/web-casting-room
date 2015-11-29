(function () {
    'use strict';
 
    angular
        .module('webcastApp')
        .controller('LoginController', LoginController);
 
    LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService'];
    function LoginController($location, AuthenticationService, FlashService) {
        var vm = this;
 
        vm.login = login;
        vm.authenticate = authenticate;

        (function initController() {
            // reset login status
            AuthenticationService.ClearCredentials();
        })();
 
        function login() {
            vm.dataLoading = true;
            AuthenticationService.Login(vm.email, vm.password)
                .then( function (response) {
                    if (response.success) {
                        AuthenticationService.SetCredentials(vm.email, vm.password);
                        $location.path('/');
                    } else {
                        vm.error = response.message;
                        vm.dataLoading = false;
                    }
                });
        };

        function authenticate(provider) {
            vm.dataLoading = true;
            AuthenticationService.Authenticate(provider)
                .then( function( response ) {
                    AuthenticationService.SetCredentialsFromToken();
                    $location.path('/');
                })
                .catch(function(response) {
                    vm.error = response.data.message;
                    vm.dataLoading = false;
                });            
        };
    }
 
})();