(function () {
    'use strict';
 
    angular
        .module('webcastApp.video',[
            'webcastApp.video.users',
            'webcastApp.video.questions',
            'webcastApp.video.roomMsg',
            'webcastApp.video.speaker'
          ])
        .constant('ASSETS', {
            NO_AVATAR: 'assets/img/no-avatar.jpg',
            IMG_MIC_SRC: 'assets/img/mic.png',
            IMG_RAISE_HAND_SRC: 'assets/img/raise_hand.png'
        })
        .controller('VideoController', VideoController);

    VideoController.$inject = ['RoomService','AccountService','$rootScope','$http', 'SocketIoService','$timeout'];
    function VideoController( RoomService, AccountService, $rootScope, $http, SocketIoService, $timeout ) {
      // TODO: Location for constants?

      // Run once initializer
      (function initController() {
        // allow CORS
        $http.defaults.useXDomain = true;
        delete $http.defaults.headers.common['X-Requested-With'];
        
        // register disconnect on browser unload
        $rootScope.$on('onBeforeUnload', function (e, confirmation) {
            console.log('disconnecting ...'); // Use 'Preserve Log' option in Console
            SocketIoService.disconnect();
        });
        $rootScope.$on('onUnload', function (e) {
            console.log('leaving page'); // Use 'Preserve Log' option in Console
        });

        // Get profile object
        AccountService.getProfile()
          .then(function(response) {

            // Init - setup vm properties for rendering, load socket io, ...

            vm.thisUser = response.data;

            // Add my profile to connected users list - to show in the GUI
            /*
            vm.connectedUsers[vm.thisUser._id] = {
                id: vm.thisUser._id,
                area: vm.area,
                socketid: '',
                email: vm.thisUser.email,
                raiseHand: false,
                applause: false,
                age: new Date().getTime()
            };
            */
            var t_user = { 
                id: vm.thisUser._id,
                email: vm.thisUser.email,
                area: vm.area 
              };

            $http.get('data/pages.json').success(function(data) {
              vm.pages = data;
            });
            SocketIoService.init( t_user, {
              roomInit: roomInit,
              userEntered: userEntered,
              userLeft: userLeft,
              userRaisedHand: userRaisedHand,
              userLoweredHand: userLoweredHand,
              userApplaused: userApplaused,
              userAskedQuestion: userAskedQuestion,
              userVotedQuestion: userVotedQuestion,
              userUnvotedQuestion: userUnvotedQuestion,
              casterGrantedPerm: casterGrantedPerm,
              casterRevokedPerm: casterRevokedPerm,
              casterUpdatedRoom: casterUpdatedRoom
            });
            
            // run additional setup API

          })
          .catch(function(response) {
            vm.error = response.data.message;
          });
      })();

      /*
          data[0] = connectedUsers
          data[1] = questions
          
          data[0] = { 
            '<userid>' : { 
              id: '<userid>',
              area: '<name of channel>',
              socketid: '<socketid>',
              email: '<email>',
              raiseHand: '<boolean>',
              applause: '<boolean>',
              age: '<integer indicating time in room>'
            }
          }
      */
      function roomInit(data) {
        if( !data || data.length === 0 ) {
          console.log('error: no connected users reported, atleast 1 expected');
          vm.connectedUsers = {};
          return;
        }

        vm.connectedUsers = data[0];
        vm.questions = data[1];
        vm.thisCNUser = vm.connectedUsers[vm.thisUser._id];
      };

      function userEntered(data) {
        if( !data || data.length === 0 ) {
          console.log('error: user Entered while user is null');
          return;
        }

        vm.connectedUsers[data.id] = data;
      };

      function userLeft(data) {
        if( !data || data.length === 0 ) {
          console.log('error: user left while user is null');
          return;
        }

        delete vm.connectedUsers[data.id];
      };

      function userRaisedHand(user){
        console.log('user:' + user.email + ' raised his hand');

        if( user.id in vm.connectedUsers )
        {
          vm.connectedUsers[user.id].raiseHand = true;
          return;
        }
      };

      function userLoweredHand(user){
        console.log('user:' + user.email + ' lowered his hand');

        if( user.id in vm.connectedUsers )
        {
          vm.connectedUsers[user.id].raiseHand = false;
          return;
        }
      };

      function userApplaused(user){
        console.log('user:' + user.email + ' applaused');

        if( user.id in vm.connectedUsers )
        {
          vm.connectedUsers[user.id].applause = true;
          return;
        }
      };

      function userAskQuestion( questionText ) {
        if( typeof questionText === 'undefined' || questionText === null || questionText.length < 1 ){
          // TODO: send back feedback to user
          console.log( 'Error: Question text empty' );
          return;
        }

        SocketIoService.sioEmit(vm.area,'userAskQuestion', {
          user: vm.thisCNUser, 
          area: vm.area,
          question: questionText
        });

        return false;
      }

      function userAskedQuestion(data){
        var user = data.user;
        var question = data.question;

        console.log('user:' + user.email + ' asked question');
        console.dir(data);
        if( vm.questions ){
          vm.questions[question.id] = question;  
        } else {
          vm.questions = {};  
          vm.questions[question.id] = question;  
        }
        
      };

      /*
        Voting
      */
      function userVoteQuestion(question) {
        SocketIoService.sioEmit(vm.area,'userVoteQuestion', {
          user: vm.thisCNUser, 
          area: vm.area,
          question: question
        });

        return false;
      }

      function userVotedQuestion(data){
        var user = data.user, 
            question = data.question;

        console.log('user:' + user.email + ' voted question');
        console.dir(question);
        console.log('question:' + question.id + ' voted:' + question.votes);

        if( question.id in vm.questions )
        {
          vm.questions[question.id] = question;
          return;
        }
      };

      function userUnvotedQuestion(user, question){
        console.log('user:' + user.email + ' unvoted question');

        if( user.id in vm.connectedUsers )
        {
          vm.connectedUsers[user.id].raiseHand = true;
          return;
        }
      };

      function userRaiseHand() {
        vm.thisCNUser.raiseHand = true;
        SocketIoService.sioEmit(vm.area,'userRaiseHand', {
          user: vm.thisCNUser, 
          area: vm.area 
        });

        return false;
      };

      function userLowerHand() {
        vm.thisCNUser.raiseHand = false;
        SocketIoService.sioEmit(vm.area,'userLowerHand', {
          user: vm.thisCNUser, 
          area: vm.area 
        });

        return false;
      };

      function userApplause() {
        // TODO: need to remove applause after X seconds - either send signal to server or server will maintain it?

        vm.thisCNUser.applause = true;
        SocketIoService.sioEmit(vm.area,'userApplause', {
          user: vm.thisCNUser, 
          area: vm.area 
        });

        return false;
      };
      
      function userUnvoteQuestion(question) {
        SocketIoService.sioEmit(vm.area,'userUnvoteQuestion', {
          user: vm.thisCNUser, 
          area: vm.area,
          question: question
        });

        return false;
      }

      function isCaster() {
        if( vm.thisUser )
        {
          return vm.thisUser.role === 'broadcaster';
        }
      };

      /*
        dbuser: the user from the mogodb with all the users info included is the speaking user
      */
      function casterGrantedPerm(dbuser){
        if( dbuser._id in vm.connectedUsers )
        {
          // the user have granted permission to speak -> remove raise hand flag
          vm.connectedUsers[dbuser._id].raiseHand = false;
          // set the user to be the current speaker
          vm.currentSpeaker = dbuser;  
        }
      }
      
      function casterGrantPerm(user) {
        SocketIoService.sioEmit(vm.area,'casterGrantPerm', {
          user: user, 
          area: vm.area
        });

        return false;
      };

      function casterRevokedPerm(user){
        vm.currentSpeaker = RoomService.room.organizer;
      }

      function casterUpdatedRoom(roomInfo){
        vm.roomInfo = roomInfo;
      }

      function casterRevokePerm(user) {
        SocketIoService.sioEmit(vm.area,'casterRevokePerm', {
          user: RoomService.room.organizer, 
          area: vm.area
        });

        return false;
      };
      // Delete or reject question
      // Allows the broadcasted to politely withdraw a question as will not be answered in this session 
      function casterDeleteQuestion(question) {
        delete vm.questions[question.id];
        SocketIoService.sioEmit(vm.area,'casterDeleteQuestion', {
          user: vm.thisCNUser, 
          area: vm.area,
          question: question
        });

        return false;
      };

      function roomMessageUpdated(roomInfo){
        SocketIoService.sioEmit(vm.area,'casterUpdateRoom', {
          user: vm.thisCNUser, 
          area: vm.area,
          room: roomInfo
        });
      }

      var vm = this;

      vm.area = RoomService.room.name;
      vm.roomInfo = RoomService.room;
      //vm.connectedUsers = {};
      //vm.questions = {};
      vm.currentSpeaker = RoomService.room.organizer;

      // functions export
      vm.isCaster = isCaster;
      vm.roomMessageUpdated = roomMessageUpdated;
      vm.userAskQuestion = userAskQuestion;

      vm.userRaiseHand = userRaiseHand;
      vm.userLowerHand = userLowerHand;
      vm.userApplause = userApplause;

      vm.userVoteQuestion = userVoteQuestion;
      vm.userUnvoteQuestion = userUnvoteQuestion;
            
      vm.casterDeleteQuestion = casterDeleteQuestion;
      vm.casterGrantPerm = casterGrantPerm;
      vm.casterRevokePerm = casterRevokePerm;

  }
})();