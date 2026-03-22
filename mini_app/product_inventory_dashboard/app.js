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