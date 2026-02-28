export default class User {
    constructor({ userID, username, role, storeID = null }) {
        this.userID = userID;
        this.username = username;
        this.role = role;
        this.storeID = storeID;
    }

    isAdmin() {
        return this.role === "Admin";
    }

    isStoreOwner() {
        return this.role === "StoreOwner";
    }

    isCustomer() {
        return this.role === "Customer";
    }
}