(function () {
    'use strict';
 
    angular
        .module('webcastApp')
        .factory('UserService', UserService);
 
    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};
 
        service.GetAll = GetAll;
        service.GetById = GetById;
        service.GetByEmail = GetByEmail;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
 
        return service;
 
        function GetAll() {
            return $http.get('/api/users').then(
                handleSuccess, 
                handleError('Error getting all users')
            );
        }
 
        function GetById(id) {
            return $http.get('/api/users/' + id).then(handleSuccess, handleError('Error getting user by id'));
        }
 
        function GetByEmail(email) {
            return $http.get('/api/users/' + email).then(handleSuccess, handleError('Error getting user by email'));
        }
 
        function Create(user) {
            return $http.post('/auth/signup', user).then(handleSuccess, handleError('Error creating user'));
        }
 
        function Update(user) {
            return $http.put('/api/users/' + user.id, user).then(handleSuccess, handleError('Error updating user'));
        }
 
        function Delete(id) {
            return $http.delete('/api/users/' + id).then(handleSuccess, handleError('Error deleting user'));
        }
 
        // private functions
 
        function handleSuccess(res) {
            return res.data;
        }
 
        function handleError(error) {
            return function ( err ) {
                if( err && err.data && err.data.message ) {
                    error += ' ' + err.data.message;
                }
                return { success: false, message: error };
            };
        }
    }
 
})();