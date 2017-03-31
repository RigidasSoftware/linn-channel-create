var chai = require('chai'),
    expect = chai.expect,
    Orders = require('../lib/orders'),
    api = require('../lib/api'),
    linnCore = require('linn-channel-core'),
    dbAdapter = require('./dbMockAdapter'),
    mock = require('./mock');

describe('orders', function(){

    describe('.listOrders()', function(done) {

        it("should get orders", function() {

             var orders = new Orders(new dbAdapter(), api.mock(new mock.success()));
             
             var request = new linnCore.OrdersRequest('create', 'user config');

             return orders.listOrders(request).then(function(result) {

                //   expect(result).to.be.an.instanceof(linnCore.OrdersResponse);

                //   expect(result.HasMorePages).to.equal(false);

                //   expect(result).to.have.property('Orders');
                //   expect(result.Orders.length).to.equal(1);

                //   var order = result.Orders[0];
                //   expect(order.ReferenceNumber).to.equal('4695666');
                //   expect(order.PaymentStatus).to.equal(linnCore.PaymentStatus.PAID);
                //   expect(order.Site).to.equal('');
                //   expect(order.Currency).to.equal('GBP');
                //   expect(order.ReceivedDate).to.equal(new Date('2017-03-31 22:27:45'));
             }, function(error){
                  throw error;
             })
        });

        // it("should error on getting products", function() {
        //     var products = new Products(new dbAdapter(), api.mock(new mock.error()));
             
        //      var request = new linnCore.ProductsRequest('create', 'user config', 1);

        //      return products.listProducts(request).then(function(result) {
        //         throw 'should not hit here';
        //     }, function(error){
        //         expect(error).to.be.instanceof(linnCore.ProductsResponse);
        //         expect(error.Error).to.equal('it broke');
        //     })
        // });

        // it("should fail to get products", function() {

        //      var products = new Products(new dbAdapter(), api.mock(new mock.notsuccessful()));
             
        //      var request = new linnCore.ProductsRequest('create', 'user config', 1);

        //      return products.listProducts(request).then(function(result) {
        //         throw 'should not hit here';
        //      }, function(error){
        //         expect(error).to.be.instanceof(linnCore.ProductsResponse);
        //         expect(error.Error).to.equal('something happened');
        //      })
        // });
    })
});