const STORAGE_KEYS = {
  backendUrl: 'frogmarket_backend_url',
  apiKey: 'frogmarket_api_key',
  remember: 'frogmarket_remember_settings',
};

const products = [
  {
    id: 'starter-box',
    name: 'Starter Box',
    description: 'Kit inicial para validar FrogPay con una compra pequeña y rápida.',
    price: 19.9,
    tag: 'Popular',
  },
  {
    id: 'pro-subscription',
    name: 'Suscripción Pro',
    description: 'Cobro de prueba para validar planes y límites mensuales.',
    price: 49,
    tag: 'SaaS',
  },
  {
    id: 'store-addon',
    name: 'Add-on de tienda',
    description: 'Producto auxiliar para probar montos, moneda y metadatos.',
    price: 14.5,
    tag: 'Extra',
  },
  {
    id: 'support-pack',
    name: 'Support Pack',
    description: 'Pack de soporte para comprobar aprobaciones y errores del proveedor.',
    price: 9.75,
    tag: 'Test',
  },
];

const state = {
  cart: loadCart(),
  settings: loadSettings(),
  lastResult: null,
};

const catalogEl = document.getElementById('catalog');
const cartItemsEl = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const totalEl = document.getElementById('total');
const cartCountEl = document.getElementById('cart-count');
const providerSelect = document.getElementById('provider-select');
const cardTokenInput = document.getElementById('card-token');
const checkoutForm = document.getElementById('checkout-form');
const resultStatusEl = document.getElementById('result-status');
const resultBodyEl = document.getElementById('result-body');
const payButton = document.getElementById('pay-button');
const clearCartButton = document.getElementById('clear-cart');
const rememberCheckbox = document.getElementById('remember-settings');

applySettingsToForm();
renderCatalog();
renderCart();
bindEvents();
updateCardTokenVisibility();

function currency(amount) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function loadCart() {
  try {
    const saved = localStorage.getItem('frogmarket_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (_error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('frogmarket_cart', JSON.stringify(state.cart));
}

function loadSettings() {
  return {
    backendUrl: localStorage.getItem(STORAGE_KEYS.backendUrl) || 'http://localhost:3000',
    apiKey: localStorage.getItem(STORAGE_KEYS.apiKey) || '',
    remember: localStorage.getItem(STORAGE_KEYS.remember) !== 'false',
  };
}

function saveSettings(settings) {
  if (settings.remember) {
    localStorage.setItem(STORAGE_KEYS.backendUrl, settings.backendUrl);
    localStorage.setItem(STORAGE_KEYS.apiKey, settings.apiKey);
    localStorage.setItem(STORAGE_KEYS.remember, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.backendUrl);
    localStorage.removeItem(STORAGE_KEYS.apiKey);
    localStorage.setItem(STORAGE_KEYS.remember, 'false');
  }
}

function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

function getCartLine(productId) {
  return state.cart.find((item) => item.productId === productId);
}

function addProduct(productId) {
  const line = getCartLine(productId);
  if (line) {
    line.quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function changeQuantity(productId, delta) {
  const line = getCartLine(productId);
  if (!line) {
    return;
  }

  line.quantity += delta;
  state.cart = state.cart.filter((item) => item.quantity > 0);
  saveCart();
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart();
  renderCart();
}

function getTotals() {
  const items = state.cart.map((line) => {
    const product = findProduct(line.productId);
    return {
      ...product,
      quantity: line.quantity,
      lineTotal: product.price * line.quantity,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, subtotal, total: subtotal };
}

function renderCatalog() {
  catalogEl.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-top">
            <div>
              <div class="tag">${product.tag}</div>
              <h3 class="product-title">${product.name}</h3>
            </div>
            <div class="price">${currency(product.price)}</div>
          </div>
          <p class="product-description">${product.description}</p>
          <button class="add-button" type="button" data-add="${product.id}">Agregar <strong>+</strong></button>
        </article>
      `,
    )
    .join('');

  catalogEl.querySelectorAll('[data-add]').forEach((button) => {
    button.addEventListener('click', () => addProduct(button.dataset.add));
  });
}

function renderCart() {
  const { items, subtotal, total } = getTotals();
  cartItemsEl.innerHTML = '';

  if (!items.length) {
    cartItemsEl.innerHTML = `
      <div class="cart-item">
        <div>
          <strong>Tu carrito está vacío</strong>
          <small>Agrega un producto para comenzar la prueba con FrogPay.</small>
        </div>
      </div>
    `;
  } else {
    items.forEach((item) => {
      const element = document.createElement('div');
      element.className = 'cart-item';
      element.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <small>${item.quantity} x ${currency(item.price)} · ${currency(item.lineTotal)}</small>
        </div>
        <div class="quantity-controls">
          <button class="icon-button" type="button" data-action="decrease" data-id="${item.id}">−</button>
          <span>${item.quantity}</span>
          <button class="icon-button" type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
      `;
      cartItemsEl.appendChild(element);
    });

    cartItemsEl.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const delta = button.dataset.action === 'increase' ? 1 : -1;
        changeQuantity(button.dataset.id, delta);
      });
    });
  }

  subtotalEl.textContent = currency(subtotal);
  totalEl.textContent = currency(total);
  cartCountEl.textContent = `${items.reduce((sum, item) => sum + item.quantity, 0)} items`;
}

