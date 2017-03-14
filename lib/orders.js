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
            var url = 'orders?&status=' + status;
            return API.get(url, config.APIKey, 'orders');
        },
        getOrders = function(userConfig, status) {
            return new Promise(function(resolve, reject){ 
                config = userConfig;

                var promises = [];
                
                promises.push(getOrdersByStatus(OrderStatus.PENDING))
                promises.push(getOrdersByStatus(OrderStatus.PROCESSING));

                var result = [];
                Promise.all(promises).then(function(ordersArr) {
                    for(var i = 0; i < ordersArr.length; i++){
                        var orders = ordersArr[i];

                        if(!orders){
                            continue;
                        }

                        for(var o = 0; o < orders.length; o++){
                            var or = orders[o];

                            var status = OrderStatusMapping[or.status];

                            var newOrder = new linnCore.Order(or.ID, status, "UK", or.order_currency); //Is create always UK?

                            newOrder.ReceivedDate = new Date(or.date_purchased);

                            newOrder.MatchPaymentMethodTag = or.gateway;
                            newOrder.MatchPostalServiceTag = or.shipping_method;

                            newOrder.PostalServiceCost = or.shipping_total;
                            newOrder.PostalServiceTaxRate = null; //??

                            var ship = or.shipping_details;
                            newOrder.DeliveryAddress = parseAddress(or, 'shipping_details');
                            newOrder.BillingAddress = parseAddress(or, 'customer_details');
                        
                            //TODO: Add OrderItems

                            if(or.notes && or.notes.startsWith('Customer Notes: ')){
                                newOrder.Notes = [
                                    new linnCore.OrderNote(or.notes.replace('Customer Notes: ', ''), 'Sync', new Date(), false)
                                ];
                            }

                            result.push(newOrder);
                        }
                    }

                    var response = new linnCore.OrdersResponse(false, result); //Should we be paging?

                    resolve(response);

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