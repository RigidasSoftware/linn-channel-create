var request = require("request");

function api(devKey) {

    var BASE_URL = "https://api.create.net/";

    this.get = function(method, callback){

        var headers = {
            'X-Token': devKey,
            'X-Version': 1
        };

        request.get(BASE_URL + method, { headers: headers }, callback);
    }
}

module.exports = api;