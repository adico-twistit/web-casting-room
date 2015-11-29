(function (angular) {
    'use strict';


    angular
        .module('webcastApp.video.users',[])
        .directive('vgsUsers', VgsDirective);

    VgsDirective.$inject = ['ASSETS','RoomService'];
    function VgsDirective(ASSETS, RoomService) {
        function VgsController($scope) {
            var vm = this;

            function eqUserQuery(item){
                if( vm.userQuery && vm.userQuery.length ) {
                    return item.email.indexOf(vm.userQuery) > -1;
                }

                return true;
            }

            function casterGrantPerm(user) {
                $scope.onGrant()(user);

                return false;
            }

            function casterRevokePerm(user) {
                $scope.onRevoke()( user );

                return false;
            }

            function isHandRaised( user ) {
                if( user.id in $scope.users() )
                {
                    return $scope.users()[user.id].raiseHand && !isGrantedSpeak( user );
                }

                return false;
            }

            function isApplause( user ) {
                if( user.id in $scope.users() )
                {
                  return $scope.users()[user.id].applause;
                }

                return false;
            }

            function showRaiseHandAsImg(user){
                if(vm.isCaster())
                {
                    return isHandRaised(user) && !isOrganizerSpeaking();
                } else {
                    return isHandRaised(user);
                }
            }
            function showRaiseHandAsBtn(user){
                return vm.isCaster() && isHandRaised(user) && isOrganizerSpeaking()
            }
            function showMuteButton(user){
                return vm.isCaster() && vm.isGrantedSpeak(user) && user.id != RoomService.room.organizer._id
            }
            function isOrganizerSpeaking(){
                return $scope.speaker._id === RoomService.room.organizer._id;
            }

            function isGrantedSpeak( user ) {
                // $scope.speaker._id is the user from MongoDB & user is the user from redis which share the same ID
                return $scope.speaker._id === user.id; 
            }
            function changeImgToMic() {
                vm.speakPermImg = ASSETS.IMG_MIC_SRC;
            }
            function changeImgToRaiseHand() {
                vm.speakPermImg = ASSETS.IMG_RAISE_HAND_SRC;
            }
            // Allows the caster to hide a user from his list only
            function casterBlockUser(user) {
                user.visible = false;
            }
            // Allows the caster to show all users he hidden
            function casterUnblockAllUser() {
                $scope.users().each( function(item) {
                  item.visible = true;
                });

                return false;
            }

            var vm = this;
            
            // using $parent isCaster function passed from outside attribute
            vm.isCaster = $scope.isCaster();
            
            vm.usersOrderProp = 'age';
            vm.speakPermImg = ASSETS.IMG_RAISE_HAND_SRC;
            vm.connectedUsersNum = $scope.users() && $scope.users().length ? $scope.users().length : 0;
            vm.eqUserQuery = eqUserQuery;
            // functions export
            vm.isHandRaised = isHandRaised;
            vm.isApplause = isApplause;
            vm.isGrantedSpeak = isGrantedSpeak;
            vm.changeImgToMic = changeImgToMic;
            vm.changeImgToRaiseHand = changeImgToRaiseHand;
            vm.casterUnblockAllUser = casterUnblockAllUser;
            vm.casterBlockUser = casterBlockUser;
            vm.casterRevokePerm = casterRevokePerm;
            vm.casterGrantPerm = casterGrantPerm;
            vm.showRaiseHandAsImg = showRaiseHandAsImg;
            vm.showRaiseHandAsBtn = showRaiseHandAsBtn;
            vm.showMuteButton = showMuteButton;
            

        }

        return {
            restrict: 'E',
            controller: ['$scope', VgsController ],
            controllerAs: 'vm',
            templateUrl: 'video/components/users/ctrl.html',
            scope: {
                users:'&',
                me: '&',
                isCaster: '&',
                speaker: '=',
                onGrant: '&',
                onRevoke: '&'
            }
        };
    }

}(window.angular));