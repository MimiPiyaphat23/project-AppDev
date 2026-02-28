import StoreService from "../services/StoreService.js";
import ProductService from "../services/ProductService.js";

const params = new URLSearchParams(window.location.search);
const storeID = params.get("storeID");

async function loadStore() {
    const store = await StoreService.getStoreById(storeID);

    if (!store) {
        document.body.innerHTML = "<h2>Store Not Found</h2>";
        return;
    }

    document.getElementById("storeName").innerText = store.storeName;
    document.getElementById("storeCategory").innerText = store.category;
    document.getElementById("storePhone").innerText = store.phone;
    document.getElementById("storeHours").innerText = store.openingHours;

    const products = await ProductService.getProductsByStore(storeID);
    const productList = document.getElementById("productList");

    products.forEach(p => {
        const div = document.createElement("div");
        div.innerText = `${p.productName} - ${p.price} บาท (Stock: ${p.stockQuantity})`;
        productList.appendChild(div);
    });
}

loadStore();