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

             var products = new Products(new dbAdapter(), api.mock(new mock.success()));
             
             var request = new linnCore.ProductsRequest('create', 'user config', 1);

             return products.listProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductsResponse);

                  expect(result.HasMorePages).to.equal(true);

                  expect(result).to.have.property('Products');
                  expect(result.Products.length).to.equal(6);

                  //Item with SKU
                  var product1 = result.Products[0];
                  expect(product1.Reference).to.equal(5482970);
                  expect(product1.SKU).to.equal("Loll3");
                  expect(product1.Title).to.equal("Lolly 3");
                  expect(product1.Price).to.equal(3.20);
                  expect(product1.Quantity).to.equal(27);

                  //Item with no sku
                  var product2 = result.Products[1];
                  expect(product2.Reference).to.equal(5482967);
                  expect(product2.SKU).to.equal(5482967);
                  expect(product2.Title).to.equal("Lolly 2");
                  expect(product2.Price).to.equal(0);
                  expect(product2.Quantity).to.equal(9);

                  //Option with negative price adjustments
                  var product3 = result.Products[2];
                  expect(product3.Reference).to.equal("5482964_stock_id_953448");
                  expect(product3.SKU).to.equal("Loll1_Small_Red");
                  expect(product3.Title).to.equal("Lolly 1: Small Red");
                  expect(product3.Price).to.equal(9.5);
                  expect(product3.Quantity).to.equal(2);

                  //Option with no price adjustments
                  var product4 = result.Products[3];
                  expect(product4.Reference).to.equal("5482964_stock_id_953449");
                  expect(product4.SKU).to.equal("Loll1_Medium_Red");
                  expect(product4.Title).to.equal("Lolly 1: Medium Red");
                  expect(product4.Price).to.equal(10.00);
                  expect(product4.Quantity).to.equal(4);

                  //Option with positive price adjustments
                  var product5 = result.Products[4];
                  expect(product5.Reference).to.equal("5482964_stock_id_953444");
                  expect(product5.SKU).to.equal("Loll1_Large_Green");
                  expect(product5.Title).to.equal("Lolly 1: Large Green");
                  expect(product5.Price).to.equal(10.65);
                  expect(product5.Quantity).to.equal(5);

             }, function(error){
                  throw error;
             })
        });

        it("should handle end of pages", function() {

             var products = new Products(new dbAdapter(), api.mock(new mock.success()));
             
             var request = new linnCore.ProductsRequest('create', 'user config', 100);

             return products.listProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductsResponse);

                  expect(result.HasMorePages).to.equal(false);

                  expect(result).to.have.property('Products');
                  expect(result.Products.length).to.equal(0);
             
             }, function(error){
                  throw error;
             })
        });

        it("should error on getting products", function() {
            var products = new Products(new dbAdapter(), api.mock(new mock.error()));
             
             var request = new linnCore.ProductsRequest('create', 'user config', 1);

             return products.listProducts(request).then(function(result) {
                throw 'should not hit here';
            }, function(error){
                expect(error).to.be.instanceof(linnCore.ProductsResponse);
                expect(error.Error).to.equal('it broke');
            })
        });

        it("should fail to get products", function() {

             var products = new Products(new dbAdapter(), api.mock(new mock.notsuccessful()));
             
             var request = new linnCore.ProductsRequest('create', 'user config', 1);

             return products.listProducts(request).then(function(result) {
                throw 'should not hit here';
             }, function(error){
                expect(error).to.be.instanceof(linnCore.ProductsResponse);
                expect(error.Error).to.equal('something happened');
             })
        });
    })

    describe('.updateProducts()', function(done) {

        it("convert products correctly", function() {

             class UpdateMock extends mock.success {
                constructor(){
                    super();
                }

                put(method, data, callback) {
                    var params = method.substr(32);
                    var parts = params.split('/');

                    if(parts[1] != "stock") {
                        throw "url part 1 should be 'stock'";
                    }

                    var product = data.form;
                    var expectedStockId;
                    var expectedStockLevel;
                    switch(parts[0]) {
                        case "1234":
                            expectedStockId = 'p1234'
                            expectedStockLevel = 7;
                            break;
                        case "1235":
                            expectedStockId = '00123';
                            expectedStockLevel = 13;
                            break;
                        default:
                            throw "unexpected item";
                            break;
                    }

                    if(parts[2] != expectedStockId) {
                        throw "product id incorrect";
                    }

                    if(product.stock_total != expectedStockLevel){
                        throw "stock_total not correct";
                    }

                    callback(this.error, this.response,  JSON.stringify({
                        stock_record: {
                            stock_total: product.stock_total
                        }
                    }));
                }
             };

             var products = new Products(new dbAdapter(), api.mock(new UpdateMock()));
             
             var ps = [
                new linnCore.ProductInventory("1234", "SKU1", 7),
                new linnCore.ProductInventory("1235_stock_id_00123", "SKU2", 13)
             ];

             var request = new linnCore.ProductInventoryUpdateRequest('create', 'user config', ps);

             return products.updateProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductInventoryUpdateResponse);
                  expect(result.Products.length).to.equal(ps.length);

                  for(var i = 0; i < result.Products.length; i++) {
                      var product = result.Products[i];
                      expect(product.Error).to.equal('');
                  };

                  expect(result.Products[0].SKU).to.equal('SKU1');
                  expect(result.Products[1].SKU).to.equal('SKU2');

             }, 
             function(error){
                 throw error;
             });
        });

        it("handle incorrect level response", function() {

             class UpdateMock extends mock.success {
                constructor(){
                    super();
                }

                put(method, data, callback) {
                    callback(this.error, this.response,  JSON.stringify({
                        stock_record: {
                            stock_total: 5
                        }
                    }));
                }
             };

             var products = new Products(new dbAdapter(), api.mock(new UpdateMock()));
             
             var ps = [
                new linnCore.ProductInventory("1234", "SKU1", 7)
             ];

             var request = new linnCore.ProductInventoryUpdateRequest('create', 'user config', ps);

             return products.updateProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductInventoryUpdateResponse);
                  expect(result.Products.length).to.equal(1);

                  expect(result.Products[0].SKU).to.equal('SKU1');
                  expect(result.Products[0].Error).to.equal('stock level not updated correctly. Expecting: 7. Actual: 5');

             }, 
             function(error){
                 throw error;
             });
        });

        it("handle individual error", function() {

             class UpdateMock extends mock.success {
                constructor(){
                    super();
                    this.response.statusCode = 500;
                }

                put(method, data, callback) {
                    callback(this.error, this.response,  JSON.stringify({
                        error: "No data found"
                    }));
                }
             };

             var products = new Products(new dbAdapter(), api.mock(new UpdateMock()));
             
             var ps = [
                new linnCore.ProductInventory("1234", "SKU1", 7)
             ];

             var request = new linnCore.ProductInventoryUpdateRequest('create', 'user config', ps);

             return products.updateProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductInventoryUpdateResponse);
                  expect(result.Products.length).to.equal(1);

                  expect(result.Products[0].SKU).to.equal('SKU1');
                  expect(result.Products[0].Error).to.equal('No data found');

             }, 
             function(error){
                 throw error;
             });
        });

        it("handle individual exception", function() {

             class UpdateMock extends mock.success {
                constructor(){
                    super();
                }

                put(method, data, callback) {
                    throw 'it broke';
                }
             };

             var products = new Products(new dbAdapter(), api.mock(new UpdateMock()));
             
             var ps = [
                new linnCore.ProductInventory("1234", "SKU1", 7)
             ];

             var request = new linnCore.ProductInventoryUpdateRequest('create', 'user config', ps);

             return products.updateProducts(request).then(function(result) {

                  expect(result).to.be.an.instanceof(linnCore.ProductInventoryUpdateResponse);
                  expect(result.Products.length).to.equal(1);

                  expect(result.Products[0].SKU).to.equal('SKU1');
                  expect(result.Products[0].Error).to.equal('it broke');

             }, 
             function(error){
                 throw error;
             });
        });

        it("handle full exception", function() {

             var products = new Products(new dbAdapter(), api.mock(new mock.error()));
             
             var ps = [
                new linnCore.ProductInventory("1234", "SKU1", 7)
             ];

             var request = new linnCore.ProductInventoryUpdateRequest('create', 'throw', ps);

             return products.updateProducts(request).then(function(result) {
                  throw "should not hit here";
             }, 
             function(error){
                 expect(error).to.be.an.instanceof(linnCore.ProductInventoryUpdateResponse);
                 expect(error.Error).to.equal("it broke");
             });
        });

        it("handle full rejection", function() {

             var products = new Products(new dbAdapter(), api.mock(new mock.error()));
             
             var ps = [
                new linnCore.ProductInventory("1234", "SKU1", 7)
             ];

             var request = new linnCore.ProductInventoryUpdateRequest('create', 'reject', ps);

             return products.updateProducts(request).then(function(result) {
                  throw "should not hit here";
             }, 
             function(error){
                 expect(error).to.be.an.instanceof(linnCore.ProductInventoryUpdateResponse);
                 expect(error.Error).to.equal("you got rejected");
             });
        });
    });

});