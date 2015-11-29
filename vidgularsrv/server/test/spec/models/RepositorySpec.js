'use strict';

process.on('uncaughtException',function(e) {
    console.log("Caught unhandled exception: ");
    console.dir(e);
    if(e.stack) {
        console.log(" ---> : " + e.stack);    
    }
});

// include the helpers and get a reference to it's exports variable
var StoreHelper = require('../../helpers/DbHelper').StoreHelper;

const USERID = '575756A6587S1';
const AREA = 'room';
const USERKEY = 'room:users:';
const SOCKETID = '58765857856ZZZ';

var def_timeout2 = 9000;
var def_timeout = 10000;

var repo = require('../../../app/cast_room/dao/RedisUserDao');
var userData = {
    id: USERID,
    area: AREA,
    socketid: SOCKETID,
    email: 'a@a.a',
    raiseHand: '0',
    applause: '0',
    age: 1 
};
var CUser = require('../../../app/cast_room/models/OnlineUser');
var user = new CUser(userData, SOCKETID);
var expire = 10; //seconds

/**
* Testing Redis Repository Module
*/
describe("Server Redis Repository Testing", function() {
    var oConn = null;

    /**
    * Testing each function returns a promise
    */
    describe("included methods returns a promise", function() {

        it("returns a promise", function(done) {
            var oRepo = repo({client: {}});
            var promise = oRepo.setUser( user, expire );
            expect(promise.constructor.name).toBe("Promise");
            promise = null;
            done();
        });
    });

    /**
    * Testing setUser method
    */
    describe("setUser method testing", function() {
        var oTestContext = null,
            dateStart = new Date();

        /**
        * test setup
        */
        beforeEach(function (beforeDone) {
          oTestContext = {};
          var store = new StoreHelper();
          store.openFreshConnection(function (err, connection) {
            if(err){
                beforeDone();
            } else {
                oConn = connection;
                beforeDone();
            }
          });

          waitsFor(function () {
            return oConn;
          }, "establishing a connection to the database & flushing all.", def_timeout);
        });

        afterEach(function (afterDone) {
          waitsFor(function () {
            return true;
          }, "waiting for the assertions to be called.", def_timeout2);

          runs(function () {
            if (typeof oConn !== 'undefined' && oConn !== null) {
                oConn.quit();
                afterDone();
                return;
            } else {
                afterDone();    
            }

            
            
          });
        });

        /**
        * Test valid user inserted
        */
        it("Test: creating a valid user", function (itDone) {
          runs(function () {
            //arrange
            oTestContext.assertions = assertions;
            //spyOn(oTestContext, "assertions").andCallThrough();
            var oRepo = repo({client: oConn});
            //act (oTestContext.assertions invoked as callback)
            oRepo.setUser(user, expire).done( 
                // oRepo.setUser Success
                function success( ret ) {
                    oRepo.getConnectedUser( USERKEY + USERID ).done(
                        // oRepo.getConnectedUsers Success
                        function success( ret ) {
                            assertions(null, ret);
                            itDone();
                            return;
                        },
                        // oRepo.getConnectedUsers Fail
                        function failure( err ) {
                            assertions(err, null);
                            itDone();
                            return;
                        }
                    );
                }, 
                // oRepo.setUser Fail
                function failure( err ) {
                    assertions(err);
                    itDone();
                    return;
                }
            );

            //assert
            function assertions(err, ret) {
                /**
                * Test all user fields are persist with proper value
                */
                expect(err).toBeFalsy();
                if(err){
                    return;
                }

                var dateEnd = new Date();

                expect(ret).toBeTruthy();

                expect(ret.id).toBe(USERID);
                expect(ret.socketid).toBe(SOCKETID);
                expect(ret.email).toBe('a@a.a');
                expect(ret.raiseHand).toBe(false);
                expect(ret.applause).toBe(false);
                expect(ret.age).toBeGreaterThan(dateStart);
                expect(ret.age).toBeLessThan(dateEnd);

                /**
                * Test all user fields are persist
                */

            }
          });
        });

        /**
        * Test duplicate user inserted by id
        */

        /**
        * Test valid user inserted by email
        */

        /**
        * Test not valid user fails
        */

        /**
        * Test network fails
        */
    });
});
/*
describe("Test Database setup", function() {
    beforeEach(function() {
        this.dbSuccess = false;
        self = this;
        runs(function() {
            database.setup({setup:true}, function(err, db) {
                if (err) {
                    throw new Error(JSON.stringify(err));
                } else {
                    self.dbSuccess = true;
                }
                setFixtures(db);
            });
        });
        waitsFor(function() {
            return self.dbSuccess === true;
        }, def_timeout, "DB Setup");
    });

    afterEach(function() {
        db.destroy();
    });

    it('should increment a variable', function () {
        console.log('test');
        var foo = 0;            // set up the world
        foo++;                  // call your application code
        expect(foo).toEqual(1); // passes because foo == 1
    });
});
*/