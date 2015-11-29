(function () {
    'use strict';
 
    angular
        .module('webcastApp')
        .controller('RegisterController', RegisterController);
 
    RegisterController.$inject = ['UserService', '$location'];
    function RegisterController(UserService, $location) {
        var vm = this;
 
        vm.register = register;
 
        function register() {
            vm.dataLoading = true;
            UserService.Create(vm.user)
                .then(function (response) {
                    if (response.success) {
                        vm.error = 'Registration successful';
                        $location.path('/login');
                    } else {
                        vm.error = response.message;
                        vm.dataLoading = false;
                    }
                });
        };
    }
 
})();