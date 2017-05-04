var linnCore = require('linn-channel-core'),
    api = require('./api'),
    Config = require('./config'),
    Products = require('./products'),
    Orders = require('./orders');

var Create = function() { };

Create.key = "CREATE";
Create.devkey;
Create.options = {};

Create.init = function(options){
    Create.options = options || {};

    if(!Create.options.devkey) {
        throw "devkey must be provided";
    }

    Create.devkey = options.devkey;

    var API = null;
    if(options.mockrequest){
        API = options.mockrequest;
    }
    else {
        API = new api(Create.devkey);
    }

    var config = new Config(options.adapter, API);
    var products = new Products(options.adapter, API);
    var orders = new Orders(options.adapter, API);

    Create.addNewUser = config.addNewUser;
    Create.getUserConfig = config.getUserConfig;
    Create.saveUserConfig = config.saveUserConfig;
    Create.deleteUserConfig = config.deleteUserConfig;
    Create.testConfig = config.testConfig;
    Create.getShippingTags = config.getShippingTags;

    Create.listProducts = products.listProducts;
    Create.updateProducts = products.updateProducts;

    Create.listOrders = orders.listOrders;

    return this;
};


module.exports = Create;