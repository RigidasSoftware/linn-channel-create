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

        var getOrdersByStatus = function(status) {
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

                            var newOrder = new linnCore.Order(or.ID, status, "UK", or.order_currency);

                            newOrder.ReceivedDate = new Date(or.date_purchased);

                            newOrder.MatchPaymentMethodTag = or.gateway;
                            newOrder.MatchPostalServiceTag = or.shipping_method;

                            newOrder.PostalServiceCost = or.shipping_total;
                            newOrder.PostalServiceTaxRate = null; //??

                            var ship = or.shipping_details;
                            newOrder.DeliveryAddress = new linnCore.Address(
                                (ship.first_name || "") + ' ' + (ship.last_name || ""),
                                ship.company,
                                ship.address1,
                                ship.address2,
                                ship.address3,
                                ship.city,
                                ship.county,
                                ship.postcode,
                                null, //With default United Kingdom, will this cause problems?
                                ship.country,
                                ship.phone,
                                ship.email
                            );

                            var bill = or.customer_details;
                            newOrder.BillingAddress = new linnCore.Address(
                                (bill.first_name || "") + ' ' + (bill.last_name || ""),
                                bill.company,
                                bill.address1,
                                bill.address2,
                                bill.address3,
                                bill.city,
                                bill.county,
                                bill.postcode,
                                null,
                                bill.country,
                                bill.phone,
                                bill.email
                            );

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