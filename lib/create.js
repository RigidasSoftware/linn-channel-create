var linnCore = require('linn-channel-core'),
    api = require('./api'),
    Config = require('./config'),
    Products = require('./products');

var Create = function() { };

Create.key = "CREATE";
Create.devkey;
Create.options = {};

Create.init = function(options){
    Create.options = options || {};

    if(!Create.options.devkey) {
        throw "devkey must be provided";
    }

    if(options.mockrequest){
        request = options.mockrequest;
    }

    Create.devkey = options.devkey;

    var API = new api(Create.devkey);

    var config = new Config(options.adapter);
    var products = new Products(API);

    Create.addNewUser = config.addNewUser;
    Create.getUserConfig = config.getUserConfig;
    Create.saveUserConfig = config.saveUserConfig;
    Create.deleteUserConfig = config.deleteUserConfig;

    Create.listProducts = products.listProducts;

    return this;
};

Create.getOrders = function(body){
    return [
        {
            orderId: 10001
        }
    ];
}



module.exports = Create;