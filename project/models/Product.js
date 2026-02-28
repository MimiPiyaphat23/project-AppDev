export default class Product {
    constructor({
        productID,
        productName,
        price,
        stockQuantity,
        productImage,
        storeID
    }) {
        this.productID = productID;
        this.productName = productName;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.productImage = productImage;
        this.storeID = storeID;
    }
}