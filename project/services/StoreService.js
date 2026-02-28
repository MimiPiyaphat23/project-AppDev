import Store from "../models/Store.js";

export default class StoreService {

    static async getAllStores() {
        // mock data
        return [
            new Store({
                storeID: 1,
                storeName: "Star Coffee",
                category: "Cafe",
                phone: "0812345678",
                openingHours: "10:00-20:00",
                logo: "logo.png",
                positionX: 100,
                positionY: 200
            })
        ];
    }

    static async getStoreById(id) {
        const stores = await this.getAllStores();
        return stores.find(s => s.storeID == id);
    }
}