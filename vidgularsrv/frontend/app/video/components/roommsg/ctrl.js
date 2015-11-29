//
(function (angular) {
    'use strict';

    
    angular
        .module('webcastApp.video.roomMsg',[])
        .directive('vgsRoomMessage', RoomMessageDirective);
    
    RoomMessageDirective.$inject = [];
    function RoomMessageDirective() {
        function RoomMessageController($scope) {
            var vm = this,
                oldTitle = '',
                oldMessage = '';

            vm.roomInfo = $scope.roomInfo;

            function casterEditRoom() {
                vm.roomInEditMode = true;
                oldMessage = vm.roomInfo.message;
                oldTitle = vm.roomInfo.title;

                return false;
            }
            function casterCancelEditRoom() {
                vm.roomInfo.message = oldMessage;
                vm.roomInfo.title = oldTitle;
                vm.roomInEditMode = false;

                return false;
            }
            function casterUpdateRoom() {
                vm.roomInEditMode = false;
                // notify $parent on update
                $scope.onUpdate()( vm.roomInfo );

                return false;
            }
            
            // using $parent isCaster function passed from outside attribute
            vm.isCaster = $scope.isCaster();
            vm.roomInEditMode = false;
            vm.casterEditRoom = casterEditRoom;
            vm.casterCancelEditRoom = casterCancelEditRoom;
            vm.casterUpdateRoom = casterUpdateRoom;
        }

        return {
            restrict: 'E',
            controller: ['$scope', RoomMessageController ],
            controllerAs: 'vm',
            templateUrl: 'video/components/roommsg/ctrl.html',
            scope: {
                onUpdate: '&',
                isCaster: '&',
                roomInfo: '='
            }
        };
    }

}(window.angular));