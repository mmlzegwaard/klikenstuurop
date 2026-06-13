// ─── Productdata ────────────────────────────────────────────────────────────
const ROOM_IMAGE =
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80';

const products = [
  {
    id: 1,
    name: 'Leren Bank',
    price: 1299,
    category: 'Zitmeubelen',
    description:
      'Een luxueuze driezitsbank van vol anilineleer in cognacbruin. Tijdloos design met handgestikte details en massief houten poten. Afmeting: 230 × 90 × 85 cm.',
    clipPath: 'polygon(8% 25%, 72% 25%, 72% 82%, 8% 82%)',
    focusX: '35%',
    focusY: '52%',
  },
  {
    id: 2,
    name: 'Glazen Salontafel',
    price: 449,
    category: 'Tafels',
    description:
      'Ronde salontafel met gehard glazen blad (Ø 90 cm) en goudkleurig stalen frame. Strak, modern design dat licht doorlaat en elke woonkamer ruimtelijker maakt.',
    clipPath: 'polygon(22% 62%, 65% 62%, 65% 94%, 22% 94%)',
    focusX: '45%',
    focusY: '78%',
  },
  {
    id: 3,
    name: 'Staande Lamp',
    price: 189,
    category: 'Verlichting',
    description:
      'Slanke booglamp met verstelbare arm en naturellinnen lampenkap. Voorzien van dimmer. Hoogte: ca. 180 cm. Past perfect naast een bank of in een leeshoek.',
    clipPath: 'polygon(0% 0%, 16% 0%, 16% 88%, 0% 88%)',
    focusX: '7%',
    focusY: '40%',
  },
  {
    id: 4,
    name: 'Wollen Vloerkleed',
    price: 349,
    category: 'Vloerkleden',
    description:
      'Handgeweven vloerkleed van 100 % scheerwol in warme aardetinten. Afmeting: 200 × 300 cm. Antislip onderzijde inbegrepen. Gemakkelijk te reinigen.',
    clipPath: 'polygon(0% 79%, 100% 79%, 100% 100%, 0% 100%)',
    focusX: '50%',
    focusY: '90%',
  },
  {
    id: 5,
    name: 'Sierkussen Set',
    price: 59,
    category: 'Accessoires',
    description:
      'Set van 2 sierkussens met afneembare hoezen in een mix van linnen en fluweel. Maat: 45 × 45 cm. Verkrijgbaar in oker, terracotta en saliegroen.',
    clipPath: 'polygon(8% 30%, 50% 30%, 50% 64%, 8% 64%)',
    focusX: '28%',
    focusY: '47%',
  },
  {
    id: 6,
    name: 'Wandkast',
    price: 799,
    category: 'Kasten',
    description:
      'Moderne wandkast met open vakken en gesloten compartimenten. Massief eiken fineer, mat zwarte grepen. Breedte: 160 cm, hoogte: 200 cm. Incl. montageset.',
    clipPath: 'polygon(75% 10%, 100% 10%, 100% 90%, 75% 90%)',
    focusX: '87%',
    focusY: '48%',
  },
  {
    id: 7,
    name: 'Kamerplant in Pot',
    price: 89,
    category: 'Planten',
    description:
      'Grote Monstera deliciosa in een handgemaakte terracottapot. Totale hoogte ca. 80 cm. Geleverd volledig beworteld en gezond. Ideaal voor lichte ruimtes.',
    clipPath: 'polygon(82% 5%, 100% 5%, 100% 68%, 82% 68%)',
    focusX: '90%',
    focusY: '35%',
  },
  {
    id: 8,
    name: 'Wandschilderij',
    price: 149,
    category: 'Wanddecoratie',
    description:
      'Abstract kunstdruk op museum-canvas. Rijke textuur door giclée-techniek. Formaat: 80 × 100 cm, inclusief zwarte houten lijst. Klaar om op te hangen.',
    clipPath: 'polygon(28% 0%, 68% 0%, 68% 28%, 28% 28%)',
    focusX: '48%',
    focusY: '12%',
  },
];

