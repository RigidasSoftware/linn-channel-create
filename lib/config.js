var linnCore = require('linn-channel-core'),
    steps = require('./config-steps');

var Config = function(adapter) { 
    
    Adapter = null;
    this.setAdapter = function(adapter) {
        Adapter = adapter;
    };

    this.addNewUser = function(addNewUserRequest) {
        return new Promise(function(resolve, reject) {

            if(!(addNewUserRequest instanceof linnCore.AddNewUserRequest)){
                return reject("request not of type AddNewUserRequest");
            }

            var token = Adapter.addNewUser(addNewUserRequest).then(function(userToken){
                var result = new linnCore.AddNewUserResponse(userToken);
                resolve(result);
            });
        });
    };

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
            return Adapter.getUser(saveUserConfigRequest.AuthorizationToken);
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

                if(userConfig.StepName === "AddCredentials") {
                    result = steps.GetAPICredentials(userConfig);
                }
                if(userConfig.StepName === "UserConfig") {
                    result = steps.UserConfig(userConfig);
                }
                else {
                    result = new linnCore.UserConfigResponse();
                }

                return resolve(result);
            });

        }

        return validate()
            .then(getUser)
            .then(validateConfig)
            .then(saveConfig)
            .then(finish);
    }

    if(adapter){
        this.setAdapter(adapter);
    }
}

module.exports = Config;