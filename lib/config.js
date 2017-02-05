var linnCore = require('linn-channel-core');

var Config = function() { 
    
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
}

module.exports = Config;