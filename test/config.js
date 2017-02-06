var chai = require('chai'),
    expect = chai.expect,
    Config = require('../lib/config.js'),
    linnCore = require('linn-channel-core'),
    dbAdapter = require('./dbMockAdapter');

//--debug-brk" add this to the test script to hit breakpoints

describe('config', function(){

    describe('.addNewUser(addNewUserRequest)', function() {

        it("should complain about the type", function() {

            var request = {
                a: "b"
            };
            var config = new Config(new dbAdapter());
            config.addNewUser(request).then(function(result) {
                done('should not hit here');
             }, function(error){
                expect(error).to.equal('request not of type AddNewUserRequest');
             })

        });

        it("should return a new token", function() {

            var request = new linnCore.AddNewUserRequest("provider", "", "lwguid", "email", "accountname");
            
            var config = new Config(new dbAdapter());
            return config.addNewUser(request).then(function(result) {

                if(!(result instanceof linnCore.AddNewUserResponse)){
                    return done("request not of type AddNewUserResponse");
                }

                expect(result.AuthorizationToken.length).to.equal(32);
                expect(result.Error).to.equal("");

             }, function(error){
                done('should not hit here');
             })

        });

    });

    describe('.saveUserConfig(saveUserConfigRequest)', function() {

        it("THIS IS NOT TESTED!", function() {
            expect("").to.equal('This call is not tested as I don\'t know what to expect yet');
        });
    });

});