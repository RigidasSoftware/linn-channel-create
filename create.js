linnCore = require('linn-channel-core');

var Create = function() {
    
}

Create.key = "CREATE";
Create.devKey;
Create.options = {};


Create.init = function(options){
    Create.options = options;

    if(!options.devkey){
        throw "devKey must be provided";
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
        var request = require("request");

        var headers = {
            'X-Token': Create.devkey,
            'X-Version': 1
        };

        request.get('https://api.create.net/products', { headers: headers }, function (error, response, body) {
            if (!error && response.statusCode == 200) {

                var parsedResult = new linnCore.ListProductsResult();;

                var products = JSON.parse(body).products;

                var productLength = products.length;
                for(var i = 0; i < productLength; i++) {
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
            else if (!error) {
                reject(JSON.parse(body));
            }
            else {
                reject(error);
            }
        });
    });
}

module.exports = Create;
