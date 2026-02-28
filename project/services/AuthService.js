import User from "../models/User.js";

export default class AuthService {

    static async login(username, password) {
        // mock login
        if (username === "admin" && password === "1234") {
            const user = new User({
                userID: 1,
                username: "admin",
                role: "Admin"
            });

            localStorage.setItem("user", JSON.stringify(user));
            return user;
        }

        if (username === "owner" && password === "1234") {
            const user = new User({
                userID: 2,
                username: "owner",
                role: "StoreOwner",
                storeID: 1
            });

            localStorage.setItem("user", JSON.stringify(user));
            return user;
        }

        throw new Error("Invalid credentials");
    }

    static logout() {
        localStorage.removeItem("user");
    }

    static getCurrentUser() {
        const data = localStorage.getItem("user");
        return data ? JSON.parse(data) : null;
    }
}