// ─── Cart helpers (localStorage) ────────────────────────────────────────────
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, qty) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty });
  }
  saveCart(cart);
}

function removeFromCart(productId) {
  saveCart(getCart().filter((i) => i.id !== productId));
}

function updateQty(productId, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.qty = qty;
    if (item.qty <= 0) return removeFromCart(productId);
    saveCart(cart);
  }
}

function cartTotal() {
  return getCart().reduce((sum, item) => {
    const p = products.find((pr) => pr.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function formatPrice(cents) {
  return '€\u202f' + cents.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Navigation badge ────────────────────────────────────────────────────────
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = cartCount();
  badge.textContent = count;
  badge.hidden = count === 0;
}

// ─── Homepage ────────────────────────────────────────────────────────────────
function initHome() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = products
    .map(
      (p) => `
    <article class="product-card">
      <a href="product.html?id=${p.id}" class="product-card-link">
        <div class="product-card-image">
          <img
            src="${ROOM_IMAGE}"
            alt="${p.name}"
            style="transform-origin:${p.focusX} ${p.focusY}"
            loading="lazy"
          />
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${p.category}</span>
          <h2 class="product-card-name">${p.name}</h2>
          <p class="product-card-price">${formatPrice(p.price)}</p>
        </div>
      </a>
      <button class="btn btn-primary" onclick="quickAdd(${p.id})">
        In winkelwagen
      </button>
    </article>`
    )
    .join('');
  updateCartBadge();
}

function quickAdd(id) {
  addToCart(id, 1);
  updateCartBadge();
  showToast('Toegevoegd aan winkelwagen');
}

// ─── Detail page ─────────────────────────────────────────────────────────────
function initDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const product = products.find((p) => p.id === id);
  if (!product) {
    document.getElementById('detail-root').innerHTML =
      '<p class="error">Product niet gevonden. <a href="index.html">Terug naar overzicht</a></p>';
    return;
  }

  document.title = product.name + ' — Klik & Stuurop';

  const root = document.getElementById('detail-root');
  root.innerHTML = `
    <div class="detail-layout">
      <div class="detail-image-col">
        <div class="room-highlight-wrapper">
          <img class="room-bg" src="${ROOM_IMAGE}" alt="Woonkamer" />
          <img
            class="room-highlight"
            src="${ROOM_IMAGE}"
            alt="${product.name} uitgelicht"
            style="clip-path:${product.clipPath}"
          />
          <div class="highlight-label">${product.name}</div>
        </div>
      </div>
      <div class="detail-info-col">
        <span class="product-card-category">${product.category}</span>
        <h1 class="detail-name">${product.name}</h1>
        <p class="detail-price">${formatPrice(product.price)}</p>
        <p class="detail-description">${product.description}</p>
        <div class="detail-actions">
          <div class="qty-control">
            <button class="qty-btn" id="qty-dec">−</button>
            <input class="qty-input" id="qty" type="number" value="1" min="1" max="99" />
            <button class="qty-btn" id="qty-inc">+</button>
          </div>
          <button class="btn btn-primary btn-large" id="add-to-cart-btn">
            In winkelwagen
          </button>
        </div>
        <a href="index.html" class="back-link">← Terug naar overzicht</a>
      </div>
    </div>`;

  const qtyInput = document.getElementById('qty');
  document.getElementById('qty-dec').addEventListener('click', () => {
    if (parseInt(qtyInput.value, 10) > 1) qtyInput.value--;
  });
  document.getElementById('qty-inc').addEventListener('click', () => {
    qtyInput.value++;
  });
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    addToCart(product.id, qty);
    updateCartBadge();
    showToast(`${product.name} toegevoegd aan winkelwagen`);
  });

  updateCartBadge();
}

