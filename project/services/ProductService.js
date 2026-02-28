import Product from "../models/Product.js";

export default class ProductService {

    static async getProductsByStore(storeID) {
        return [
            new Product({
                productID: 1,
                productName: "Latte",
                price: 120,
                stockQuantity: 50,
                productImage: "latte.png",
                storeID: storeID
            })
        ];
    }
}