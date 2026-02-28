import StoreService from "../services/StoreService.js";

async function loadStores() {
    const stores = await StoreService.getAllStores();
    const container = document.getElementById("storeList");

    container.innerHTML = "";

    stores.forEach(store => {
        const div = document.createElement("div");
        div.innerText = store.storeName;
        div.onclick = () => {
            window.location.href = `store.html?storeID=${store.storeID}`;
        };
        container.appendChild(div);
    });
}

loadStores();