var linnCore = require('linn-channel-core'),
    request = require("request");

var BASE_URL = "https://api.create.net/";

function get (method, callback){

    var headers = {
        'X-Token': Create.devkey,
        'X-Version': 1
    };

    request.get(baseUrl + 'products', { headers: headers }, callback);
}

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

    return this;
};

Create.getOrders = function(body){
    return [
        {
            orderId: 10001
        }
    ];
}

Create.listProducts = function() {
    return new Promise(function(resolve, reject){
        get('products', function (error, response, body) {

            if (error) {
                return reject(error);
            }

            if (response.statusCode === 200) {
                var parsedResult = new linnCore.ListProductsResult();

                var products = JSON.parse(body).products;

                for(var i = 0; i < products.length; i++) {
                    var product = products[i];

                    var newProduct = new linnCore.Product(
                        product.ID,
                        product.sku,
                        product.title,
                        product.price,
                        product.stock_total
                    );

                    parsedResult.Products.push(newProduct);
                }

                //Parse body here
                resolve(parsedResult);
            }
            else {
                reject(JSON.parse(body));
            }
        });
    });
}

module.exports = Create;