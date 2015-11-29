(function () {
    'use strict';

    angular
        .module('webcastApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['AccountService', 'UserService', '$rootScope'];
    function HomeController(AccountService, UserService, $rootScope) {
        var vm = this;

        vm.user = null;
        vm.allUsers = [];
        vm.deleteUser = deleteUser;

        initController();

        function initController() {
            AccountService.getProfile()
                .then(function(response) {
                  vm.user = response.data;
                })
                .catch(function(response) {
                  vm.error = response.message;
                });
            
            loadAllUsers();
        }

        function loadAllUsers() {
            UserService.GetAll()
                .then(function (users) {
                    vm.allUsers = users;
                });
        }

        function deleteUser(event,id) {
            event.preventDefault();
            UserService.Delete(id)
            .then(function () {
                loadAllUsers();
            });
        }
    }

})();