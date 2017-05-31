var chai = require('chai'),
    expect = chai.expect,
    Products = require('../lib/products'),
    Orders = require('../lib/orders'),
    api = require('../lib/api'),
    linnCore = require('linn-channel-core'),
    dbAdapter = require('./dbMockAdapter'),
    mock = require('./mock');

chai.use(require('chai-datetime'));

describe('orders', function(){

    describe('.listOrders()', function(done) {

        var products = new Products(new dbAdapter(), api.mock(new mock.success()));

        it("should get orders", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()), products);
             
             var request = new linnCore.OrdersRequest('create', 'user config');

             return orders.listOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrdersResponse);

                  expect(result.HasMorePages).to.equal(false);

                  expect(result).to.have.property('Orders');
                  expect(result.Orders.length).to.equal(2);

                  var order = result.Orders[0];
                  expect(order.ReferenceNumber).to.equal('4695666');
                  expect(order.PaymentStatus).to.equal(linnCore.PaymentStatus.PAID);
                  expect(order.Site).to.equal('');
                  expect(order.Currency).to.equal('GBP');
                  expect(order.ReceivedDate).to.equalDate(new Date('2017-03-31 22:27:45'));
                  expect(order.PaidOn).to.equalDate(new Date('2017-03-31 22:27:45'));

                  expect(order.MatchPaymentMethodTag).to.equal('manual payment');
                  expect(order.MatchPostalServiceTag).to.equal('2nd Class Delivery');

                  expect(order.PostalServiceCost).to.equal(4.2);
                  expect(order.TaxRate).to.equal(20);
                  expect(order.InternalDiscount).to.equal(4.4); 
                  
                  var da = order.DeliveryAddress;
                  expect(da.FullName).to.equal('FuzzBean Testington');
                  expect(da.Company).to.equal('SellerYouStuff');
                  expect(da.Address1).to.equal('Place');
                  expect(da.Address2).to.equal('SomePlace');
                  expect(da.Address3).to.equal('In another place');
                  expect(da.Town).to.equal('Other Place');
                  expect(da.Region).to.equal('Hampshire');
                  expect(da.PostCode).to.equal('PO9 1DF');
                  expect(da.Country).to.equal('United Kingdom');
                  expect(da.CountryCode).to.equal('GB');
                  expect(da.PhoneNumber).to.equal('01888774442');
                  expect(da.EmailAddress).to.equal('ship@aim.com');

                  var ba = order.BillingAddress;
                  expect(ba.FullName).to.equal('Money Keeper');
                  expect(ba.Company).to.equal('Uptight Accountants PLC');
                  expect(ba.Address1).to.equal('Highrise 72');
                  expect(ba.Address2).to.equal('Banking Town');
                  expect(ba.Address3).to.equal('The Biggest Part');
                  expect(ba.Town).to.equal('Important People City');
                  expect(ba.Region).to.equal('Home of Monies');
                  expect(ba.PostCode).to.equal('PO7 4EJ');
                  expect(ba.Country).to.equal('United Kingdom');
                  expect(ba.CountryCode).to.equal('GB');
                  expect(ba.PhoneNumber).to.equal('01888786442');
                  expect(ba.EmailAddress).to.equal('billing@aim.com');

                  expect(order.Notes.length).to.equal(2);
                  var note = order.Notes[0];
                  expect(note.Note).to.equal('Yesmate');
                  expect(note.NoteUserName).to.equal('Sync');
                  expect(note.NoteEntryDate).to.be.lessThan(new Date());
                  expect(note.NoteEntryDate).to.be.greaterThan(new Date().setHours(new Date().getHours() - 1));
                  expect(note.IsInternal).to.equal(false);

                  //test order items here
                  var item1 = order.OrderItems[0];
                  expect(item1.ItemTitle).to.equal('Lolly 3');
                  expect(item1.IsService).to.equal(false);
                  expect(item1.Options.length).to.equal(0);
                  expect(item1.LinePercentDiscount).to.equal(0);
                  expect(item1.OrderLineNumber).to.equal("5482970");
                  expect(item1.PricePerUnit).to.equal(4.9);
                  expect(item1.Qty).to.equal(2);
                  expect(item1.SKU).to.equal("Loll3");
                  expect(item1.TaxCostInclusive).to.equal(true);
                  expect(item1.TaxRate).to.equal(20);
                  expect(item1.UseChannelTax).to.equal(true);

                  var item2 = order.OrderItems[1];
                  expect(item2.ItemTitle).to.equal('Lolly 2');
                  expect(item2.IsService).to.equal(false);
                  expect(item2.Options.length).to.equal(0);
                  expect(item2.LinePercentDiscount).to.equal(0);
                  expect(item2.OrderLineNumber).to.equal("5482967");
                  expect(item2.PricePerUnit).to.equal(4.9);
                  expect(item2.Qty).to.equal(1);
                  expect(item2.SKU).to.equal("5482967");
                  expect(item2.TaxCostInclusive).to.equal(true);
                  expect(item2.TaxRate).to.equal(20);
                  expect(item2.UseChannelTax).to.equal(true);

                  var item3 = order.OrderItems[2];
                  expect(item3.ItemTitle).to.equal('Lolly 1: Small Red');
                  expect(item3.IsService).to.equal(false);
                  expect(item3.Options.length).to.equal(0);
                  expect(item3.LinePercentDiscount).to.equal(0);
                  expect(item3.OrderLineNumber).to.equal("5482964_stock_id_953448");
                  expect(item3.PricePerUnit).to.equal(10.3);
                  expect(item3.Qty).to.equal(1);
                  expect(item3.SKU).to.equal("Loll1_Small_Red");
                  expect(item3.TaxCostInclusive).to.equal(true);
                  expect(item3.TaxRate).to.equal(20);
                  expect(item3.UseChannelTax).to.equal(true);

             }, function(error){
                  throw error;
             })
        });
        
        it("should return an empty Orders object", function() {
            class UpdateMock extends mock.success {
                constructor(){
                    super();
                }

                get(method, data, callback) {
                    callback(this.error, this.response, JSON.stringify({
                        error: 'No data found'
                    }))
                }
            };

            var orders = new Orders(new dbAdapter(), api.mock(new UpdateMock()));
             
            var request = new linnCore.OrdersRequest('create', 'user config');

            return orders.listOrders(request).then(function(result) {
                expect(result).to.be.instanceof(linnCore.OrdersResponse);
                expect(result.Orders.length).to.equal(0);
                expect(result.Error).to.equal('');
                expect(result.HasMorePages).to.equal(false);
            }, function(error){
                throw error;
            })
        });

        it("should error on getting orders", function() {
            var orders = new Orders(new dbAdapter(), api.mock(new mock.error()));
             
            var request = new linnCore.OrdersRequest('create', 'user config');

            return orders.listOrders(request).then(function(result) {
                throw 'should not hit here';
            }, function(error){
                expect(error).to.be.instanceof(linnCore.OrdersResponse);
                expect(error.Error).to.equal('it broke');
            })
        });

        it("should fail to get orders", function() {

            var orders = new Orders(new dbAdapter(), api.mock(new mock.notsuccessful()));
             
            var request = new linnCore.OrdersRequest('create', 'user config');

            return orders.listOrders(request).then(function(result) {
                throw 'should not hit here';
            }, function(error){
                expect(error).to.be.instanceof(linnCore.OrdersResponse);
                expect(error.Error).to.equal('something happened');
            })
        });
    })

    describe('.despatchOrders()', function(done) {

        it("should complain about no items", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, "1st Class Delivery")
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrderDespatchResponse);
                  expect(result.Error).to.equal('');
                  expect(result.Orders.length).to.equal(1);

                  var order1 = result.Orders[0];
                  expect(order1).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order1.ReferenceNumber).to.equal("4695666");
                  expect(order1.Error).to.equal('Item count different. Cannot partially despatch order.');

             }, function(error){
                 throw "should not hit here";
             });

        })

        it("should complain about different item count", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, "1st Class Delivery", null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 2)
                 ])
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrderDespatchResponse);
                  expect(result.Error).to.equal('');
                  expect(result.Orders.length).to.equal(1);

                  var order1 = result.Orders[0];
                  expect(order1).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order1.ReferenceNumber).to.equal("4695666");
                  expect(order1.Error).to.equal('Item count different. Cannot partially despatch order.');

             });

        })

        it("should complain about item quantity being less", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, "1st Class Delivery", null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 1),
                     new linnCore.OrderDespatchItem("abc", "5482967", 1),
                     new linnCore.OrderDespatchItem("abc", "5482964_stock_id_953448", 1)
                 ])
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrderDespatchResponse);
                  expect(result.Error).to.equal('');
                  expect(result.Orders.length).to.equal(1);

                  var order1 = result.Orders[0];
                  expect(order1).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order1.ReferenceNumber).to.equal("4695666");
                  expect(order1.Error).to.equal('Item 5482970 has 1 despatched quantity. Expecting 2. Cannot partially despatch order.');

             });

        })

        it("should complain about item missing", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, "1st Class Delivery", null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 2),
                     new linnCore.OrderDespatchItem("abc", "5482967", 1),
                     new linnCore.OrderDespatchItem("abc", "5482964_stock_id_953447", 1)
                 ])
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrderDespatchResponse);
                  expect(result.Error).to.equal('');
                  expect(result.Orders.length).to.equal(1);

                  var order1 = result.Orders[0];
                  expect(order1).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order1.ReferenceNumber).to.equal("4695666");
                  expect(order1.Error).to.equal('Item 5482964 missing. Cannot partially despatch order.');

             });

        })

        it("should complain about invalid order", function() {

             class DespatchMock extends mock.success {
                constructor(){
                    super();
                }

                put(method, data, callback) {
                    var params = method.substr(32);
                    var parts = params.split('/');

                    var order = data.form;
                    var expectedShippingMethod;
                    switch(parts[0]) {
                        case "95666":
                            expectedShippingMethod = "1st Class Delivery";
                            break;
                        default:
                            throw "unexpected order";
                    }

                    if(order.shipping_method != expectedShippingMethod){
                        throw "shipping_method not correct";
                    }

                    callback(this.error, this.response); //Need to see what a real response is
                }
             };

             var orders = new Orders(new dbAdapter(), api.mock(new DespatchMock()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, "1st Class Delivery", null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 2),
                     new linnCore.OrderDespatchItem("abc", "5482967", 1),
                     new linnCore.OrderDespatchItem("abc", "5482964_stock_id_953448", 1)
                 ]),
                 new linnCore.OrderDespatch("4695689", null, "1st Class Delivery")
             ];

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrderDespatchResponse);
                  expect(result.Error).to.equal('');
                  expect(result.Orders.length).to.equal(2);

                  var findOrder = function(ref){
                      for(var i = 0; i < result.Orders.length; i++){
                          var order = result.Orders[i];
                          if(order.ReferenceNumber === ref){
                              return order;
                          }
                      }
                      return null;
                  };

                  var order1 = findOrder("4695666");
                  expect(order1).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order1.Error).to.equal('');

                  var order2 = findOrder("4695689");
                  expect(order2).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order2.Error).to.equal('Order does not exist');

             });

        })

        it("should complain about shipping method missing", function() {

            class DespatchMock extends mock.success {
                constructor(){
                    super();
                }

                put(method, data, callback) {
                    var order = data.form;

                    if(order.shipping_method){
                        throw "shipping_method should not be provided";
                    }

                    callback(this.error, this.response);
                }
             };

             var orders = new Orders(new dbAdapter(), api.mock(new DespatchMock()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, null, null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 2),
                     new linnCore.OrderDespatchItem("abc", "5482967", 1),
                     new linnCore.OrderDespatchItem("abc", "5482964_stock_id_953448", 1)
                 ])
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.OrderDespatchResponse);
                  expect(result.Error).to.equal('');
                  expect(result.Orders.length).to.equal(1);

                  var order1 = result.Orders[0];
                  expect(order1).to.be.instanceOf(linnCore.OrderDespatchError);
                  expect(order1.ReferenceNumber).to.equal("4695666");
                  expect(order1.Error).to.equal('');

             });

        })

        it("should error on getting products", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.error()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, null, null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 2),
                     new linnCore.OrderDespatchItem("abc", "5482967", 1),
                     new linnCore.OrderDespatchItem("abc", "5482964_stock_id_953448", 1)
                 ])
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {
                    throw 'should not hit here';
             }, function(error){
                    expect(error).to.be.instanceof(linnCore.OrderDespatchResponse);
                    expect(error.Error).to.equal('it broke');
             })

        })

        it("should fail to get products", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.notsuccessful()));
             
             var despatchOrders = [
                 new linnCore.OrderDespatch("4695666", null, null, null, null, null, [
                     new linnCore.OrderDespatchItem("abc", "5482970", 2),
                     new linnCore.OrderDespatchItem("abc", "5482967", 1),
                     new linnCore.OrderDespatchItem("abc", "5482964_stock_id_953448", 1)
                 ])
             ]

             var request = new linnCore.OrderDespatchRequest('create', 'user config', despatchOrders);

             return orders.despatchOrders(request).then(function(result) {
                    throw 'should not hit here';
             }, function(error){
                    expect(error).to.be.instanceof(linnCore.OrderDespatchResponse);
                    expect(error.Error).to.equal('something happened');
             })

        })
    });
});