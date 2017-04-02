var chai = require('chai'),
    expect = chai.expect,
    Orders = require('../lib/orders'),
    api = require('../lib/api'),
    linnCore = require('linn-channel-core'),
    dbAdapter = require('./dbMockAdapter'),
    mock = require('./mock');

chai.use(require('chai-datetime'));

describe('orders', function(){

    describe('.listOrders()', function(done) {

        it("should get orders", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()));
             
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

                  expect(order.MatchPaymentMethodTag).to.equal('manual payment');
                  expect(order.MatchPostalServiceTag).to.equal('2nd Class Delivery');

                  expect(order.PostalServiceCost).to.equal(3.5);
                  expect(order.TaxRate).to.equal(20);
                  expect(order.Discount).to.equal(0); 
                  throw "Need to test discount properly";
                  
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

                  expect(order.Notes.length).to.equal(1);
                  var note = order.Notes[0];
                  expect(note.Note).to.equal('Yesmate');
                  expect(note.NoteUserName).to.equal('Sync');
                  expect(note.NoteEntryDate).to.be.lessThan(new Date());
                  expect(note.NoteEntryDate).to.be.greaterThan(new Date().setHours(new Date().getHours() - 1));
                  expect(note.IsInternal).to.equal(false);

                  //test order items here
                  throw "need to test items"

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
});