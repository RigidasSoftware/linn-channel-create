var chai = require('chai'),
    expect = chai.expect,
    Config = require('../lib/config.js'),
    api = require('../lib/api'),
    linnCore = require('linn-channel-core'),
    dbAdapter = require('./dbMockAdapter'),
    mock = require('./mock')

//--debug-brk" add this to the test script to hit breakpoints

function validateCredentialsItem(config){
    expect(config.ConfigItems.length).to.equal(1);
    var apiCredentials = config.ConfigItems[0];
    expect(apiCredentials.ConfigItemId).to.equal("APIKey");
    expect(apiCredentials.Name).to.equal("API Key");
    expect(apiCredentials.Description).to.equal("The key used to access your Create.net account");
    expect(apiCredentials.GroupName).to.equal("Account");
    expect(apiCredentials.SortOrder).to.equal(1);
    expect(apiCredentials.SelectedValue).to.equal("1234");
    expect(apiCredentials.MustBeSpecified).to.equal(true);
    expect(apiCredentials.ReadOnly).to.equal(false);
}

describe('config', function(){

    describe('.addNewUser(addNewUserRequest)', function() {

        it("should complain about the type", function() {

            var request = {
                a: "b"
            };
            var config = new Config(new dbAdapter());
            config.addNewUser(request).then(function(result) {
                throw 'should not hit here';
             }, function(error){
                expect(error).to.equal('request not of type AddNewUserRequest');
             })

        });

        it("should return a new token", function() {

            var request = new linnCore.AddNewUserRequest("provider", "", "lwguid", "email", "accountname");
            
            var config = new Config(new dbAdapter());
            return config.addNewUser(request).then(function(result) {

                expect(result).to.be.an.instanceof(linnCore.AddNewUserResponse);

                expect(result.AuthorizationToken.length).to.equal(32);
                expect(result.Error).to.equal("");

             },
             function(error){
                throw 'should not hit here';
             })

        });

        it("should handle error", function() {

            var request = new linnCore.AddNewUserRequest("provider", "lwguid", "email", "error");
            
            var config = new Config(new dbAdapter());
            return config.addNewUser(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.AddNewUserResponse);
                expect(error.Error).to.equal('it broke');
            })

        });

    });

    describe('.getUserConfig(addNewUserRequest)', function() {

        it("should handle user that doesn't exist", function() {

            var request = new linnCore.BaseRequest('create', 'no user');

            var config = new Config(new dbAdapter());

            return config.getUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(error.Error).to.equal('User not found');
            })
        });


        it("should return AddCredentials step", function() {

            var request = new linnCore.BaseRequest('create', 'add credentials');

            var config = new Config(new dbAdapter());

            return config.getUserConfig(request).then(function(result) {
                expect(result).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(result.StepName).to.equal('AddCredentials');
                expect(result.WizardStepTitle).to.equal('Add Credentials');
                expect(result.WizardStepDescription).to.equal('Setup your Create.net integration');

                validateCredentialsItem(result);
            }, 
            function(error){
                throw error;
            })
        });

        it("should return UserConfig step", function() {

            var request = new linnCore.BaseRequest('create', 'user config');

            var config = new Config(new dbAdapter());

            return config.getUserConfig(request).then(function(result) {
                expect(result).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(result.StepName).to.equal('UserConfig');
                expect(result.WizardStepTitle).to.equal('UserConfig');
                expect(result.WizardStepDescription).to.equal('User Config');

                validateCredentialsItem(result);
            }, 
            function(error){
                throw error;
            })
        });

        it("should report invalid step", function() {

            var request = new linnCore.BaseRequest('create', 'bad step');

            var config = new Config(new dbAdapter());

            return config.getUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                
                expect(error.Error).to.equal('User config is at an invalid stage');
            })
        });

        it("should handle handled error", function() {

            var request = new linnCore.BaseRequest('create', '');

            var config = new Config(new dbAdapter());

            return config.getUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                
                expect(error.Error).to.equal('unknown test');
            })
        });

        it("should handle unhandled error", function() {

            var request = new linnCore.BaseRequest('create', 'throw');

            var config = new Config(new dbAdapter());

            return config.getUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                
                expect(error.Error).to.equal('it broke');
            })
        });
    });

    describe('.saveUserConfig(saveUserConfigRequest)', function() {

        it("should complain about the type", function() {

            var request = {
                a: "b"
            };
            var config = new Config(new dbAdapter());
            return config.saveUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, function(error){
                expect(error.Error).to.equal('request not of type SaveUserConfigRequest');
            })

        });

        it("should handle user that doesn't exist", function() {

            var request = new linnCore.SaveUserConfigRequest('create', 'no user', 'step', [
                new linnCore.SimpleConfigItem('APIKey', '1234')
            ]);

            var config = new Config(new dbAdapter());

            return config.saveUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(error.Error).to.equal('User not found');
            })
        });

        it("should handle invalid step", function() {

            var request = new linnCore.SaveUserConfigRequest('create', 'add credentials', 'UserConfig', [
                new linnCore.SimpleConfigItem('APIKey', '1234')
            ]);

            var config = new Config(new dbAdapter());

            return config.saveUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(error.Error).to.equal('Invalid step name. Expected AddCredentials');
            })
        });

        it("should handle missing API Key", function() {

            var request = new linnCore.SaveUserConfigRequest('create', 'user config', 'UserConfig', []);

            var config = new Config(new dbAdapter());

            return config.saveUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(error.Error).to.equal('Expecting APIKey');
            })
        });

        it("should handle AddCredentials", function() {

            var request = new linnCore.SaveUserConfigRequest('create', 'add credentials', 'AddCredentials', [
                new linnCore.SimpleConfigItem('APIKey', '1234')
            ]);

            var config = new Config(new dbAdapter());

            return config.saveUserConfig(request).then(function(result) {
                expect(result).to.be.an.instanceof(linnCore.UserConfigResponse);
                
                expect(result.StepName).to.equal('UserConfig');
                expect(result.WizardStepTitle).to.equal('UserConfig');
                expect(result.WizardStepDescription).to.equal('User Config');

                validateCredentialsItem(result);
            }, 
            function(error){
                throw 'should not hit here';
            })
        });

        it("should handle handled error", function() {

            var request = new linnCore.SaveUserConfigRequest('create', '', 'AddCredentials', [
                new linnCore.SimpleConfigItem('APIKey', '1234')
            ]);

            var config = new Config(new dbAdapter());

            return config.saveUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(error.Error).to.equal('unknown test');
            })
        });

        it("should handle unhandled error", function() {

            var request = new linnCore.SaveUserConfigRequest('create', 'throw', 'AddCredentials', [
                new linnCore.SimpleConfigItem('APIKey', '1234')
            ]);

            var config = new Config(new dbAdapter());

            return config.saveUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.UserConfigResponse);
                expect(error.Error).to.equal('it broke');
            })
        });
    });

    describe('.deleteUserConfig(request)', function() {

        it("should handle user that doesn't exist", function() {

            var request = new linnCore.BaseRequest('create', 'no user');

            var config = new Config(new dbAdapter());

            return config.deleteUserConfig(request).then(function(result) {
                expect(result).to.be.an.instanceof(linnCore.BaseResponse);
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.BaseResponse);
                expect(error.Error).to.equal('User not found');
            })
        });

         it("should delete config", function() {

            var request = new linnCore.BaseRequest('create', 'add credentials');

            var config = new Config(new dbAdapter());

            return config.deleteUserConfig(request).then(function(result) {
                expect(result).to.be.an.instanceof(linnCore.BaseResponse);
                expect(result.Error).to.equal('');
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.BaseResponse);
                throw 'should not hit here';
            })
        });

        it("should handle handled error", function() {

            var request = new linnCore.BaseRequest('create', '');

            var config = new Config(new dbAdapter());

            return config.deleteUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.BaseResponse);
                expect(error.Error).to.equal('unknown test');
            })
        });

        it("should handle unhandled error", function() {

             var request = new linnCore.BaseRequest('create', 'throw');

            var config = new Config(new dbAdapter());

            return config.deleteUserConfig(request).then(function(result) {
                throw 'should not hit here';
            }, 
            function(error){
                expect(error).to.be.an.instanceof(linnCore.BaseResponse);
                expect(error.Error).to.equal('it broke');
            })
        });
    });

    describe('.testConfig(request)', function() {

         it("should succeed", function() {

             var config = new Config(new dbAdapter(), api.mock(new mock.success()));
             var request = new linnCore.BaseRequest('create', "user config");
             
             return config.testConfig(request).then(function(result) {
                  expect(result).to.be.an.instanceof(linnCore.BaseResponse);
             });
         });

         it("should error on test", function() {

             var config = new Config(new dbAdapter(), api.mock(new mock.error()));
             var request = new linnCore.BaseRequest('create', "user config");
             
             return config.testConfig(request).then(function(result) {
                  throw 'Should not hit here';
             }, 
             function(error){
                expect(error).to.be.an.instanceof(linnCore.BaseResponse);
                expect(error.Error.message).to.equal('it broke');
             });
         });

         it("should fail on test", function() {

             var config = new Config(new dbAdapter(), api.mock(new mock.notsuccessful()));
             var request = new linnCore.BaseRequest('create', "user config");
             
             return config.testConfig(request).then(function(result) {
                  throw 'Should not hit here';
             }, function(error){
                    expect(error).to.be.an.instanceof(linnCore.BaseResponse);
             });
         });
    });

    describe('.getShippingTags(request)', function() {

         it("should succeed", function() {

             var config = new Config(new dbAdapter(), api.mock(new mock.success()));
             var request = new linnCore.BaseRequest('create', "user config");
             
             return config.getShippingTags(request).then(function(result) {
                  expect(result).to.be.an.instanceof(linnCore.ShippingTagResponse);

                  expect(result.ShippingTags.length).to.equal(4);

                  var tag1 = result.ShippingTags[0];
                  expect(tag1.Tag).to.equal("Click & Collect");
                  expect(tag1.FriendlyName).to.equal("Click & Collect");

                  var tag2 = result.ShippingTags[1];
                  expect(tag2.Tag).to.equal("2nd Class Delivery");
                  expect(tag2.FriendlyName).to.equal("2nd Class Delivery");

                  var tag3 = result.ShippingTags[2];
                  expect(tag3.Tag).to.equal("1st Class Delivery");
                  expect(tag3.FriendlyName).to.equal("1st Class Delivery");

                  var tag4 = result.ShippingTags[3];
                  expect(tag4.Tag).to.equal("International Standard Delivery");
                  expect(tag4.FriendlyName).to.equal("International Standard Delivery");
             });
         });

         it("should error on test", function() {

             var config = new Config(new dbAdapter(), api.mock(new mock.error()));
             var request = new linnCore.BaseRequest('create', "user config");
             
             return config.getShippingTags(request).then(function(result) {
                  throw 'Should not hit here';
             }, 
             function(error){
                expect(error).to.be.an.instanceof(linnCore.ShippingTagResponse);
                expect(error.Error.message).to.equal('it broke');
             });
         });

         it("should fail on test", function() {

             var config = new Config(new dbAdapter(), api.mock(new mock.notsuccessful()));
             var request = new linnCore.BaseRequest('create', "user config");
             
             return config.getShippingTags(request).then(function(result) {
                  throw 'Should not hit here';
             }, function(error){
                    expect(error).to.be.an.instanceof(linnCore.ShippingTagResponse);
             });
         });
    });

    describe('.getPaymentTags()', function() {

         it("should succeed", function() {

            var config = new Config(new dbAdapter(), api.mock(new mock.success()));
            
            var result = config.getPaymentTags()
            expect(result).to.be.an.instanceof(linnCore.PaymentTagResponse);

            expect(result.PaymentTags.length).to.equal(3);

            var tag1 = result.PaymentTags[0];
            expect(tag1.Tag).to.equal("manual payment");
            expect(tag1.FriendlyName).to.equal("Manual Payment");

            var tag2 = result.PaymentTags[1];
            expect(tag2.Tag).to.equal("paypal");
            expect(tag2.FriendlyName).to.equal("PayPal");

            var tag3 = result.PaymentTags[2];
            expect(tag3.Tag).to.equal("sagepay");
            expect(tag3.FriendlyName).to.equal("Sage Pay");
            
        });
    });
});