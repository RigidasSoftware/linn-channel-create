var linnCore = require('linn-channel-core');

var Config = function() { };

Config.addNewUser = function(addNewUserRequest) {

    return new Promise(function(resolve, reject) {

        if(!(addNewUserRequest instanceof linnCore.AddNewUserRequest)){
            return reject("request not of type AddNewUserRequest");
        }

        var result = new linnCore.AddNewUserResponse("some token");

        resolve(result);
    });
}

module.exports = Config;