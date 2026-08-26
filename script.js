// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // close menu after tapping a link (mobile)
  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Flip cards: click or press Enter/Space to flip a product card and see
// ingredients + instructions on the back. Click/press again to flip back.
// (Guarded so pressing Enter/Space on the "Add to cart" button inside the
// card doesn't also flip the card — see the `e.target !== card` check below.)
document.querySelectorAll('.product-card').forEach((card) => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-pressed', 'false');

  const flip = () => {
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(isFlipped));
  };

  card.addEventListener('click', flip);
  card.addEventListener('keydown', (e) => {
    if (e.target !== card) return; // ignore keys on nested buttons like Add to cart
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flip();
    }
  });
});

// ============================================================
// CART
// ============================================================

// MOM: put your real usernames here so the payment buttons work.
// PayPal.me link format: https://paypal.me/YOURUSERNAME
// Venmo profile format:  https://venmo.com/u/YOURUSERNAME
const PAYPAL_USERNAME = 'YourPayPalUsername';
const VENMO_USERNAME = 'YourVenmoUsername';

// Where "Email my order" sends the order to — MOM: change this to your real inbox.
const ORDER_EMAIL = 'hello@example.com';

const CART_STORAGE_KEY = 'chrisk-health-cart-v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — cart just won't persist on reload.
  }
}

let cart = loadCart();

function addToCart(name, price, weight) {
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, weight, qty: 1 });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(name) {
  cart = cart.filter((item) => item.name !== name);
  saveCart();
  renderCart();
}

function setQty(name, qty) {
  if (qty <= 0) {
    removeFromCart(name);
    return;
  }
  const item = cart.find((i) => i.name === name);
  if (!item) return;
  item.qty = qty;
  saveCart();
  renderCart();
}

// SHIPPING RULES — MOM: edit the numbers below to change your shipping tiers.
// Weight is the total shipped weight (oz) of everything in the cart, from each
// product card's data-weight attribute in index.html.
function computeTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalWeightOz = cart.reduce((sum, item) => sum + item.weight * item.qty, 0);

  let shippingLabel = '—';
  let shippingCost = 0;
  let shippingKnown = true;

  if (cart.length > 0) {
    if (subtotal >= 80) {
      shippingLabel = 'Free';
      shippingCost = 0;
    } else if (totalWeightOz <= 8) {
      shippingLabel = '$9.00';
      shippingCost = 9;
    } else if (totalWeightOz <= 16) {
      shippingLabel = '$12.00';
      shippingCost = 12;
    } else {
      // Over 1 lb shipped weight — no tier defined yet, so ask rather than guess.
      shippingLabel = 'Contact us for a shipping quote';
      shippingCost = 0;
      shippingKnown = false;
    }
  }

  const total = subtotal + shippingCost;
  return { subtotal, totalWeightOz, shippingLabel, shippingCost, shippingKnown, total };
}

function formatMoney(n) {
  return '$' + n.toFixed(2);
}

function renderCart() {
  const itemsEl = document.getElementById('cartItems');
  const countEl = document.getElementById('cartCount');
  if (!itemsEl || !countEl) return;

  itemsEl.innerHTML = '';
  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cart-empty';
    empty.textContent = 'Your cart is empty.';
    itemsEl.appendChild(empty);
  } else {
    cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'cart-item';

      const info = document.createElement('div');
      const nameEl = document.createElement('p');
      nameEl.className = 'cart-item-name';
      nameEl.textContent = item.name;
      const priceEl = document.createElement('p');
      priceEl.className = 'cart-item-price';
      priceEl.textContent = formatMoney(item.price) + ' each';
      info.appendChild(nameEl);
      info.appendChild(priceEl);

      const qtyWrap = document.createElement('div');
      qtyWrap.className = 'cart-item-qty';
      const decBtn = document.createElement('button');
      decBtn.type = 'button';
      decBtn.className = 'qty-btn';
      decBtn.textContent = '-';
      decBtn.setAttribute('aria-label', 'Decrease quantity of ' + item.name);
      decBtn.addEventListener('click', () => setQty(item.name, item.qty - 1));
      const qtySpan = document.createElement('span');
      qtySpan.textContent = String(item.qty);
      const incBtn = document.createElement('button');
      incBtn.type = 'button';
      incBtn.className = 'qty-btn';
      incBtn.textContent = '+';
      incBtn.setAttribute('aria-label', 'Increase quantity of ' + item.name);
      incBtn.addEventListener('click', () => setQty(item.name, item.qty + 1));
      qtyWrap.appendChild(decBtn);
      qtyWrap.appendChild(qtySpan);
      qtyWrap.appendChild(incBtn);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'cart-item-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.setAttribute('aria-label', 'Remove ' + item.name + ' from cart');
      removeBtn.addEventListener('click', () => removeFromCart(item.name));

      row.appendChild(info);
      row.appendChild(qtyWrap);
      row.appendChild(removeBtn);
      itemsEl.appendChild(row);
    });
  }

  const totals = computeTotals();
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  if (subtotalEl) subtotalEl.textContent = formatMoney(totals.subtotal);
  if (shippingEl) shippingEl.textContent = totals.shippingLabel;
  if (totalEl) {
    totalEl.textContent = totals.shippingKnown
      ? formatMoney(totals.total)
      : formatMoney(totals.subtotal) + ' + shipping';
  }

  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  countEl.textContent = String(count);

  updatePaymentLinks(totals);
}

