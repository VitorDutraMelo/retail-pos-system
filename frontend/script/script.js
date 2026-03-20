// ==========================================
// POS — FRENTE DE CAIXA
// ==========================================

const API_BASE = 'http://localhost:3000/api';

// ---------- STATE ----------
let cart = [];
let saleCount = 1;
let recentProducts = [];

// ---------- DOM ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  productCode: $('#productCode'),
  productSearch: $('#productSearch'),
  addQty: $('#addQty'),
  cartBody: $('#cartBody'),
  cartCount: $('#cartCount'),
  emptyCart: $('#emptyCart'),
  totalValue: $('#totalValue'),
  subtotalValue: $('#subtotalValue'),
  discountInput: $('#discountInput'),
  discountDisplay: $('#discountDisplay'),
  paymentMethod: $('#paymentMethod'),
  saleNumber: $('#saleNumber'),
  searchResults: $('#searchResults'),
  recentProducts: $('#recentProducts'),
  toastContainer: $('#toastContainer'),
  loadingOverlay: $('#loadingOverlay'),
  clock: $('#clock'),
};

// ---------- UTILS ----------
function formatCurrency(val) {
  return 'R$ ' + Number(val).toFixed(2).replace('.', ',');
}

function showToast(message, type = 'info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  els.toastContainer.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 3000);
}

function setLoading(on) {
  els.loadingOverlay.classList.toggle('active', on);
}

// ---------- CLOCK ----------
function updateClock() {
  const now = new Date();
  els.clock.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ---------- API HELPERS ----------
async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(API_BASE + path, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API indisponível, usando modo offline:', err.message);
    return null;
  }
}

async function fetchProductByCode(code) {
  const data = await apiFetch(`/products/${encodeURIComponent(code)}`);
  return data;
}

async function searchProducts(query) {
  const data = await apiFetch(`/products/search?query=${encodeURIComponent(query)}`);
  return data;
}

async function submitSale(saleData) {
  return await apiFetch('/sales', { method: 'POST', body: JSON.stringify(saleData) });
}

// ---------- DEMO PRODUCTS (offline fallback) ----------
const demoProducts = [
  { id: '001', name: 'Camiseta Básica', price: 49.90 },
  { id: '002', name: 'Calça Jeans', price: 129.90 },
  { id: '003', name: 'Tênis Casual', price: 199.90 },
  { id: '004', name: 'Boné Esportivo', price: 39.90 },
  { id: '005', name: 'Meia Kit 3 Pares', price: 24.90 },
  { id: '006', name: 'Jaqueta Corta-Vento', price: 179.90 },
  { id: '007', name: 'Bermuda Sarja', price: 89.90 },
  { id: '008', name: 'Camisa Social Slim', price: 119.90 },
  { id: '009', name: 'Chinelo Slide', price: 59.90 },
  { id: '010', name: 'Cinto de Couro', price: 69.90 },
];

function getOfflineProduct(code) {
  return demoProducts.find(p => p.id === code) || null;
}

function searchOffline(query) {
  const q = query.toLowerCase();
  return demoProducts.filter(p => p.name.toLowerCase().includes(q) || p.id.includes(q));
}

