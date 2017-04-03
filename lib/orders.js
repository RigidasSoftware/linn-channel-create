var linnCore = require('linn-channel-core'),
    validate = require('./validate');

const OrderStatus = {
    PENDING: 1,
    PROCESSING: 2
};

var OrderStatusMapping = { };
OrderStatusMapping[OrderStatus.PENDING] = linnCore.PaymentStatus.UNPAID;
OrderStatusMapping[OrderStatus.PROCESSING] = linnCore.PaymentStatus.PAID;

var Orders = function(adapter, api) { 

    Adapter = adapter;
    API = api;

    this.listOrders = function(ordersRequest) {

        return new Promise(function(resolve, reject){
            resolve(new linnCore.OrdersResponse(false, []));
        });

        var config;

        var options = {};

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

                            newOrder.MatchPaymentMethodTag = or.gateway;
                            newOrder.MatchPostalServiceTag = or.shipping_method;

                            newOrder.PostalServiceCost = parseFloat(or.shipping_total);
                            newOrder.TaxRate = (or.tax_total / (or.order_total - or.tax_total)) * 100;
                            newOrder.Discount = parseFloat(or.discount_amount);
                            //discount_text: 'Discount (Test Discount Fixed)'
                            //discount_text: '10.00% Discount (Test Discount Percent)'

                            var ship = or.shipping_details;
                            newOrder.DeliveryAddress = parseAddress(or, 'shipping_details');
                            newOrder.BillingAddress = parseAddress(or, 'customer_details');

                            if(or.notes && or.notes.startsWith('Customer Notes: ')){
                                newOrder.Notes = [
                                    new linnCore.OrderNote(or.notes.replace('Customer Notes: ', ''), 'Sync', new Date(), false)
                                ];
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
        getOrderItems = function(order){
            return new Promise((resolve, reject) => {
                getOrderProducts(order.ReferenceNumber).then((result) => {
                    
                    for(var i = 0; i < result.length; i++) {
                        var ci = result[i];
                        if(ci.stock_record_id) {
                            ci.product_id = ci.product_id + '_stock_id_' + ci.stock_record_id;
                        }
                        for(var j = 0; j < ci.options.length; j++) {
                            var opt = ci.options[j];
                            for(var k = 0; k < opt.items.length; k++) {
                                ci.name += (j === 0 ? ': ' : ' ') + opt.items[k].title;
                            }
                        }                     
                        var li = new linnCore.OrderItem(ci.product_id, ci.product_id, ci.name, ci.qty, ci.price);
                        li.TaxCostInclusive = true;
                        li.UseChannelTax = true;
                        li.TaxRate = order.TaxRate;
                        order.OrderItems.push(li);
                    }
                    resolve(order);
                }, reject);
            });
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

}

module.exports = Orders;