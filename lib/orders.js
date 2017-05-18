var linnCore = require('linn-channel-core'),
    validate = require('./validate');

const OrderStatus = {
    PENDING: 1,
    PROCESSING: 2
};

var OrderStatusMapping = { };
OrderStatusMapping[OrderStatus.PENDING] = linnCore.PaymentStatus.UNPAID;
OrderStatusMapping[OrderStatus.PROCESSING] = linnCore.PaymentStatus.PAID;

function getOrderItemProductId(orderItemProduct) {
    if(orderItemProduct.stock_record_id) {
        return orderItemProduct.product_id + '_stock_id_' + orderItemProduct.stock_record_id;
    }
    else {
        return orderItemProduct.product_id;
    }
}

var Orders = function(adapter, api, products) { 

    Adapter = adapter;
    API = api;
    Products = products;

    this.listOrders = function(ordersRequest) {

        var config;

        var options = {};

        var stockCache = {};

        var parseAddress = function (order, key){
            var address = order[key];
            return new linnCore.Address(
                (address.first_name || "") + ' ' + (address.last_name || ""),
                address.company,
                address.address1,
                address.address2,
                address.address3,
                address.city,
                address.county,
                address.postcode,
                null, //With default United Kingdom, will this cause problems?
                address.country,
                address.phone,
                address.email
            );
        },
        getOrdersByStatus = function(status) {
            var url = 'orders?status=' + status;
            return API.get(url, config.APIKey, 'orders');
        },
        getOrders = function(userConfig, status) {
            return new Promise(function(resolve, reject){ 
                config = userConfig;

                var promises = [];
                
                promises.push(getOrdersByStatus(OrderStatus.PENDING))
                promises.push(getOrdersByStatus(OrderStatus.PROCESSING));

                var result = [];
                var itemPromises = [];
                Promise.all(promises).then(function(ordersArr) {
                    for(var i = 0; i < ordersArr.length; i++){
                        var orders = ordersArr[i];

                        if(!orders){
                            continue;
                        }

                        for(var o = 0; o < orders.length; o++){
                            var or = orders[o];

                            var status = OrderStatusMapping[or.status];

                            var newOrder = new linnCore.Order(or.ID, status, "", or.order_currency); //Is create always UK?

                            newOrder.ReceivedDate = new Date(or.date_purchased);
                            if(newOrder.PaymentStatus === linnCore.PaymentStatus.PAID){
                                newOrder.PaidOn = newOrder.ReceivedDate;
                            }

                            newOrder.MatchPaymentMethodTag = or.gateway;
                            newOrder.MatchPostalServiceTag = or.shipping_method;                            
                            newOrder.InternalDiscount = parseFloat(or.discount_amount);

                            var taxTotal = parseFloat(or.tax_total);
                            var orderTotal = parseFloat(or.order_total) + newOrder.InternalDiscount;
                            newOrder.TaxRate = (taxTotal / (orderTotal - taxTotal)) * 100;
                            
                            newOrder.PostalServiceCost = parseFloat(or.shipping_total) * (1 + (newOrder.TaxRate / 100));
                            
                            var ship = or.shipping_details;
                            newOrder.DeliveryAddress = parseAddress(or, 'shipping_details');
                            newOrder.BillingAddress = parseAddress(or, 'customer_details');

                            newOrder.Notes = [];

                            if(or.notes && or.notes.startsWith('Customer Notes: ')){
                                newOrder.Notes.push(
                                    new linnCore.OrderNote(or.notes.replace('Customer Notes: ', ''), 'Sync', new Date(), false)
                                );
                            }

                            if(newOrder.InternalDiscount){
                                var z = +(newOrder.InternalDiscount).toFixed(2);
                                newOrder.Notes.push(
                                    new linnCore.OrderNote("A discount of " + z + " was applied", "Sync", new Date(), true)
                                );
                            }

                            itemPromises.push(getOrderItems(newOrder));  
                        }
                    }

                    Promise.all(itemPromises).then((results) => {
                        result = result.concat(results);
                        var response = new linnCore.OrdersResponse(false, result); //Should we be paging?
                        resolve(response);
                    }, reject);
                }, reject);
            });
        },
        getOrderProducts = function(orderId) {
            var url = 'orders/' + orderId + '/products';
            return API.get(url, config.APIKey, 'products');
        },
        setStockOptionDetails = function(product) {
            return new Promise(function(resolve, reject) {

                function set(foundProduct) {

                    var sku = Products.parseSKU(foundProduct);
                    var title = product.name + ":";

                    for(var j = 0; j < product.options.length; j++) {
                        var opt = product.options[j];
                        for(var k = 0; k < opt.items.length; k++) {
                            var item = opt.items[k];
                            sku += ('_' + item.title);
                            title += (' ' + item.title);
                        }
                    }   

                    product.sku = sku;
                    product.name = title;

                    stockCache[product.stock_record_id] = {
                        sku,
                        title
                    }
                }

                var stockRecord = stockCache[product.stock_record_id];

                if(stockRecord){
                    product.sku = stockRecord.sku;
                    product.name = stockRecord.title;
                    resolve(product);
                }
                else {
                    Products.getSingleProduct(product.product_id, config.APIKey).then(function(foundProduct){
                        set(foundProduct);
                        resolve(product);
                    }, reject);
                }
            });
        }
        getOrderItems = function(order){
            var promise = (resolve, reject) => {
                getOrderProducts(order.ReferenceNumber).then((result) => {
                    
                    var qty = 0;
                    for(var i = 0; i < result.length; i++) {
                        qty+=result[i].qty;
                    }

                    var discountPerUnit = order.InternalDiscount / qty;

                    var promises = [];

                    function complete(ci) {
                        return new Promise(function(resolve, reject){ 
                            ci.product_id = getOrderItemProductId(ci); 

                            var price_per_unit = (parseFloat(ci.price) * (1 + (order.TaxRate / 100))) - discountPerUnit;

                            var li = new linnCore.OrderItem(ci.product_id.toString(), ci.sku, ci.name, ci.qty, price_per_unit);
                            li.TaxCostInclusive = true;
                            li.UseChannelTax = true;
                            li.TaxRate = order.TaxRate;
                            order.OrderItems.push(li);

                            resolve();
                        });
                    }

                    for(var i = 0; i < result.length; i++) {
                        var ci = result[i];

                        if(ci.stock_record_id) {
                            promises.push(setStockOptionDetails(ci).then((p) => complete(p), reject)); //May need to set individual order errors here
                        }    
                        else {
                            ci.sku = ci.product_id.toString();
                            promises.push(complete(ci));
                        }          
                    }

                    Promise.all(promises).then(() => resolve(order), reject);

                }, reject);
            };
            return new Promise(promise);
        }

        return new Promise(function(resolve, reject) {
            return validate.ValidateTypeAndGetUser(Adapter, ordersRequest, linnCore.OrdersRequest)
                .then(getOrders)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.OrdersResponse) {
                        reject(error);
                    }
                    else {
                        reject(linnCore.OrdersResponse.error(error.message || error));
                    }
                });
        });
    }

    this.despatchOrders = function(orderDespatchRequest) {
        var config;
        var getSingleOrderProducts = function(order){
            var url = 'orders/' + order.ReferenceNumber + '/products';
            return new Promise(function(resolve, reject) {
                return API.get(url, config.APIKey, 'products').then(function(products) {
                    resolve({ order, products });
                }, reject);
            });
        },
        validateOrder = function(orderAndProducts) {
            return new Promise(function(resolve, reject) {
                var request = orderAndProducts.order;
                var products = orderAndProducts.products;

                if(!products) {
                    return resolve(new linnCore.OrderDespatchError(request.ReferenceNumber, "Order does not exist"));
                }

                if(!request.Items || request.Items.length < products.length){
                    return resolve(new linnCore.OrderDespatchError(request.ReferenceNumber, "Item count different. Cannot partially despatch order."));
                }
                
                function findMatchingItem(product){
                    var productId = getOrderItemProductId(product);
                    for(var i = 0; i < request.Items.length; i++){
                        var item = request.Items[i];
                        if(item.OrderLineNumber == productId){
                            return item;
                        }
                    }
                    return null;
                }

                for(var i = 0; i < products.length; i++){
                    var p = products[i];
                    var requestProduct = findMatchingItem(p);

                    if(!requestProduct) {
                        return resolve(new linnCore.OrderDespatchError(request.ReferenceNumber, "Item " + p.product_id + " missing. Cannot partially despatch order."));
                    }

                    if(requestProduct.DespatchedQuantity < p.qty) {
                        var error = "Item " + p.product_id + " has " + requestProduct.DespatchedQuantity + " despatched quantity. Expecting " + p.qty + ". Cannot partially despatch order.";
                        return resolve(new linnCore.OrderDespatchError(request.ReferenceNumber, error));
                    }
                }

                resolve(request);
            });

        },
        consolidateOrders = function(userConfig) {

            config = userConfig;

            var promises = [];

            for(var i = 0; i < orderDespatchRequest.Orders.length; i++) {
                var order = orderDespatchRequest.Orders[i];
                var chain = getSingleOrderProducts(order)
                            .then(validateOrder);

                promises.push(chain);
            }

            return Promise.all(promises);

        },
        despatchSingleOrder = function(order) {
            return new Promise(function(resolve, reject) {

                var data = {
                    status: 3
                }

                if(order.ShippingMethod) {
                    data.shipping_method = order.ShippingMethod
                }

                return API.put('orders/' + order.ReferenceNumber, config.APIKey, data).then(function() {
                    return resolve(new linnCore.OrderDespatchError(order.ReferenceNumber));
                }, function(error){
                    return resolve(new linnCore.OrderDespatchError(order.ReferenceNumber, error.error || error));
                });

            });
        },
        despatchOrders = function(orders) {
            return new Promise(function(resolve, reject) {
                var finalOutput = [];
                var promises = [];

                for(var i = 0; i < orders.length; i++){
                    var o = orders[i];
                    if(o instanceof linnCore.OrderDespatchError){
                        finalOutput.push(o);
                    }
                    else {
                        promises.push(despatchSingleOrder(o));
                    }
                }

                var finish = function() {
                    return resolve(new linnCore.OrderDespatchResponse(finalOutput));
                }

                if(promises.length > 0) {
                    return Promise.all(promises).then(function(result) {
                        for(var i = 0; i < result.length; i++){
                            finalOutput.push(result[i]);
                        }
                        finish();
                    }, reject);
                }
                else {
                    finish();
                }
            });
        };

        return new Promise(function(resolve, reject) {
            return validate.ValidateTypeAndGetUser(Adapter, orderDespatchRequest, linnCore.OrderDespatchRequest)
                .then(consolidateOrders)
                .then(despatchOrders)
                .then(resolve)
                .catch(function(error){
                    if(error instanceof linnCore.OrderDespatchResponse) {
                        reject(error);
                    }
                    else {
                        reject(linnCore.OrderDespatchResponse.error(error.message || error));
                    }
                });
        });
    }

}

module.exports = Orders;
