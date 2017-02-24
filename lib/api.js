var request = require("request");

function api(devKey) {

    var BASE_URL = "https://api.create.net/";

    this.get = function(method, token, resultKey){

        return new Promise(function(resolve, reject){
            var headers = {
                'X-AppToken' :  devKey,
                'X-Token': token,
                'X-Version': 1
            };

            request.get(BASE_URL + method, { headers: headers }, function (error, response, body) {

                if (error) {
                    return reject(error);
                }

                if (response.statusCode === 200) {
                    var result;
                    if(resultKey){
                        result = JSON.parse(body)[resultKey];
                    }
                    else{
                        result = JSON.parse(body);
                    }
                    resolve(result);
                }
                else {
                    reject(JSON.parse(body));
                }
            });
        })
    }
}

module.exports = api;