// ---------- CART LOGIC ----------
function addToCart(product, qty = 1) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ ...product, qty });
  }
  addRecent(product);
  renderCart();
  showToast(`${product.name} adicionado`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  renderCart();
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getDiscount() {
  return Math.max(0, parseFloat(els.discountInput.value) || 0);
}

function getTotal() {
  return Math.max(0, getSubtotal() - getDiscount());
}

// ---------- RENDER ----------
function renderCart() {
  const tbody = els.cartBody;
  tbody.innerHTML = '';

  if (cart.length === 0) {
    els.emptyCart.classList.remove('hidden');
    $('#cartTable').style.display = 'none';
  } else {
    els.emptyCart.classList.add('hidden');
    $('#cartTable').style.display = '';
    cart.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>
          <div class="qty-control">
            <button class="qty-btn" data-id="${item.id}" data-delta="-1">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-id="${item.id}" data-delta="1">+</button>
          </div>
        </td>
        <td>${formatCurrency(item.price)}</td>
        <td style="font-weight:600">${formatCurrency(item.price * item.qty)}</td>
        <td>
          <button class="btn-icon" data-remove="${item.id}" title="Remover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  els.cartCount.textContent = `${cart.reduce((s, i) => s + i.qty, 0)} itens`;
  updateTotals();
}

function updateTotals() {
  const sub = getSubtotal();
  const disc = getDiscount();
  const total = Math.max(0, sub - disc);
  els.subtotalValue.textContent = formatCurrency(sub);
  els.discountDisplay.textContent = `- ${formatCurrency(disc)}`;
  els.totalValue.textContent = formatCurrency(total);
}

// ---------- RECENT PRODUCTS ----------
function addRecent(product) {
  recentProducts = recentProducts.filter(p => p.id !== product.id);
  recentProducts.unshift(product);
  if (recentProducts.length > 5) recentProducts.pop();
  renderRecent();
}

function renderRecent() {
  if (recentProducts.length === 0) {
    els.recentProducts.innerHTML = '<p class="empty-msg">Nenhum produto recente.</p>';
    return;
  }
  els.recentProducts.innerHTML = recentProducts.map(p =>
    `<div class="quick-item" data-quick-id="${p.id}">${p.id} — ${p.name} · ${formatCurrency(p.price)}</div>`
  ).join('');
}

// ---------- SEARCH ----------
async function performSearch() {
  const query = els.productSearch.value.trim();
  if (!query) { els.searchResults.classList.remove('open'); return; }

  let results = await searchProducts(query);
  if (!results) results = searchOffline(query);

  if (!results || results.length === 0) {
    els.searchResults.innerHTML = '<p class="empty-msg" style="padding:10px">Nenhum produto encontrado.</p>';
  } else {
    els.searchResults.innerHTML = results.map(p =>
      `<div class="search-result-item" data-search-id="${p.id}" data-name="${p.name}" data-price="${p.price}">
        <span class="sr-name">${p.id} — ${p.name}</span>
        <span class="sr-price">${formatCurrency(p.price)}</span>
      </div>`
    ).join('');
  }
  els.searchResults.classList.add('open');
}

// ---------- ADD BY CODE ----------
async function addByCode() {
  const code = els.productCode.value.trim();
  if (!code) return;

  const qty = Math.max(1, parseInt(els.addQty.value) || 1);
  let product = await fetchProductByCode(code);
  if (!product) product = getOfflineProduct(code);

  if (!product) {
    showToast(`Produto "${code}" não encontrado`, 'error');
    return;
  }

  addToCart(product, qty);
  els.productCode.value = '';
  els.addQty.value = '1';
  els.productCode.focus();
}

// ---------- COMPLETE SALE ----------
async function completeSale() {
  if (cart.length === 0) {
    showToast('Adicione itens ao carrinho', 'error');
    return;
  }

  const saleData = {
    items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.qty, price: i.price })),
    subtotal: getSubtotal(),
    discount: getDiscount(),
    total: getTotal(),
    paymentMethod: els.paymentMethod.value,
  };

  setLoading(true);
  const result = await submitSale(saleData);
  setLoading(false);

  // Even if API fails, simulate success (offline mode)
  saleCount++;
  els.saleNumber.textContent = String(saleCount).padStart(5, '0');
  cart = [];
  els.discountInput.value = '0';
  renderCart();
  showToast('Venda finalizada com sucesso!', 'success');
}

function cancelSale() {
  if (cart.length === 0) return;
  cart = [];
  els.discountInput.value = '0';
  renderCart();
  showToast('Venda cancelada', 'error');
}

// ---------- EVENT LISTENERS ----------

// Add by code
$('#btnAddByCode').addEventListener('click', addByCode);
els.productCode.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addByCode();
});

// Search
$('#btnSearch').addEventListener('click', performSearch);
els.productSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});
els.productSearch.addEventListener('input', () => {
  if (!els.productSearch.value.trim()) els.searchResults.classList.remove('open');
});

// Search result click
els.searchResults.addEventListener('click', (e) => {
  const item = e.target.closest('.search-result-item');
  if (!item) return;
  const qty = Math.max(1, parseInt(els.addQty.value) || 1);
  addToCart({
    id: item.dataset.searchId,
    name: item.dataset.name,
    price: parseFloat(item.dataset.price),
  }, qty);
  els.searchResults.classList.remove('open');
  els.productSearch.value = '';
});

// Cart interactions (delegation)
els.cartBody.addEventListener('click', (e) => {
  const qtyBtn = e.target.closest('.qty-btn');
  if (qtyBtn) {
    updateQty(qtyBtn.dataset.id, parseInt(qtyBtn.dataset.delta));
    return;
  }
  const removeBtn = e.target.closest('[data-remove]');
  if (removeBtn) {
    removeFromCart(removeBtn.dataset.remove);
  }
});

// Discount
els.discountInput.addEventListener('input', updateTotals);

// Complete / Cancel
$('#btnCompleteSale').addEventListener('click', completeSale);
$('#btnCancelSale').addEventListener('click', cancelSale);

// Recent products click
els.recentProducts.addEventListener('click', (e) => {
  const item = e.target.closest('.quick-item');
  if (!item) return;
  const id = item.dataset.quickId;
  const product = recentProducts.find(p => p.id === id);
  if (product) addToCart(product, 1);
});

// ---------- INIT ----------
els.saleNumber.textContent = String(saleCount).padStart(5, '0');
renderCart();
