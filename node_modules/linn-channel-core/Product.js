function Product(id, sku, title, retailPrice, stockLevel) {
    this.ID = id;
    this.SKU = sku;
    this.Title = title;
    this.RetailPrice = retailPrice;
    this.StockLevel = stockLevel;
}

module.exports = Product;