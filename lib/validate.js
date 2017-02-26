

function ValidateTypeAndGetUser(adapter, request, expectedRequestType){
    var validate = function(){
        return new Promise(function(resolve, reject) {
            if(!(request instanceof expectedRequestType)){
                return reject("request not of type " + expectedRequestType.Name);
            }
            resolve();
        });
    },
    getUser = function() {
        return adapter.getUser("create", request.AuthorizationToken);
    }
    return validate().then(getUser);
}

module.exports = {
    ValidateTypeAndGetUser
};