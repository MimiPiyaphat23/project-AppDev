import AuthService from "../services/AuthService.js";

const user = AuthService.getCurrentUser();

if (!user || user.role !== "Admin") {
    window.location.href = "login.html";
}

window.logout = function() {
    AuthService.logout();
    window.location.href = "login.html";
}