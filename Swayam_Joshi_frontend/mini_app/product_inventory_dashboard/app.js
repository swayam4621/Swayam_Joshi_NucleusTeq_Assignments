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

function renderProducts(dataToRender) {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = ''; 
    
    //empty State Handling
    if (dataToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: #fff; border: 1px solid #ddd; border-radius: 8px;">
                <p style="font-size: 1.2rem; color: #565959;">No products found matching those criteria.</p>
            </div>`;
        return;
    }

    dataToRender.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="p-title">${p.name}</div>
            <p style="font-size: 1.2rem; font-weight: bold; margin: 8px 0;">₹${p.price.toLocaleString('en-IN')}</p>
            <p style="font-size: 0.9rem; margin: 4px 0;">Category: <strong>${p.category}</strong></p>
            <p style="font-size: 0.9rem; margin: 4px 0; margin-bottom: 15px;">
                Stock: ${p.stock <= 0 ? '<span style="color:#b12704; font-weight:bold;">Out of Stock</span>' : p.stock}
            </p>
            <button class="amz-btn btn-delete" style="width: 100%;" onclick="deleteItem(${p.id})">Delete Item</button>
        `;
        grid.appendChild(div);
    });
}

function updateAnalytics(data) {
    const totalProducts = data.length;
    const totalValue = data.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
    const outOfStock = data.filter(p => p.stock === 0).length;

    const section = document.getElementById('analytics-section');
    section.className = "stats-container";
    section.innerHTML = `
        <div class="stat-box">
            <h3>TOTAL PRODUCTS</h3>
            <p>${totalProducts}</p>
        </div>
        <div class="stat-box">
            <h3>TOTAL INVENTORY VALUE</h3>
            <p>₹${totalValue.toLocaleString('en-IN')}</p>
        </div>
        <div class="stat-box">
            <h3>OUT OF STOCK</h3>
            <p style="color: #b12704;">${outOfStock}</p>
        </div>
    `;
}

// Logic and Filters
function applyAllFilters() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    const showLowStock = document.getElementById('low-stock-filter').checked;

    let filtered = allCurrentProducts.filter(p => {
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesCat = category === 'all' || p.category === category;
        const matchesStock = showLowStock ? p.stock < 5 : true;
        return matchesName && matchesCat && matchesStock;
    });

    filtered = handleSort(filtered);

    renderProducts(filtered);
    updateAnalytics(filtered);
}

function handleSort(data) {
    const sortVal = document.getElementById('sort-filter').value;
    // We use slice() to avoid mutating the original array directly during sorting
    let sortedData = data.slice(); 
    if (sortVal === 'price-low') sortedData.sort((a, b) => a.price - b.price);
    if (sortVal === 'price-high') sortedData.sort((a, b) => b.price - a.price);
    if (sortVal === 'alpha-az') sortedData.sort((a, b) => a.name.localeCompare(b.name));
    return sortedData;
}

//DATA MANAGEMENT 
function addNewProduct(e) {
    e.preventDefault();
    const name = document.getElementById('new-p-name').value;
    const price = Number(document.getElementById('new-p-price').value);
    const stock = Number(document.getElementById('new-p-stock').value);
    const category = document.getElementById('new-p-category').value;

    if (price <= 0 || stock < 0) {
        alert("Please enter valid numbers!");
        return;
    }

    const newObj = { id: Date.now(), name, price, stock, category };
    allCurrentProducts.push(newObj);
    localStorage.setItem('inventory', JSON.stringify(allCurrentProducts));
    
    e.target.reset(); //clears the form inputs
    applyAllFilters();
}

function deleteItem(id) {
    allCurrentProducts = allCurrentProducts.filter(p => p.id !== id);
    localStorage.setItem('inventory', JSON.stringify(allCurrentProducts));
    applyAllFilters();
}

//Initialization

function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', applyAllFilters);
    document.getElementById('category-filter').addEventListener('change', applyAllFilters);
    document.getElementById('low-stock-filter').addEventListener('change', applyAllFilters);
    document.getElementById('sort-filter').addEventListener('change', applyAllFilters);
    document.getElementById('add-product-form').addEventListener('submit', addNewProduct);
}

window.addEventListener('DOMContentLoaded', async () => {
    //fetch data
    allCurrentProducts = await fetchInventory();
    
    //hide loading screen
    document.getElementById('loading-overlay').style.display = 'none';
    
    //render HTML blocks
    renderControls();
    renderForm();
    
    //fill Data
    renderProducts(allCurrentProducts);
    updateAnalytics(allCurrentProducts);
    
    //for interactions
    setupEventListeners();
});