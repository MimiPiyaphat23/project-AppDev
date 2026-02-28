import AuthService from "../services/AuthService.js";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const error = document.getElementById("error");

    try {
        const user = await AuthService.login(username, password);

        if (user.role === "Admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "index.html";
        }

    } catch (err) {
        error.innerText = err.message;
    }
});