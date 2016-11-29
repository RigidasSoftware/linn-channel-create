var linnCore = require('linn-channel-core'),
    request = require("request");

var BASE_URL = "https://api.create.net/";

function get (method, callback){

    var headers = {
        'X-Token': Create.devkey,
        'X-Version': 1
    };

    request.get(BASE_URL + 'products', { headers: headers }, callback);
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
                        product.sku || product.ID,
                        product.title,
                        Math.round(product.price * 100) / 100,
                        product.stock_total
                    );

                    parsedResult.Products.push(newProduct);

                    if(product.options && product.options.length > 0){
                        for(var o = 0; o < product.options.length; o++){
                            var option = product.options[o];

                            if(option.items && option.items.length){
                                for(var oi = 0; oi < option.items.length; oi++){
                                    var optItem = option.items[oi];

                                    var newOptionProduct = new linnCore.Product(
                                        optItem.ID,
                                        optItem.ID,
                                        newProduct.SKU + ': ' + optItem.title + ' ' + option.title,
                                        Math.round((product.price + parseFloat(optItem.price_adjustment)) * 100) / 100,
                                        -1
                                    );

                                    parsedResult.Products.push(newOptionProduct);
                                }
                            }
                        }
                    }
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