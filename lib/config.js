var linnCore = require('linn-channel-core');

var Config = function() { };

Config.addNewUser = function(addNewUserRequest) {

    return new Promise(function(resolve, reject) {

        if(!(addNewUserRequest instanceof linnCore.AddNewUserRequest)){
            return reject("request not of type AddNewUserRequest");
        }

        var result = new linnCore.AddNewUserResponse(guid());

        resolve(result);
    });
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

module.exports = Config;