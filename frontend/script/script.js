const API_BASE = 'http://localhost:3000';

// ---------- STATE ----------
let cart = [];
let products = [];

// ---------- DOM ----------
const $ = (sel) => document.querySelector(sel);

const els = {
productCode: $('#productCode'),
productSearch: $('#productSearch'),
addQty: $('#addQty'),
cartBody: $('#cartBody'),
totalValue: $('#totalValue'),
subtotalValue: $('#subtotalValue'),
discountInput: $('#discountInput'),
searchResults: $('#searchResults'),
};

// ---------- LOGIN ----------
async function login() {
const res = await fetch(`${API_BASE}/auth/login`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
email: "[vitor@email.com](mailto:vitor@email.com)",
password: "123456"
})
});

const data = await res.json();
localStorage.setItem("token", data.token);
}

// ---------- API ----------
async function apiFetch(path, method = "GET", data = null) {
  try {
    const token = localStorage.getItem("token");

    const config = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    };

    // 🔥 só adiciona body se existir
    if (data) {
      config.body = JSON.stringify(data);
    }

    const res = await fetch(API_BASE + path, config);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Erro API");
    }

    return await res.json();

  } catch (err) {
    console.error("Erro API:", err);
    alert(err.message);
    return null;
  }
}

// ---------- LOAD PRODUCTS ----------
async function loadProducts() {
const data = await apiFetch("/products");
if (data) {
products = data;
console.log("Produtos:", products);
}
}

// ---------- SEARCH ----------
function performSearch() {
const query = els.productSearch.value.toLowerCase();

const results = products.filter(p =>
p.name.toLowerCase().includes(query)
);

els.searchResults.innerHTML = results.map(p => `     <div class="search-result-item"
      data-id="${p.id}"
      data-name="${p.name}"
      data-price="${p.price}">
      ${p.name} - R$ ${p.price}     </div>
  `).join('');
}

// ---------- CART ----------
function addToCart(product, qty = 1) {
const existing = cart.find(i => i.id === product.id);

if (existing) existing.qty += qty;
else cart.push({ ...product, qty });

renderCart();
}

function renderCart() {
els.cartBody.innerHTML = cart.map(item => `     <tr>       <td>${item.name}</td>       <td>${item.qty}</td>       <td>${item.price}</td>       <td>${item.qty * item.price}</td>     </tr>
  `).join('');

updateTotals();
}

function updateTotals() {
const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
const discount = parseFloat(els.discountInput.value) || 0;
const total = subtotal - discount;

els.subtotalValue.textContent = "R$ " + subtotal;
els.totalValue.textContent = "R$ " + total;
}

// ---------- ADD BY CODE ----------
function addByCode() {
const code = els.productCode.value;
const product = products.find(p => p.id === code);

if (!product) return alert("Produto não encontrado");

addToCart(product, parseInt(els.addQty.value) || 1);
}

// ---------- COMPLETE SALE ----------
async function completeSale() {
if (cart.length === 0) return alert("Carrinho vazio");

const saleData = {
discount: parseFloat(els.discountInput.value) || 0,
items: cart.map(i => ({
productId: i.id,
quantity: i.qty
}))
};

console.log("Enviando:", saleData);

const res = await apiFetch("/sales", "POST", saleData);

if (!res) return;

alert("Venda realizada!");
cart = [];
renderCart();
}

// ---------- EVENTS ----------
$('#btnAddByCode').onclick = addByCode;
$('#btnSearch').onclick = performSearch;
$('#btnCompleteSale').onclick = completeSale;

els.searchResults.addEventListener("click", (e) => {
const item = e.target.closest(".search-result-item");
if (!item) return;

addToCart({
id: item.dataset.id,
name: item.dataset.name,
price: parseFloat(item.dataset.price)
});
});

// ---------- INIT ----------
async function init() {
await login();        // 🔥 garante token
await loadProducts(); // 🔥 depois carrega produtos
}

init();
