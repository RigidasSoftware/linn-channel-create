var linnCore = require('linn-channel-core');
var request = require("request");

var Create = function() { };

Create.key = "CREATE";
Create.devkey;
Create.options = {};

Create.init = function(options){
    Create.options = options;

    if(!options.devkey) {
        throw "devkey must be provided";
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
        var headers = {
            'X-Token': Create.devkey,
            'X-Version': 1
        };

        request.get('https://api.create.net/products', 
        { headers: headers }, 
        function (error, response, body) {
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
                reject(error);
            }
        });
    });
}

module.exports = Create;