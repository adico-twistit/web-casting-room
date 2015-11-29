//
(function (angular) {
    'use strict';


    angular
        .module('webcastApp.video.questions',[])
        .directive('vgsQuestions', VgsDirective);

    VgsDirective.$inject = [];
    function VgsDirective() {
        function VgsController($scope) {
            var vm = this;

            function eqQuestionQuery(item){
                if( typeof item.visible === "undefined" || item.visible === null ) {
                    item.visible = true;
                }

                if( vm.questionQuery && vm.questionQuery.length )
                {
                  return item.text.indexOf(vm.eqQuestionQuery) > -1 && item.visible;
                }

                return item.visible;
            }
            
            function getSize(obj) {
                var size = 0, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) size++;
                }
                return size;
            };
            
            function showSearch() {
                var questions = $scope.questions();
                if( questions === {} ) {
                    return false;
                }

                return getSize(questions) > 2;
            }
            // Allows the caster to hide a question from his list only
            function casterHideQuestion(question) {
                question.visible = false;
            }
            // Allows the caster to show all questions he hidden
            function casterUnhideAllQuestions() {
                for( var item in $scope.questions() ) {
                  $scope.questions()[item].visible = true;
                };

                return false;
            }

            function userAskQuestion() {
                $scope.onAsk()(vm.questionText);
                vm.questionText = '';
            }
            function userVoteQuestion(question) {
                $scope.onVote()(question);
            }
            function userUnvoteQuestion(question) {
                $scope.onUnvote()(question);
            }
            function casterDeleteQuestion(question) {
                $scope.onDelete()(question);
            }

            var vm = this;

            vm.isCaster = $scope.isCaster();

            vm.questionsOrderProp = 'age';
            vm.questionText = '';
            vm.questions = {};
            vm.casterUnhideAllQuestions = casterUnhideAllQuestions;
            vm.casterHideQuestion = casterHideQuestion;
            vm.casterDeleteQuestion = casterDeleteQuestion;
            vm.userAskQuestion = userAskQuestion;
            vm.userVoteQuestion = userVoteQuestion;
            vm.userUnvoteQuestion = userUnvoteQuestion;
            vm.eqQuestionQuery = eqQuestionQuery;
            vm.showSearch = showSearch;
        }

        return {
            restrict: 'E',
            controller: ['$scope', VgsController ],
            controllerAs: 'vm',
            templateUrl: 'video/components/questions/ctrl.html',
            scope: {
                questions:'&',
                isCaster: '&',
                onDelete: '&',
                onAsk: '&',
                onVote: '&',
                onUnvote: '&'
            }
        };
    }

}(window.angular));