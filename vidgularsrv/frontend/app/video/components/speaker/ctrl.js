(function (angular, undefined) {
    'use strict';

    angular
        .module('webcastApp.video.speaker',[])
        .directive('vgsSpeaker', VgsDirective);

    VgsDirective.$inject = ['ASSETS'];
    function VgsDirective(ASSETS, RoomService) {
        function VgsController($scope) {
            function getSpeakerThumb(){
                var speaker = $scope.speaker;
                if( typeof speaker === 'undefined' || speaker === null )
                {
                    return ASSETS.NO_AVATAR;
                }

                if( typeof speaker.picture === 'undefined' || speaker.picture === null || speaker.picture.length < 1 )
                {
                    return ASSETS.NO_AVATAR;
                }

                return speaker.picture;
            }

            var vm = this;
            vm.getSpeakerThumb = getSpeakerThumb;
        }

        return {
            restrict: 'E',
            controller: VgsController,
            controllerAs: 'vm',
            templateUrl: 'video/components/speaker/ctrl.html',
            scope: {
                'speaker':'='
            }
        };
    }

}(window.angular));