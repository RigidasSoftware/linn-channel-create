var linnCore = require('linn-channel-core'),
    validate = require('./validate');

var Products = function(adapter, api) { 

    Adapter = adapter;
    API = api;

    this.listProducts = function(productsRequest) {

        var config;

        var options = {};

        var getProducts = function(userConfig) {
            config = userConfig;
            return API.get('products', config.APIKey, 'products');
        },
        getOptionStock = function(product, productOptions) {
            return new Promise(function(resolve, reject){
                return API.get('products/' + product.Reference + '/stock', config.APIKey, 'stock_records').then(function(stock) {

                    var result = [];

                    function mapOptions() {
                        for(var o = 0; o < productOptions.length; o++){
                            var prodOpt = productOptions[o];
                            for(var i = 0; i < prodOpt.items.length; i++) {
                                var item = prodOpt.items[i];
                                if(!options[item.ID]){
                                    options[item.ID] = {
                                        price_adjustment: parseFloat(item.price_adjustment)
                                    }
                                }
                            }
                        }
                    }

                    for(var o = 0; o < stock.length; o++){
                        var stockOption = stock[o];

                        var sku = product.SKU;
                        var title = product.Title + ':';
                        var price_adjustment = 0;

                        for(var i = 0; i < stockOption.options.length; i++){
                            var option = stockOption.options[i];

                            var item = option.items[0];
                            var adjustments = options[item.ID];
                            if(!adjustments){
                                mapOptions();
                                adjustments = options[item.ID];
                            }

                            sku += ('_' + item.title);
                            title += (' ' + item.title);
                            price_adjustment += adjustments.price_adjustment;
                        }

                        var newOptionProduct = new linnCore.Product(
                            product.Reference + '_stock_id_' + stockOption.ID,
                            sku,
                            title,
                            Math.round((product.Price + price_adjustment) * 100) / 100,
                            stockOption.stock_total
                        );

                        result.push(newOptionProduct);
                    }

                    resolve(result);
                })
            })
        }
        getStock = function(products){
            return new Promise(function(resolve, reject){

                var promises = [];

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

                    if(product.options && product.options.length > 0){
                        promises.push(getOptionStock(newProduct, product.options));
                    }
                    else {
                        productsResult.push(newProduct);
                    }
                }

                function finish(){
                    var parsedResult = new linnCore.ProductsResponse(false, productsResult);
                    resolve(parsedResult);
                }

                if(promises.length && promises.length > 0){
                    Promise.all(promises).then(function(results){
                        for(var i = 0; i < results.length; i++){
                            var i1 = results[i];
                            for(var j = 0; j < i1.length; j++){
                                productsResult.push(i1[j]);
                            }
                        }
                        finish();
                    }, reject);
                }
                else{
                    finish();
                }
            })
        };

        return new Promise(function(resolve, reject) {
            return validate.ValidateTypeAndGetUser(Adapter, productsRequest, linnCore.ProductsRequest)
                .then(getProducts)
                .then(getStock)
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

    this.updateProducts = function(updateProductsRequest) {
        var config;
        var updateProductSingle = function(product) {

            var productId;
            var stockId;

            var stockIdIndex = product.Reference.toString().indexOf('_stock_id_');
            if(stockIdIndex > 0){
                productId = product.Reference.substring(0, stockIdIndex);
                stockId = product.Reference.substr(stockIdIndex + 10);
            }
            else {
                productId = product.Reference;
                stockId = 'p' + product.Reference;
            }

            var data = {
                stock_total: product.Quantity
            }

            return new Promise(function(resolve, reject){
                API.put('products/' + productId + '/stock/' + stockId, config.APIKey, data, 'stock_record').then(function(result){
                    if(result.stock_total === product.Quantity){
                       return resolve(new linnCore.ProductInventoryResponse(product.SKU));
                    }
                    else {
                        var error = "stock level not updated correctly. Expecting: " + product.Quantity + '. Actual: ' + result.stock_total;
                        return resolve(new linnCore.ProductInventoryResponse(product.SKU, error));
                    }
                }, function(error){
                    //need to handle expected errors
                    return resolve(new linnCore.ProductInventoryResponse(product.SKU, error.error || error));
                });
            })
        },
        updateProducts = function(userConfig) {
            return new Promise(function(resolve, reject){
                config = userConfig;
                var promises = [];
                for(var i = 0; i < updateProductsRequest.Products.length; i++){
                    var product = updateProductsRequest.Products[i];
                    
                    promises.push(updateProductSingle(product));
                }

                Promise.all(promises).then(function(results){
                    resolve(new linnCore.ProductInventoryUpdateResponse(results));
                }, reject);
            });
        };

        return new Promise(function(resolve, reject) {
            return validate.ValidateTypeAndGetUser(Adapter, updateProductsRequest, linnCore.ProductInventoryUpdateRequest)
                .then(updateProducts)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.ProductsResponse) {
                        reject(error);
                    }
                    else {
                        reject(linnCore.ProductInventoryUpdateResponse.error(error.message || error));
                    }
                });
        });
    }
}

module.exports = Products;