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
      "stock_total": 20,
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
          "required": "1",
          "items": [
            {
              "ID": 1016324,
              "title": "Large",
              "price_adjustment": "0.50",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            },
            {
              "ID": 1016325,
              "title": "Medium",
              "price_adjustment": "0.00",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            },
            {
              "ID": 1016330,
              "title": "Small",
              "price_adjustment": "-0.50",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            }
          ]
        },
        {
          "ID": 225772,
          "title": "Colours",
          "required": "1",
          "items": [
            {
              "ID": 1075720,
              "title": "Blue",
              "price_adjustment": "0.00",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            },
            {
              "ID": 1075716,
              "title": "Green",
              "price_adjustment": "0.15",
              "weight_adjustment": "0.000",
              "is_custom_input": false
            },
            {
              "ID": 1075712,
              "title": "Red",
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
      "ID": 5482970,
      "sku": "Loll3",
      "categories": [
        1282586
      ],
      "visible": true,
      "title": "Lolly 3",
      "short_description": "",
      "long_description": "\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras non diam odio. Suspendisse eget est et risus lobortis volutpat eu sit amet nibh. In in libero non mi bibendum ultricies id ac lectus. Sed in mauris semper, vestibulum magna sodales, consequat nisl. Maecenas erat nisi, tempus non justo convallis, molestie facilisis dui. Vestibulum a faucibus erat. Morbi ultrices vitae orci a euismod. Integer quis elit orci.</p>\n",
      "price": "3.20",
      "was_price": "0.00",
      "trade_price": null,
      "weight": "0.000",
      "stock_total": 27,
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
      "stock_total": 9,
      "stock_backorder": 0,
      "title_tag": "",
      "meta_keywords": "",
      "meta_description": "",
      "average_rating": "0",
      "product_type_id": "0",
      "downloadable": "0",
      "options": [],
      "free_postage": false
    }
  ]
};
var stockProductMock = {
    5482964: {
      "stock_records": [
        {
          "ID": 953448,
          "stock_total": 2,
          "options": [
            {
              "ID": 215423,
              "title": "Lolly Sizes",
              "items": [
                {
                  "ID": 1016330,
                  "title": "Small"
                }
              ]
            },
            {
              "ID": 225772,
              "title": "Colours",
              "items": [
                {
                  "ID": 1075712,
                  "title": "Red"
                }
              ]
            }
          ]
        },
        {
          "ID": 953449,
          "stock_total": 4,
          "options": [
            {
              "ID": 215423,
              "title": "Lolly Sizes",
              "items": [
                {
                  "ID": 1016325,
                  "title": "Medium"
                }
              ]
            },
            {
              "ID": 225772,
              "title": "Colours",
              "items": [
                {
                  "ID": 1075712,
                  "title": "Red"
                }
              ]
            }
          ]
        },
        {
          "ID": 953444,
          "stock_total": 5,
          "options": [
            {
              "ID": 215423,
              "title": "Lolly Sizes",
              "items": [
                {
                  "ID": 1016324,
                  "title": "Large"
                }
              ]
            },
            {
              "ID": 225772,
              "title": "Colours",
              "items": [
                {
                  "ID": 1075716,
                  "title": "Green"
                }
              ]
            }
          ]
        },
        {
          "ID": 953440,
          "stock_total": 5,
          "options": [
            {
              "ID": 215423,
              "title": "Lolly Sizes",
              "items": [
                {
                  "ID": 1016324,
                  "title": "Large"
                }
              ]
            },
            {
              "ID": 225772,
              "title": "Colours",
              "items": [
                {
                  "ID": 1075720,
                  "title": "Blue"
                }
              ]
            }
          ]
        }
      ]
    },
    5482967: {
      "stock_records": [
        {
          "ID": "p5482967",
          "stock_total": 9,
          "options": []
        }
      ]
    },
    5482970: {
      "stock_records": [
        {
          "ID": "p5482970",
          "stock_total": 27,
          "options": []
        }
      ]
    }
};

class success {
  
  constructor(){

      this.response = {
          statusCode: 200,
      };
      this.error = null;
      this.body = null;
  }

  get(method, token, callback) {
    
      if(method.endsWith("products/_1*testproduct1_/stock"))  {
          return callback(this.error, this.response, JSON.stringify({ error: "No data found"}));
      }
      else if(method.endsWith("products"))  {
          return callback(this.error, this.response, JSON.stringify(this.body || listProductMock));
      }
      else if(method.endsWith("stock")){
          var productId = parseInt(method.replace('https://api.create.net/products/', '').replace('/stock',''));
          return callback(this.error, this.response, JSON.stringify(this.body || stockProductMock[productId]))
      }
  }
}

class error extends success {
  constructor(){
      super();
      this.error = {
        message: "it broke"
      };
  }
}

class notsuccessful extends success {
  constructor(){
      super();
      this.response.statusCode = 400;
      this.body = {
        message: "something happened"
      }
  }
}

module.exports = {
  success: success,
  error: error,
  notsuccessful: notsuccessful
}