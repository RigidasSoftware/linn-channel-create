var chai = require('chai'),
    expect = chai.expect,
    Products = require('../lib/products'),
    api = require('../lib/api'),
    linnCore = require('linn-channel-core'),
    dbAdapter = require('./dbMockAdapter'),
    mock = require('./mock');

//--debug-brk" add this to the test script to hit breakpoints

describe('products', function(){

    describe('.listProducts()', function(done) {

        it("should get products", function() {

             var products = new Products(new dbAdapter(), new mock.success());
             
             var request = new linnCore.ProductsRequest('create', 'user config', 1);

             return products.listProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductsResponse);

                  expect(result.HasMorePages).to.equal(false);

                  expect(result).to.have.property('Products');
                  expect(result.Products.length).to.equal(4);

                  //Item with sku
                  var product1 = result.Products[0];
                  expect(product1.Reference).to.equal(5482964);
                  expect(product1.SKU).to.equal("Loll1");
                  expect(product1.Title).to.equal("Lolly 1");
                  expect(product1.Price).to.equal(10);
                  expect(product1.Quantity).to.equal(11);

                  //Option with price adjustments
                  var product2 = result.Products[1];
                  expect(product2.Reference).to.equal(1016324);
                  expect(product2.SKU).to.equal(1016324);
                  expect(product2.Title).to.equal("Loll1: Large Lolly Sizes");
                  expect(product2.Price).to.equal(10.55);
                  expect(product2.Quantity).to.equal(-1);

                  //Option with no price adjustments
                  var product3 = result.Products[2];
                  expect(product3.Reference).to.equal(1016330);
                  expect(product3.SKU).to.equal(1016330);
                  expect(product3.Title).to.equal("Loll1: Small Lolly Sizes");
                  expect(product3.Price).to.equal(10);
                  expect(product3.Quantity).to.equal(-1);

                  //Product with no SKU
                  var product4 = result.Products[3];
                  expect(product4.Reference).to.equal(5482967);
                  expect(product4.SKU).to.equal(5482967);
                  expect(product4.Title).to.equal("Lolly 2");
                  expect(product4.Price).to.equal(7.57);
                  expect(product4.Quantity).to.equal(15);

             }, function(error){
                  throw error;
             })
        });

        it("should error on getting products", function() {
            var products = new Products(new dbAdapter(), new mock.error());
             
             var request = new linnCore.ProductsRequest('create', 'user config', 1);

             return products.listProducts(request).then(function(result) {
                throw 'should not hit here';
            }, function(error){
                expect(error).to.be.instanceof(linnCore.ProductsResponse);
                expect(error.Error).to.equal('it broke');
            })
        });

        it("should fail to get products", function() {

             var products = new Products(new dbAdapter(), new mock.notsuccessful());
             
             var request = new linnCore.ProductsRequest('create', 'user config', 1);

             return products.listProducts(request).then(function(result) {
                throw 'should not hit here';
             }, function(error){
                expect(error).to.be.instanceof(linnCore.ProductsResponse);
                expect(error.Error).to.equal('something happened');
             })
        });
    })

});