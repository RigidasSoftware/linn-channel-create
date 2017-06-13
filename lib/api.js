var request = require("request");

class api {

    constructor(devKey, mock){
        this.devKey = devKey;
        this.BASE_URL = "https://api.create.net/";

        if(mock){
            request = mock;
        }
    }

    call(verb, url, token, body, resultKey){
        var self = this;
        return new Promise(function(resolve, reject){

            var headers = {
                'X-AppToken' :  self.devKey,
                'X-Token': token,
                'X-Version': 1
            };

            var data = {
                headers: headers 
            };

            if(body){
                data.form = body;
            }
            
            var method = request.get.bind(request);
            if(verb === 'put'){
                method = request.put.bind(request);
            }

            method(self.BASE_URL + url, data, function(error, response, body) {

                if (error) {
                    return reject(error);
                }

                if (response.statusCode === 200) {
                    var result;
                    if(body) {
                        if(resultKey){
                            result = JSON.parse(body)[resultKey];
                        }
                        else{
                            result = JSON.parse(body);
                        }
                    }
                    resolve(result);
                }
                else {
                    try {
                    body = JSON.parse(body);
                    } catch(e) { }
                    reject(body.error || body);
                }
            });
         });
    };

    get(url, token, resultKey){
        return this.call('get', url, token, null, resultKey);
    }

    put(url, token, body, resultKey){
        return this.call('put', url, token, body, resultKey);
    }

    static mock(m){
        return new this('', m);
    }
}

module.exports = api
