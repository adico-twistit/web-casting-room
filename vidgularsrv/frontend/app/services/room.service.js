(function () {
    'use strict';
 
    angular
        .module('webcastApp')
        .factory('RoomService', RoomService);
 
    //RoomService.$inject = ['$http'];
    function RoomService() {
        var service = {};
 
        service.room = {
            name: 'room',
            title: 'Wow fundementals',
            message: 'Hola!\nLorem ipsum dolor sit amet, consectetur adipisicing elit. Est saepe, numquam odio alias quae id assumenda fugiat esse adipisci minus quibusdam molestiae expedita commodi quaerat natus, quo eos pariatur quam!',
            organizer: {
                _id: '5643270e69f97f482424b2cf',
                email: { type: String, unique: true, lowercase: true },
                password: { type: String, select: false },
                username: 'tinysnake748',
                firstName: 'marion',
                lastName: 'andre',
                picture: 'https://randomuser.me/api/portraits/thumb/women/18.jpg',
                role: 'broadcaster',
                bio: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint, aliquid. Doloribus quaerat expedita impedit, et soluta? Distinctio, et nihil quis, placeat voluptas ea reiciendis ad temporibus harum porro fuga tempore?'
            }
        };
        service.GetById = GetById;
        service.Create = Create;
        service.Update = Update;
        service.Delete = Delete;
 
        return service;
 
        function GetAll() {
            return $http.get('/api/rooms').then(
                handleSuccess, 
                handleError('Error getting all rooms')
            );
        }
 
        function GetById(id) {
            return $http.get('/api/rooms/' + id).then(handleSuccess, handleError('Error getting room by id'));
        }
 
        function Create(user) {
            return $http.post('/api/rooms', user).then(handleSuccess, handleError('Error creating room'));
        }
 
        function Update(user) {
            return $http.put('/api/rooms/' + user.id, user).then(handleSuccess, handleError('Error updating room'));
        }
 
        function Delete(id) {
            return $http.delete('/api/rooms/' + id).then(handleSuccess, handleError('Error deleting room'));
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