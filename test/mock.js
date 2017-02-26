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
              "price_adjustment": "0.55",
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
      "price": "7.571",
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
    }
  ]
};

class success {
  
  constructor(){
      let response = {
          statusCode: 200,
      };
      let error = null;
      let body = null;
  }

  get(method, token, callback) {
      var self = this;
      if(method.endsWith("products"))  {
          return callback(self.error, self.response, JSON.stringify(self.body || listProductMock));
      }
      else if(method === "products/_1*testproduct1_/stock")  {
          return callback(self.error, self.response, JSON.stringify({ error: "No data found"}));
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