const STORAGE_KEYS = {
  backendUrl: 'tamiga_backend_url',
  apiKey: 'tamiga_api_key',
  remember: 'tamiga_remember_settings',
};

const products = [
  {
    id: 'refri-inverter',
    name: 'Refrigerador Inverter 300L',
    description: 'Refrigerador eficiente con tecnología inverter y dispensador de agua.',
    price: 450.0,
    tag: 'Popular',
  },
  {
    id: 'lavasca-10kg',
    name: 'Lavadora Automática 10kg',
    description: 'Lavadora de carga superior con 12 ciclos de lavado y eco-friendly.',
    price: 320.0,
    tag: 'Hogar',
  },
  {
    id: 'microondas-20l',
    name: 'Microondas Digital 20L',
    description: 'Microondas rápido y compacto, con modos de descongelación efectivos.',
    price: 85.0,
    tag: 'Extra',
  },
  {
    id: 'licuadora-pro',
    name: 'Licuadora Pro 800W',
    description: 'Licuadora de alta potencia con vaso de vidrio resistente al calor.',
    price: 45.0,
    tag: 'Básico',
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
const qrSection = document.getElementById('qr-section');
const qrImage = document.getElementById('qr-image');
const qrConfirmLink = document.getElementById('qr-confirm-link');
const paypalSection = document.getElementById('paypal-section');
const paypalApproveLink = document.getElementById('paypal-approve-link');
const checkoutForm = document.getElementById('checkout-form');
const payButton = document.getElementById('pay-button');
const clearCartButton = document.getElementById('clear-cart');
const rememberCheckbox = document.getElementById('remember-settings');
const successModal = document.getElementById('success-modal');
const closeSuccessModalBtn = document.getElementById('close-successModal');

// applySettingsToForm();
renderCatalog();
renderCart();
bindEvents();
updateCardTokenVisibility();
resumePaypalPolling();

function currency(amount) {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function loadCart() {
  try {
    const saved = localStorage.getItem('tamiga_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (_error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('tamiga_cart', JSON.stringify(state.cart));
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
          <small>Agrega un producto para comenzar tu compra en T-Amiga.</small>
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
  if (rememberCheckbox) rememberCheckbox.checked = state.settings.remember;
}

function bindEvents() {
  clearCartButton.addEventListener('click', clearCart);

  providerSelect.addEventListener('change', () => {
    updateCardTokenVisibility();
    hideQrSection();
  });

  if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', () => {
      state.settings.remember = rememberCheckbox.checked;
      saveSettings(state.settings);
    });
  }

  if (closeSuccessModalBtn) {
    closeSuccessModalBtn.addEventListener('click', () => {
      if (successModal) successModal.style.display = 'none';
      window.scrollTo(0, 0);
    });
  }

  checkoutForm.addEventListener('submit', handleCheckout);
}

function showSuccess() {
  const modal = document.getElementById('success-modal');
  if (modal) {
    modal.style.setProperty('display', 'flex', 'important');
    modal.style.zIndex = '2147483647';
  } else {
    alert('✅ ¡Pago Exitoso! Tu compra se ha completado correctamente en T-Amiga.');
  }
  clearCart();
}

function updateCardTokenVisibility() {
  const visible = providerSelect.value === 'card';
  cardTokenInput.closest('label').style.display = visible ? 'block' : 'none';
}

function showQrPayment(qrCode, qrUrl) {
  if (!qrCode || !qrUrl) return;
  qrImage.src = qrCode;
  qrConfirmLink.href = qrUrl;
  qrSection.style.display = 'block';
}

function hideQrSection() {
  qrSection.style.display = 'none';
  qrImage.src = '';
  qrConfirmLink.href = '#';
}

function showPaypalApproval(approvalUrl) {
  if (!approvalUrl) return;
  paypalApproveLink.href = approvalUrl;
  paypalSection.style.display = 'block';
}

function hidePaypalSection() {
  paypalSection.style.display = 'none';
  paypalApproveLink.href = '#';
}

function setResult(type, title, payload) {
  console.log(`[${type.toUpperCase()}] ${title}`, payload);
  if (type === 'error') {
     alert(title + (typeof payload === 'string' ? ': ' + payload : ''));
  }
}

async function handleCheckout(event) {
  event.preventDefault();

  const { items, total } = getTotals();
  if (!items.length) {
    setResult('error', 'Carrito vacío', 'Agrega productos antes de intentar el cobro.');
    return;
  }

  const formData = new FormData(checkoutForm);
  const backendUrl = 'http://localhost:3000';
  const apiKey = '7b61be9beda74f349979a91956f4a56ed387dee251105fc54f23b0df0cce1f9c';
  const provider = String(formData.get('provider') || 'card');
  const customerName = String(formData.get('customerName') || '').trim();
  const customerEmail = String(formData.get('customerEmail') || '').trim();
  const cardToken = String(formData.get('cardToken') || '').trim();

  payButton.disabled = true;
  payButton.textContent = 'Procesando...';
  hideQrSection();
  hidePaypalSection();
  setResult('neutral', 'Enviando request', 'Conectando con T-Amiga...');

  const idempotencyKey = `tamiga_store_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  const payload = {
    provider,
    amount: Number(total.toFixed(2)),
    currency: 'USD',
    description: `Pedido T-Amiga - ${customerName || 'Cliente demo'}`,
    idempotencyKey,
    metadata: {
      customerName,
      customerEmail,
      items,
      store: 'T-Amiga',
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

    if (provider === 'paypal' && data.paypal_approval_url) {
      setResult('neutral', 'Redirigiendo a PayPal...', { payment_id: data.payment_id, estado: data.estado });
      showPaypalApproval(data.paypal_approval_url);
      sessionStorage.setItem('paypal_pending', JSON.stringify({
        payment_id: data.payment_id,
        backendUrl,
        apiKey,
      }));
      window.location.href = data.paypal_approval_url;
    } else if (provider === 'qr' && data.qr_code && data.qr_url) {
      setResult('neutral', 'QR generado — escanea para confirmar', { payment_id: data.payment_id, estado: data.estado });
      showQrPayment(data.qr_code, data.qr_url);
      startQrPolling(data.payment_id, backendUrl, apiKey);
    } else {
      setResult('success', 'Pago aprobado', data);
      showSuccess();
    }
  } catch (error) {
    setResult('error', 'Pago rechazado', {
      message: error.message || 'No se pudo completar el pago',
      backendUrl,
    });
  } finally {
    payButton.disabled = false;
    payButton.textContent = 'Pagar en T-Amiga';
  }
}

function resumePaypalPolling() {
  const raw = sessionStorage.getItem('paypal_pending');
  if (!raw) return;

  let ctx;
  try { ctx = JSON.parse(raw); } catch (_) { sessionStorage.removeItem('paypal_pending'); return; }

  const { payment_id, backendUrl, apiKey } = ctx;
  if (!payment_id || !backendUrl || !apiKey) { sessionStorage.removeItem('paypal_pending'); return; }

  setResult('neutral', 'Verificando pago PayPal...', { payment_id, estado: 'PENDING' });

  let attempts = 0;
  const maxAttempts = 40;

  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(`${backendUrl}/api/payments/${payment_id}`, {
        headers: { 'x-api-key': apiKey },
      });
      const data = await res.json().catch(() => ({}));

      if (data.estado === 'COMPLETED') {
        clearInterval(interval);
        sessionStorage.removeItem('paypal_pending');
        setResult('success', '¡Pago completado con PayPal!', data);
        hidePaypalSection();
        showSuccess();
      } else if (data.estado === 'FAILED') {
        clearInterval(interval);
        sessionStorage.removeItem('paypal_pending');
        setResult('error', 'Pago cancelado o fallido', data);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        sessionStorage.removeItem('paypal_pending');
        setResult('error', 'Tiempo de espera agotado', { payment_id, message: 'El pago no se completó en el tiempo esperado.' });
      }
    } catch (_) {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        sessionStorage.removeItem('paypal_pending');
      }
    }
  }, 3000);
}

function startQrPolling(payment_id, backendUrl, apiKey) {
  let attempts = 0;
  const maxAttempts = 60; // 3 mins

  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(`${backendUrl}/api/payments/${payment_id}`, {
        headers: { 'x-api-key': apiKey },
      });
      const data = await res.json().catch(() => ({}));

      if (data.estado === 'COMPLETED') {
        clearInterval(interval);
        hideQrSection();
        setResult('success', '¡Pago completado con QR!', data);
        showSuccess();
      } else if (data.estado === 'FAILED' || data.estado === 'CANCELLED') {
        clearInterval(interval);
        hideQrSection();
        setResult('error', 'Pago QR cancelado o fallido', data);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        hideQrSection();
        setResult('error', 'Tiempo de espera agotado para QR', { payment_id });
      }
    } catch (_) {
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        hideQrSection();
      }
    }
  }, 3000);
}