// ─── Cart page ───────────────────────────────────────────────────────────────
function initCart() {
  const root = document.getElementById('cart-root');
  if (!root) return;

  function render() {
    const cart = getCart();
    if (cart.length === 0) {
      root.innerHTML = `
        <div class="cart-empty">
          <p>Je winkelwagen is leeg.</p>
          <a href="index.html" class="btn btn-primary">Verder winkelen</a>
        </div>`;
      updateCartBadge();
      return;
    }

    const rows = cart.map((item) => {
      const p = products.find((pr) => pr.id === item.id);
      if (!p) return '';
      return `
        <tr>
          <td>
            <div class="cart-product-cell">
              <div class="cart-thumb">
                <img
                  src="${ROOM_IMAGE}"
                  alt="${p.name}"
                  style="transform-origin:${p.focusX} ${p.focusY}"
                />
              </div>
              <a href="product.html?id=${p.id}">${p.name}</a>
            </div>
          </td>
          <td>${formatPrice(p.price)}</td>
          <td>
            <div class="qty-control">
              <button class="qty-btn" onclick="changeQty(${p.id}, ${item.qty - 1})">−</button>
              <span class="qty-display">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty(${p.id}, ${item.qty + 1})">+</button>
            </div>
          </td>
          <td>${formatPrice(p.price * item.qty)}</td>
          <td>
            <button class="btn-remove" onclick="deleteItem(${p.id})" title="Verwijderen">✕</button>
          </td>
        </tr>`;
    }).join('');

    const total = cartTotal();
    root.innerHTML = `
      <table class="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Prijs</th>
            <th>Aantal</th>
            <th>Subtotaal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="cart-footer">
        <a href="index.html" class="btn btn-secondary">← Verder winkelen</a>
        <div class="cart-total-block">
          <div class="cart-total-line">
            <span>Subtotaal</span><span>${formatPrice(total)}</span>
          </div>
          <div class="cart-total-line">
            <span>Verzendkosten</span><span>${total >= 750 ? 'Gratis' : formatPrice(4.99)}</span>
          </div>
          <div class="cart-total-line cart-total-grand">
            <span>Totaal</span><span>${formatPrice(total >= 750 ? total : total + 4.99)}</span>
          </div>
          <a href="checkout.html" class="btn btn-primary btn-large">Naar afrekenen →</a>
        </div>
      </div>`;
    updateCartBadge();
  }

  window.changeQty = (id, qty) => { updateQty(id, qty); render(); };
  window.deleteItem = (id) => { removeFromCart(id); render(); };

  render();
}

// ─── Checkout page ───────────────────────────────────────────────────────────
function initCheckout() {
  const summaryEl = document.getElementById('order-summary');
  const formEl = document.getElementById('checkout-form');
  if (!summaryEl || !formEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    summaryEl.innerHTML = '<p>Je winkelwagen is leeg. <a href="index.html">Terug naar shop</a></p>';
  } else {
    const rows = cart.map((item) => {
      const p = products.find((pr) => pr.id === item.id);
      if (!p) return '';
      return `<tr><td>${p.name}</td><td>× ${item.qty}</td><td>${formatPrice(p.price * item.qty)}</td></tr>`;
    }).join('');
    const total = cartTotal();
    const shipping = total >= 750 ? 0 : 4.99;
    summaryEl.innerHTML = `
      <table class="summary-table">
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="2">Verzendkosten</td><td>${shipping === 0 ? 'Gratis' : formatPrice(shipping)}</td></tr>
          <tr class="summary-grand"><td colspan="2"><strong>Totaal</strong></td><td><strong>${formatPrice(total + shipping)}</strong></td></tr>
        </tfoot>
      </table>`;
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCart([]);
    updateCartBadge();
    document.getElementById('checkout-success').hidden = false;
    document.getElementById('checkout-layout').hidden = true;
    document.getElementById('checkout-heading').hidden = true;
  });

  updateCartBadge();
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('toast-show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('toast-show'), 2500);
}
