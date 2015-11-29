describe('Webcast Controllers', function(){

    describe('WebcastCtrl', function(){
        var scope, ctrl, $httpBackend;

        // Load our app module definition before each test.
        beforeEach(module('webcastApp'));

        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        // This allows us to inject a service but then attach it to a variable
        // with the same name as the service in order to avoid a name conflict.
        beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('data/users.json').
                respond([{name: 'Adi Cohen'}, {name: 'XOOM'}]);

            $httpBackend.expectGET('data/pages.json').
                respond([{name: 'Page1'}, {name: 'Page2'}, {name: 'Page3'}]);

            $httpBackend.expectGET('data/questions.json').
                respond([{text: 'Where'}, {text: 'Who'}, {text: 'What'}]);

            scope = $rootScope.$new();
            ctrl = $controller('WebcastCtrl', {$scope: scope});
        }));

        it('should create "pages" model with 3 pages', inject(function($controller) {
            expect(scope.pages).toBeUndefined();
            $httpBackend.flush();

            expect(scope.pages).toEqual([{name: 'Page1'},
                                       {name: 'Page2'},
                                       {name: 'Page3'}]);
        }));

        it('should set the default value of usersOrderProp model', function() {
          expect(scope.usersOrderProp).toBe('age');
        });
        it('should set the default value of questionsOrderProp model', function() {
          expect(scope.questionsOrderProp).toBe('age');
        });

        it('should create "users" model with 2 users fetched from xhr', function() {
          expect(scope.connectedUsers).toBeUndefined();
          $httpBackend.flush();

          expect(scope.connectedUsers).toEqual([{name: 'Adi Cohen'},
                                       {name: 'XOOM'}]);
        });

        it('should set the default value of orderProp model', function() {
          expect(scope.usersOrderProp).toBe('age');
        });
    });
});