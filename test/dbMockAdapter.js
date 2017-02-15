var linnCore = require('linn-channel-core');

function dbMockAdapter() {
  
    var randomGuid = function(){ 
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
    }

    this.addNewUser = function(addNewUserRequest) {
        return new Promise(function(resolve, reject){
            if(addNewUserRequest.AccountName === "error"){
                reject('it broke');
            }
            else {
                resolve(randomGuid());
            }
        })
    };

    this.getUser = function(provider, authToken) {
        return new Promise(function(resolve, reject){
            switch(authToken) {
                case "no user":
                    return resolve();
                case "add credentials":
                    return resolve(
                        new linnCore.UserConfig('create', 'token', 'email', 'account', 'AddCredentials', { APIKey: '1234' })
                    );
                case "user config":
                    return resolve(
                        new linnCore.UserConfig('create', 'token', 'email', 'account', 'UserConfig', { APIKey: '1234' })
                    );
                case "bad step":
                    return resolve(
                        new linnCore.UserConfig('create', 'token', 'email', 'account', 'BadStep', { APIKey: '1234' })
                    );
                case "throw":
                    throw 'it broke';
                default:
                    return reject('unknown test');
            }
        });
    }

    this.saveConfig = function(userConfig) {
        return new Promise(function(resolve, reject){
            switch(userConfig.AuthorizationToken) {
                case 'token':
                    return resolve(userConfig);
                case "throw":
                    throw 'it broke';
                default:
                    return reject('unknown test');
            }
        });
    }

    this.deleteConfig = function(provider, authToken) {
        return new Promise(function(resolve, reject){
            return resolve();
        });
    }
}

module.exports = dbMockAdapter;