function applySettingsToForm() {
  checkoutForm.backendUrl.value = state.settings.backendUrl;
  checkoutForm.apiKey.value = state.settings.apiKey;
  rememberCheckbox.checked = state.settings.remember;
}

function bindEvents() {
  clearCartButton.addEventListener('click', clearCart);

  providerSelect.addEventListener('change', updateCardTokenVisibility);

  rememberCheckbox.addEventListener('change', () => {
    state.settings.remember = rememberCheckbox.checked;
    saveSettings(state.settings);
  });

  checkoutForm.backendUrl.addEventListener('input', () => {
    state.settings.backendUrl = checkoutForm.backendUrl.value.trim() || 'http://localhost:3000';
    if (state.settings.remember) {
      saveSettings(state.settings);
    }
  });

  checkoutForm.apiKey.addEventListener('input', () => {
    state.settings.apiKey = checkoutForm.apiKey.value.trim();
    if (state.settings.remember) {
      saveSettings(state.settings);
    }
  });

  checkoutForm.addEventListener('submit', handleCheckout);
}

function updateCardTokenVisibility() {
  const visible = providerSelect.value === 'card';
  cardTokenInput.closest('label').style.display = visible ? 'block' : 'none';
}

function setResult(type, title, payload) {
  resultStatusEl.className = `status ${type}`;
  resultStatusEl.textContent = title;
  resultBodyEl.textContent = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
}

async function handleCheckout(event) {
  event.preventDefault();

  const { items, total } = getTotals();
  if (!items.length) {
    setResult('error', 'Carrito vacío', 'Agrega productos antes de intentar el cobro.');
    return;
  }

  const formData = new FormData(checkoutForm);
  const backendUrl = String(formData.get('backendUrl') || 'http://localhost:3000').replace(/\/$/, '');
  const apiKey = String(formData.get('apiKey') || '').trim();
  const provider = String(formData.get('provider') || 'card');
  const customerName = String(formData.get('customerName') || '').trim();
  const customerEmail = String(formData.get('customerEmail') || '').trim();
  const cardToken = String(formData.get('cardToken') || '').trim();

  if (!apiKey) {
    setResult('error', 'API key requerida', 'Pega la API key real del tenant antes de cobrar.');
    return;
  }

  payButton.disabled = true;
  payButton.textContent = 'Procesando...';
  setResult('neutral', 'Enviando request', 'Conectando con FrogPay...');

  const idempotencyKey = `store_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const payload = {
    provider,
    amount: Number(total.toFixed(2)),
    currency: 'USD',
    description: `Pedido FrogMarket - ${customerName || 'Cliente demo'}`,
    idempotencyKey,
    metadata: {
      customerName,
      customerEmail,
      items,
      store: 'FrogMarket',
    },
  };

  if (provider === 'card') {
    payload.card_token = cardToken || '4242424242424242';
  }

  try {
    const response = await fetch(`${backendUrl}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`);
    }

    state.lastResult = data;
    setResult('success', 'Pago aprobado', data);
  } catch (error) {
    setResult('error', 'Pago rechazado', {
      message: error.message || 'No se pudo completar el pago',
      backendUrl,
    });
  } finally {
    payButton.disabled = false;
    payButton.textContent = 'Pagar con FrogPay';
  }
}
