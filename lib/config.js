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

                API.get('products/_1*testproduct1_/stock', userConfig.APIKey).then(function (response) {

                    if (response.error && response.error == "No data found") {
                        return resolve(new linnCore.BaseResponse());
                    }
                    else{
                        return reject(new linnCore.BaseResponse(response.error || response));
                    }
                }, reject);
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

    this.getShippingTags = function(request) {
        var config;
        var getUser = function() {
            return Adapter.getUser("create", request.AuthorizationToken);
        },
        getDeliveryZones = function(userConfig) {
            return new Promise(function(resolve, reject){
                config = userConfig;
                if(!userConfig){
                    return reject(new linnCore.BaseResponse("User not found"));
                }

                var zones = [];
                if(config.APIKey) {
                    API.get('deliveryzones', config.APIKey, "delivery_zones").then(function (response) {
                        for(var i = 0; i < response.length; i++){
                            zones.push(response[i].ID);
                        }
                        resolve(zones);
                    }, reject);
                }
                else {
                    resolve(zones);
                }
            });
        },
        getShippingMethodsPerZone = function(id) {
            return API.get('deliveryzones/' + id + '/types', config.APIKey, "delivery_types");
        },
        getShippingMethods = function(zones) {
            var promises = [];
            for(var i = 0; i < zones.length; i++){
                var zone = zones[i];
                promises.push(getShippingMethodsPerZone(zone));
            }

            return Promise.all(promises);
        },
        aggregate = function(zones){
            return new Promise(function(resolve, reject) {

                var uniqueZones = [];
                for(var z = 0; z < zones.length; z++){
                    var zone = zones[z];
                    if(zone) {
                        for(var i = 0; i < zone.length; i++){
                            var method = zone[i];
                            if(uniqueZones.indexOf(method.name) === -1) {
                                uniqueZones.push(method.name);
                            }
                        }
                    }
                }

                var tags = [];
                for(var i = 0; i < uniqueZones.length; i++){
                    var m = uniqueZones[i];
                    tags.push(new linnCore.ShippingTag(m, m));
                }

                return resolve(new linnCore.ShippingTagResponse(tags));
            });
        };

        return new Promise(function(resolve, reject) {
            return getUser()
                .then(getDeliveryZones)
                .then(getShippingMethods)
                .then(aggregate)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.ShippingTagResponse) {
                        reject(error);
                    }
                    else {
                        reject(new linnCore.ShippingTagResponse(null, error.Error || error));
                    }
                });
        });
    }
}

module.exports = Config;