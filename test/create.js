var expect = require('chai').expect;
var create = require('../lib/create.js');

//--debug-brk" add this to the test script to hit breakpoints

describe('create', function(){
    describe('.init(options)', function() {

        it("should complain about devkey", function() {
            try {
                create.init();
            }
            catch (e){
                expect(e).to.equal("devkey must be provided");
            }
        });

    })

    describe('.init(options)', function() {

        it("should set the devkey", function() {
             create.init({ devkey: "123"});

             expect(create.devkey).to.equal("123");
        });

    })
})

var listProductMock = {
  "products": [
    {
      "ID": 5482964,
      "sku": "Loll1",
      "categories": [
        1282586
      ],
      "visible": true,
      "title": "Lolly 1",
      "short_description": "",
      "long_description": "\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non diam odio. Suspendisse eget est et risus lobortis volutpat eu sit amet nibh. In in libero non mi bibendum ultricies id ac lectus. Sed in mauris semper, vestibulum magna sodales, consequat nisl. Maecenas erat nisi, tempus non justo convallis, molestie facilisis dui. Vestibulum a faucibus erat. Morbi ultrices vitae orci a euismod. Integer quis elit orci.</p>\r\n",
      "price": 10,
      "was_price": "0.00",
      "trade_price": 5,
      "weight": 15,
      "stock_total": 11,
      "stock_backorder": 0,
      "title_tag": "",
      "meta_keywords": "",
      "meta_description": "",
      "average_rating": "0",
      "product_type_id": "0",
      "downloadable": "0",
      "options": [
        {
          "ID": 215423,
          "title": "Lolly Sizes",
          "required": "0",
          "items": [
            {
              "ID": 1016324,
              "title": "Large",
              "price_adjustment": "0.00",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            },
            {
              "ID": 1016330,
              "title": "Small",
              "price_adjustment": "0.00",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            }
          ]
        }
      ],
      "free_postage": false
    },
    {
      "ID": 5482967,
      "sku": "",
      "categories": [
        1282586
      ],
      "visible": true,
      "title": "Lolly 2",
      "short_description": "",
      "long_description": "\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non diam odio. Suspendisse eget est et risus lobortis volutpat eu sit amet nibh. In in libero non mi bibendum ultricies id ac lectus. Sed in mauris semper, vestibulum magna sodales, consequat nisl. Maecenas erat nisi, tempus non justo convallis, molestie facilisis dui. Vestibulum a faucibus erat. Morbi ultrices vitae orci a euismod. Integer quis elit orci.</p>\n",
      "price": "0.00",
      "was_price": "0.00",
      "trade_price": null,
      "weight": "0.000",
      "stock_total": 15,
      "stock_backorder": 0,
      "title_tag": "",
      "meta_keywords": "",
      "meta_description": "",
      "average_rating": "0",
      "product_type_id": "0",
      "downloadable": "0",
      "options": [],
      "free_postage": false
    },
    {
      "ID": 5482970,
      "sku": "",
      "categories": [
        1282586
      ],
      "visible": true,
      "title": "Lolly 3",
      "short_description": "",
      "long_description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non diam odio. Suspendisse eget est et risus lobortis volutpat eu sit amet nibh. In in libero non mi bibendum ultricies id ac lectus. Sed in mauris semper, vestibulum magna sodales, consequat nisl. Maecenas erat nisi, tempus non justo convallis, molestie facilisis dui. Vestibulum a faucibus erat. Morbi ultrices vitae orci a euismod. Integer quis elit orci.",
      "price": "0.00",
      "was_price": "0.00",
      "trade_price": null,
      "weight": "0.000",
      "stock_total": 7,
      "stock_backorder": 0,
      "title_tag": "",
      "meta_keywords": "",
      "meta_description": "",
      "average_rating": "0",
      "product_type_id": null,
      "downloadable": "0",
      "options": [],
      "free_postage": false
    }
  ]
}