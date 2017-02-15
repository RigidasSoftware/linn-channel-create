var linnCore = require('linn-channel-core');

var Products = function(adapter, api) { 

    Adapter = adapter;
    API = api;

    this.listProducts = function(productsRequest) {

        var validate = function(){
            return new Promise(function(resolve, reject) {
                if(!(productsRequest instanceof linnCore.ProductsRequest)){
                    return reject("request not of type ProductsRequest");
                }
                resolve();
            });
        },
        getUser = function() {
            return Adapter.getUser("create", productsRequest.AuthorizationToken);
        },
        getProducts = function(userConfig) {
            return new Promise(function(resolve, reject){
                API.get('products', userConfig.APIKey, function (error, response, body) {

                    if (error) {
                        return reject(error);
                    }

                    if (response.statusCode === 200) {
                        
                        var products = JSON.parse(body).products;
                        var productsResult = [];

                        for(var i = 0; i < products.length; i++) {
                            var product = products[i];

                            var newProduct = new linnCore.Product(
                                product.ID,
                                product.sku || product.ID,
                                product.title,
                                Math.round(product.price * 100) / 100,
                                product.stock_total
                            );

                            productsResult.push(newProduct);

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

                                            productsResult.push(newOptionProduct);
                                        }
                                    }
                                }
                            }
                        }

                        var parsedResult = new linnCore.ProductsResponse(false, productsResult);

                        //Parse body here
                        resolve(parsedResult);
                    }
                    else {
                        reject(JSON.parse(body));
                    }
                });
            })
        };

        return new Promise(function(resolve, reject) {
            return validate()
                .then(getUser)
                .then(getProducts)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.ProductsResponse) {
                        reject(error);
                    }
                    else {
                        reject(linnCore.ProductsResponse.error(error.message || error));
                    }
                });
        });
    }
}

module.exports = Products;