var chai = require('chai'),
    expect = chai.expect,
    config = require('../lib/config.js'),
    linnCore = require('linn-channel-core');

//--debug-brk" add this to the test script to hit breakpoints

describe('config', function(){

    describe('.addNewUser(addNewUserRequest)', function() {

        it("should complain about the type", function() {

            var request = {
                a: "b"
            };
            
            config.addNewUser(request).then(function(result) {
                done('should not hit here');
             }, function(error){
                expect(error).to.equal('request not of type AddNewUserRequest');
             })

        });

        it("should return a new token", function() {

            var request = new linnCore.AddNewUserRequest("provider", "", "lwguid", "email", "accountname");
            
            return config.addNewUser(request).then(function(result) {

                if(!(result instanceof linnCore.AddNewUserResponse)){
                    return done("request not of type AddNewUserRequest");
                }

                expect(result.AuthorisationToken).to.equal("some token");

             }, function(error){
                done('should not hit here');
             })

        });

    })
});