//adding current products
let allCurrentProducts = [];


const initialProducts = [
    { id: 101, name: "Echo Dot (5th Gen)", price: 4499, stock: 12, category: "electronics" },
    { id: 102, name: "Kindle Paperwhite", price: 13999, stock: 5, category: "electronics" },
    { id: 103, name: "Fire TV Stick 4K", price: 5999, stock: 0, category: "electronics" },
    { id: 104, name: "Clean Code (Paperback)", price: 2500, stock: 8, category: "books" },
    { id: 105, name: "Sony XM5 Headphones", price: 24999, stock: 3, category: "electronics" },
    { id: 106, name: "Introduction to Algorithms", price: 4500, stock: 6, category: "books" },
    { id: 107, name: "USB-C Fast Charger", price: 1500, stock: 20, category: "accessories" },
    { id: 108, name: "Mechanical Keyboard", price: 8500, stock: 4, category: "electronics" }
];

//fetching the inventory
function fetchInventory() {
    return new Promise((resolve) => {
        setTimeout(() => {
            const data = JSON.parse(localStorage.getItem('inventory')) || initialProducts;
            resolve(data);
        }, 1500);
    });
}


// UI generators
function renderControls() {
    const filterSec = document.getElementById('filter-section');
    filterSec.innerHTML = `
        <div class="filter-bar">
            <input type="text" id="search-input" placeholder="Search by name...">
            <select id="category-filter">
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="books">Books</option>
                <option value="accessories">Accessories</option>
                <option value="clothing">Clothing</option>
            </select>
            <label style="font-size: 0.9rem; font-weight: 500;">
                <input type="checkbox" id="low-stock-filter"> Low Stock (< 5)
            </label>
            <select id="sort-filter">
                <option value="none">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="alpha-az">A - Z</option>
            </select>
        </div>
    `;
}

function renderForm() {
    const formSec = document.getElementById('form-section');
    formSec.innerHTML = `
        <div class="form-section">
            <h2 style="margin-top: 0; margin-bottom: 20px; color: #0f1111;">Add a New Product</h2>
            <form id="add-product-form">
                <div class="form-group">
                    <label>Product Name</label>
                    <input type="text" id="new-p-name" required>
                </div>
                <div style="display: flex; gap: 15px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Price (₹)</label>
                        <input type="number" id="new-p-price" min="1" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Stock Quantity</label>
                        <input type="number" id="new-p-stock" min="0" required>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Category</label>
                        <select id="new-p-category" required style="width: 100%;">
                            <option value="electronics">Electronics</option>
                            <option value="books">Books</option>
                            <option value="accessories">Accessories</option>
                            <option value="clothing">Clothing</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="amz-btn" style="width: 100%; padding: 12px; font-weight: bold; margin-top: 10px;">
                    Add to Inventory
                </button>
            </form>
        </div>
    `;
}