function updatePaymentLinks(totals) {
  const amount = totals.total.toFixed(2);
  const paypalBtn = document.getElementById('paypalBtn');
  const venmoBtn = document.getElementById('venmoBtn');
  if (paypalBtn) paypalBtn.href = `https://paypal.me/${PAYPAL_USERNAME}/${amount}`;
  if (venmoBtn) venmoBtn.href = `https://venmo.com/u/${VENMO_USERNAME}`;
}

function buildOrderSummary() {
  const totals = computeTotals();
  const name = (document.getElementById('custName') || {}).value || '';
  const email = (document.getElementById('custEmail') || {}).value || '';
  const addr1 = (document.getElementById('custAddress1') || {}).value || '';
  const addr2 = (document.getElementById('custAddress2') || {}).value || '';
  const city = (document.getElementById('custCity') || {}).value || '';
  const state = (document.getElementById('custState') || {}).value || '';
  const zip = (document.getElementById('custZip') || {}).value || '';

  const lines = [];
  lines.push('New order — Chris K. Health & Nutrition');
  lines.push('');
  lines.push('Items:');
  cart.forEach((item) => {
    lines.push(`  ${item.qty} x ${item.name} — ${formatMoney(item.price * item.qty)}`);
  });
  lines.push('');
  lines.push(`Subtotal: ${formatMoney(totals.subtotal)}`);
  lines.push(`Shipping: ${totals.shippingLabel}`);
  lines.push(
    totals.shippingKnown
      ? `Total: ${formatMoney(totals.total)}`
      : `Total: ${formatMoney(totals.subtotal)} + shipping (contact for quote)`
  );
  lines.push('');
  lines.push('Ship to:');
  lines.push(`  ${name}`);
  lines.push(`  ${addr1}${addr2 ? ', ' + addr2 : ''}`);
  lines.push(`  ${city}, ${state} ${zip}`);
  lines.push('');
  lines.push(`Customer email: ${email}`);
  return lines.join('\n');
}

function validateOrderForm() {
  const status = document.getElementById('cartFormStatus');
  if (cart.length === 0) {
    if (status) status.textContent = 'Your cart is empty — add something first.';
    return false;
  }
  const form = document.getElementById('checkoutForm');
  if (form && !form.checkValidity()) {
    form.reportValidity();
    return false;
  }
  return true;
}

// Wire up "Add to cart" buttons on each product card
document.querySelectorAll('.btn-add-cart').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // don't also flip the card
    const card = btn.closest('.product-card');
    if (!card) return;
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const weight = parseFloat(card.dataset.weight);
    addToCart(name, price, weight);
  });
});

// Cart open/close
const cartToggle = document.getElementById('cartToggle');
const cartPanel = document.getElementById('cartPanel');
const cartOverlay = document.getElementById('cartOverlay');
const cartClose = document.getElementById('cartClose');

function openCart() {
  if (!cartPanel || !cartOverlay || !cartToggle) return;
  cartPanel.classList.add('is-open');
  cartOverlay.classList.add('is-open');
  cartPanel.setAttribute('aria-hidden', 'false');
  cartToggle.setAttribute('aria-expanded', 'true');
}

function closeCart() {
  if (!cartPanel || !cartOverlay || !cartToggle) return;
  cartPanel.classList.remove('is-open');
  cartOverlay.classList.remove('is-open');
  cartPanel.setAttribute('aria-hidden', 'true');
  cartToggle.setAttribute('aria-expanded', 'false');
}

if (cartToggle) {
  cartToggle.addEventListener('click', () => {
    if (cartPanel && cartPanel.classList.contains('is-open')) {
      closeCart();
    } else {
      openCart();
    }
  });
}
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Email / copy order details
const emailOrderBtn = document.getElementById('emailOrderBtn');
if (emailOrderBtn) {
  emailOrderBtn.addEventListener('click', () => {
    if (!validateOrderForm()) return;
    const summary = buildOrderSummary();
    const subject = encodeURIComponent('New order — Chris K. Health & Nutrition');
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:${ORDER_EMAIL}?subject=${subject}&body=${body}`;
    const status = document.getElementById('cartFormStatus');
    if (status) status.textContent = 'Opening your email app…';
  });
}

const copyOrderBtn = document.getElementById('copyOrderBtn');
if (copyOrderBtn) {
  copyOrderBtn.addEventListener('click', async () => {
    if (!validateOrderForm()) return;
    const summary = buildOrderSummary();
    const status = document.getElementById('cartFormStatus');
    try {
      await navigator.clipboard.writeText(summary);
      if (status) status.textContent = 'Order details copied — paste them into a message to us, or your PayPal/Venmo note.';
    } catch (e) {
      if (status) status.textContent = 'Could not copy automatically — please select and copy the summary manually.';
    }
  });
}

// Initial render on page load (also restores any cart saved from a previous visit)
renderCart();
