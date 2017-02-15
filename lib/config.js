var linnCore = require('linn-channel-core'),
    steps = require('./config-steps');

var Config = function(adapter, api) { 
    
    Adapter = adapter;
    API = api;

    this.addNewUser = function(addNewUserRequest) {
        return new Promise(function(resolve, reject) {

            if(!(addNewUserRequest instanceof linnCore.AddNewUserRequest)){
                return reject("request not of type AddNewUserRequest");
            }

            var token = Adapter.addNewUser(addNewUserRequest).then(function(userToken){
                var result = new linnCore.AddNewUserResponse(userToken);
                resolve(result);
            }, 
            function(error){
                reject(new linnCore.AddNewUserResponse(null, error));
            });
        });
    };

    this.getUserConfig = function(request) {

        var getUser = function() {
            return Adapter.getUser("create", request.AuthorizationToken);
        },
        validateConfig = function(userConfig) {
            return new Promise(function(resolve, reject){

                if(!userConfig){
                    return reject(linnCore.UserConfigResponse.error("User not found"));
                }

                resolve(userConfig);
            });
        },
        finish = function(userConfig) {

            return new Promise(function(resolve, reject){
                var result;

                if(userConfig.StepName === "AddCredentials") {
                    result = steps.GetAPICredentials(userConfig);
                }
                else if(userConfig.StepName === "UserConfig") {
                    result = steps.UserConfig(userConfig);
                }
                else {
                    return reject(linnCore.UserConfigResponse.error("User config is at an invalid stage"));
                }

                return resolve(result);
            });

        }

        return new Promise(function(resolve, reject) {
            getUser()
            .then(validateConfig)
            .then(finish)
            .then(resolve)
            .catch(function(error){
                if(error instanceof linnCore.UserConfigResponse) {
                    reject(error);
                }
                else {
                    reject(linnCore.UserConfigResponse.error(error));
                }
            });
        });
    }

    this.saveUserConfig = function(saveUserConfigRequest) {

        var validate = function(){
            return new Promise(function(resolve, reject){
                if(!(saveUserConfigRequest instanceof linnCore.SaveUserConfigRequest)){
                    return reject("request not of type SaveUserConfigRequest");
                }
                resolve();
            });
        },
        getUser = function() {
            return Adapter.getUser("create", saveUserConfigRequest.AuthorizationToken);
        },
        validateConfig = function(userConfig) {

            return new Promise(function(resolve, reject){

                //I'd like the pre parse this stuff based on an object on the module
                if(!userConfig){
                    return reject(linnCore.UserConfigResponse.error("User not found"));
                }

                if(saveUserConfigRequest.StepName != userConfig.StepName) {
                    return reject(linnCore.UserConfigResponse.error("Invalid step name. Expected " + userConfig.StepName));
                }

                
                var apikey = saveUserConfigRequest.ConfigItems.find(s=>s.ConfigItemId === 'APIKey');
                if(!apikey) {
                    return reject(linnCore.UserConfigResponse.error("Expecting APIKey"));
                }
                userConfig.APIKey = apikey.SelectedValue;

                if(saveUserConfigRequest.StepName == "AddCredentials") {
                    userConfig.StepName = "UserConfig";
                }

                resolve(userConfig);
            });
        },
        saveConfig = function(userConfig) {
            return Adapter.saveConfig(userConfig);
        },
        finish = function(userConfig) {

            return new Promise(function(resolve, reject){
                var result;

                if(userConfig.StepName === "UserConfig") {
                    result = steps.UserConfig(userConfig);
                }
                else {
                    result = new linnCore.UserConfigResponse();
                }

                return resolve(result);
            });

        }

        return new Promise(function(resolve, reject) {
            validate()
                .then(getUser)
                .then(validateConfig)
                .then(saveConfig)
                .then(finish)
                .then(resolve)
                .catch(function(error){
                if(error instanceof linnCore.UserConfigResponse) {
                    reject(error);
                }
                else {
                    reject(linnCore.UserConfigResponse.error(error));
                }
            });
        });
    }

    this.deleteUserConfig = function(request) {

        var getUser = function() {
            return Adapter.getUser("create", request.AuthorizationToken);
        },
        validateConfig = function(userConfig) {
            return new Promise(function(resolve, reject){

                if(!userConfig){
                    return reject(new linnCore.BaseResponse("User not found"));
                }

                resolve(userConfig);
            });
        },
        del = function(userConfig) {
            return Adapter.deleteConfig("create", request.AuthorizationToken);
        },
        final = function(){
            return new Promise(function(resolve){
                resolve(new linnCore.BaseResponse());
            });
        }

        return new Promise(function(resolve, reject) {
            return getUser()
                .then(validateConfig)
                .then(del)
                .then(final)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.BaseResponse) {
                        reject(error);
                    }
                    else {
                        reject(new linnCore.BaseResponse(error));
                    }
                });
         });
        
    }

    this.testConfig = function(request) {

        var getUser = function() {
            return Adapter.getUser("create", request.AuthorizationToken);
        },
        testConfig = function(userConfig) {
            return new Promise(function(resolve, reject){

                if(!userConfig){
                    return reject(new linnCore.BaseResponse("User not found"));
                }

                API.get('products/_1*testproduct1_/stock', userConfig.APIKey, function (error, response, body) {

                    if (error) {
                        return reject(new linnCore.BaseResponse(error));
                    }

                    var parsedBody = JSON.parse(body);
                    if (response.statusCode === 200 && parsedBody.error == "No data found") {
                        resolve(new linnCore.BaseResponse());
                    }
                    else {
                        reject(new linnCore.BaseResponse(parsedBody.error || parsedBody));
                    }
                });
            });
        };

        return new Promise(function(resolve, reject) {
            return getUser()
                .then(testConfig)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.BaseResponse) {
                        reject(error);
                    }
                    else {
                        reject(new linnCore.BaseResponse(error));
                    }
                });
        });
    }
}

module.exports = Config;