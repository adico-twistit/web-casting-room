//
(function (angular) {
    'use strict';

    
    angular
        .module('webcastApp.video.panel',[])
        .directive('vgsRoomMessage', RoomMessageDirective);
    
    RoomMessageDirective.$inject = ['RoomService'];
    function RoomMessageDirective(RoomService) {
        function RoomMessageController($scope) {
            var vm = this,
                oldTitle = '',
                oldMessage = '';

            function casterEditRoom() {
                vm.roomInEditMode = true;
                oldMessage = vm.room.message;
                oldTitle = vm.room.title;

                return false;
            }
            function casterCancelEditRoom() {
                vm.room.message = oldMessage;
                vm.room.title = oldTitle;
                vm.roomInEditMode = false;

                return false;
            }
            function casterUpdateRoom( func ) {
                vm.roomInEditMode = false;
                func( vm.room );
                //$scope.$emit('onUpdate', {data: vm.room});

                return false;
            }

            vm.room = RoomService.room;
            vm.roomInEditMode = false;
            vm.casterEditRoom = casterEditRoom;
            vm.casterCancelEditRoom = casterCancelEditRoom;
            vm.casterUpdateRoom = casterUpdateRoom;

            return vm;
        }

        return {
            restrict: 'E',
            controller: ['$scope', RoomMessageController ],
            controllerAs: 'vm',
            templateUrl: 'video/components/roommsg/ctrl.html',
            scope: {
                onUpdate: '&'
            }
        };
    }

}(window.angular));