export default class Store {
    constructor({
        storeID,
        storeName,
        category,
        phone,
        openingHours,
        logo,
        positionX,
        positionY
    }) {
        this.storeID = storeID;
        this.storeName = storeName;
        this.category = category;
        this.phone = phone;
        this.openingHours = openingHours;
        this.logo = logo;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}