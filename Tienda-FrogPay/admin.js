const STORAGE_KEYS = {
  backendUrl: 'frogmarket_admin_backend_url',
  apiKey: 'frogmarket_admin_api_key',
  limit: 'frogmarket_admin_limit',
  refreshSeconds: 'frogmarket_admin_refresh_seconds',
  ngrokUrl: 'frogmarket_admin_ngrok_url',
  notificationsEnabled: 'frogmarket_admin_notifications_enabled',
  remember: 'frogmarket_admin_remember',
};

const settingsForm = document.getElementById('admin-settings');
const rememberCheckbox = document.getElementById('admin-remember-settings');
const refreshNowButton = document.getElementById('refresh-now');
const monitorStatusEl = document.getElementById('monitor-status');
const lastUpdatedEl = document.getElementById('last-updated');
const paymentsBodyEl = document.getElementById('payments-body');
const webhookEndpointEl = document.getElementById('webhook-endpoint');
const receiverStatusEl = document.getElementById('receiver-status');
const receiverBodyEl = document.getElementById('receiver-body');
const refreshReceiverButton = document.getElementById('refresh-receiver');
const clearReceiverButton = document.getElementById('clear-receiver');
const toggleNotificationsButton = document.getElementById('toggle-notifications');
const notificationMetaEl = document.getElementById('notification-meta');
const notificationListEl = document.getElementById('notification-list');

const state = {
  timer: null,
  receiverBootstrapped: false,
  seenReceiverEventIds: new Set(),
  notificationsFeed: [],
  settings: loadSettings(),
};

applySettingsToForm();
bindEvents();
runMonitor();

function loadSettings() {
  return {
    backendUrl: localStorage.getItem(STORAGE_KEYS.backendUrl) || 'http://localhost:3000',
    apiKey: localStorage.getItem(STORAGE_KEYS.apiKey) || '',
    limit: Number(localStorage.getItem(STORAGE_KEYS.limit) || '30'),
    refreshSeconds: Number(localStorage.getItem(STORAGE_KEYS.refreshSeconds) || '5'),
    ngrokUrl: localStorage.getItem(STORAGE_KEYS.ngrokUrl) || '',
    notificationsEnabled: localStorage.getItem(STORAGE_KEYS.notificationsEnabled) === 'true',
    remember: localStorage.getItem(STORAGE_KEYS.remember) !== 'false',
  };
}

function saveSettings() {
  if (state.settings.remember) {
    localStorage.setItem(STORAGE_KEYS.backendUrl, state.settings.backendUrl);
    localStorage.setItem(STORAGE_KEYS.apiKey, state.settings.apiKey);
    localStorage.setItem(STORAGE_KEYS.limit, String(state.settings.limit));
    localStorage.setItem(STORAGE_KEYS.refreshSeconds, String(state.settings.refreshSeconds));
    localStorage.setItem(STORAGE_KEYS.ngrokUrl, state.settings.ngrokUrl);
    localStorage.setItem(STORAGE_KEYS.notificationsEnabled, String(state.settings.notificationsEnabled));
    localStorage.setItem(STORAGE_KEYS.remember, 'true');
    return;
  }

  localStorage.removeItem(STORAGE_KEYS.backendUrl);
  localStorage.removeItem(STORAGE_KEYS.apiKey);
  localStorage.removeItem(STORAGE_KEYS.limit);
  localStorage.removeItem(STORAGE_KEYS.refreshSeconds);
  localStorage.removeItem(STORAGE_KEYS.ngrokUrl);
  localStorage.setItem(STORAGE_KEYS.notificationsEnabled, String(state.settings.notificationsEnabled));
  localStorage.setItem(STORAGE_KEYS.remember, 'false');
}

function applySettingsToForm() {
  settingsForm.backendUrl.value = state.settings.backendUrl;
  settingsForm.apiKey.value = state.settings.apiKey;
  settingsForm.limit.value = String(state.settings.limit || 30);
  settingsForm.refreshSeconds.value = String(state.settings.refreshSeconds || 5);
  settingsForm.ngrokUrl.value = state.settings.ngrokUrl || '';
  rememberCheckbox.checked = state.settings.remember;
  updateWebhookEndpointPreview();
  updateNotificationsUI();
}

function bindEvents() {
  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    syncSettingsFromForm();
    saveSettings();
    runMonitor(true);
  });

  refreshNowButton.addEventListener('click', () => {
    syncSettingsFromForm();
    saveSettings();
    fetchPayments();
    fetchReceiverEvents();
  });

  refreshReceiverButton.addEventListener('click', fetchReceiverEvents);

  clearReceiverButton.addEventListener('click', async () => {
    try {
      await fetch('/local-webhook/clear', {
        method: 'POST',
      });
      state.seenReceiverEventIds.clear();
      state.receiverBootstrapped = false;
      state.notificationsFeed = [];
      renderNotifications();
      fetchReceiverEvents();
    } catch (_error) {
      setReceiverStatus('error', 'Error limpiando');
    }
  });

  toggleNotificationsButton.addEventListener('click', async () => {
    if (!state.settings.notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (_error) {
        // Ignora error del browser y deja notificaciones solo in-app.
      }
    }

    state.settings.notificationsEnabled = !state.settings.notificationsEnabled;
    saveSettings();
    updateNotificationsUI();
  });

  rememberCheckbox.addEventListener('change', () => {
    state.settings.remember = rememberCheckbox.checked;
    saveSettings();
  });

  settingsForm.ngrokUrl.addEventListener('input', () => {
    syncSettingsFromForm();
    updateWebhookEndpointPreview();
    if (state.settings.remember) {
      saveSettings();
    }
  });
}

function syncSettingsFromForm() {
  state.settings.backendUrl = String(settingsForm.backendUrl.value || 'http://localhost:3000').trim().replace(/\/$/, '');
  state.settings.apiKey = String(settingsForm.apiKey.value || '').trim();
  state.settings.limit = clampInt(settingsForm.limit.value, 1, 100, 30);
  state.settings.refreshSeconds = clampInt(settingsForm.refreshSeconds.value, 2, 60, 5);
  state.settings.ngrokUrl = String(settingsForm.ngrokUrl.value || '').trim().replace(/\/$/, '');
}

function updateWebhookEndpointPreview() {
  const base = state.settings.ngrokUrl;
  webhookEndpointEl.value = base ? `${base}/local-webhook/receive` : '(Pega tu URL HTTPS de ngrok)';
}

function clampInt(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), min), max);
}

function runMonitor(force = false) {
  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

  if (!state.settings.apiKey) {
    setStatus('error', 'Falta API key');
    renderEmpty('Pega una API key para empezar a ver pagos.');
    return;
  }

  fetchPayments();
  fetchReceiverEvents();

  if (force || state.settings.refreshSeconds) {
    state.timer = setInterval(() => {
      fetchPayments();
      fetchReceiverEvents();
    }, state.settings.refreshSeconds * 1000);
  }
}

function updateNotificationsUI() {
  const enabled = state.settings.notificationsEnabled;
  toggleNotificationsButton.textContent = enabled ? 'Desactivar notificaciones' : 'Activar notificaciones';

  let mode = 'Solo panel';
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    mode = 'Panel + navegador';
  }

  notificationMetaEl.textContent = `Estado: ${enabled ? 'ON' : 'OFF'} · ${mode}`;
}

function setStatus(type, text) {
  monitorStatusEl.className = `status ${type}`;
  monitorStatusEl.textContent = text;
}

function setReceiverStatus(type, text) {
  receiverStatusEl.className = `status ${type}`;
  receiverStatusEl.textContent = text;
}

function renderEmpty(text) {
  paymentsBodyEl.innerHTML = `<tr><td colspan="7" class="empty-cell">${escapeHtml(text)}</td></tr>`;
}

function formatDate(input) {
  if (!input) return '-';
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleString('es-BO');
}

function shortId(value) {
  if (!value) return '-';
  const str = String(value);
  if (str.length <= 18) return str;
  return `${str.slice(0, 8)}...${str.slice(-6)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderRows(items) {
  if (!items.length) {
    renderEmpty('No hay pagos todavía para este tenant.');
    return;
  }

  paymentsBodyEl.innerHTML = items
    .map((item) => {
      const webhookSummary = `${item.webhook_success_count || 0} ok / ${item.webhook_failed_count || 0} fail`;
      const txId = item.id_transaccion_proveedor || '-';

      return `
        <tr>
          <td title="${escapeHtml(item.id)}">${escapeHtml(shortId(item.id))}</td>
          <td><span class="status ${item.estado === 'COMPLETED' ? 'success' : item.estado === 'FAILED' ? 'error' : 'neutral'}">${escapeHtml(item.estado || '-')}</span></td>
          <td>${escapeHtml(String(item.moneda || 'USD'))} ${escapeHtml(Number(item.monto || 0).toFixed(2))}</td>
          <td>${escapeHtml(item.proveedor || '-')}</td>
          <td title="${escapeHtml(txId)}">${escapeHtml(shortId(txId))}</td>
          <td>${escapeHtml(webhookSummary)}</td>
          <td>${escapeHtml(formatDate(item.creado_en))}</td>
        </tr>
      `;
    })
    .join('');
}

function renderReceiverRows(items) {
  if (!items.length) {
    receiverBodyEl.innerHTML = '<tr><td colspan="5" class="empty-cell">Sin eventos todavía.</td></tr>';
    return;
  }

  receiverBodyEl.innerHTML = items
    .map((entry) => {
      const payload = entry.payload || {};
      const data = payload.data || {};

      return `
        <tr>
          <td>${escapeHtml(formatDate(entry.receivedAt))}</td>
          <td>${escapeHtml(payload.event || '-')}</td>
          <td title="${escapeHtml(String(data.payment_id || '-'))}">${escapeHtml(shortId(data.payment_id || '-'))}</td>
          <td>${escapeHtml(String(data.status || '-'))}</td>
          <td>${escapeHtml(String(data.currency || 'USD'))} ${escapeHtml(String(data.amount ?? '-'))}</td>
        </tr>
      `;
    })
    .join('');
}

function addNotificationFromEvent(entry) {
  const payload = entry.payload || {};
  const data = payload.data || {};
  const paymentId = String(data.payment_id || '-');
  const amount = `${String(data.currency || 'USD')} ${String(data.amount ?? '-')}`;
  const status = String(data.status || '-');

  state.notificationsFeed.unshift({
    id: entry.id,
    receivedAt: entry.receivedAt,
    status,
    paymentId,
    amount,
  });

  if (state.notificationsFeed.length > 12) {
    state.notificationsFeed = state.notificationsFeed.slice(0, 12);
  }

  renderNotifications();

  if (!state.settings.notificationsEnabled) {
    return;
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const body = `${status} · ${amount} · ${shortId(paymentId)}`;
    new Notification('Nuevo pago recibido', { body });
  }
}

function renderNotifications() {
  if (!state.notificationsFeed.length) {
    notificationListEl.innerHTML = '<li class="notification-empty">No hay notificaciones recientes.</li>';
    return;
  }

  notificationListEl.innerHTML = state.notificationsFeed
    .map((item) => `
      <li class="notification-item">
        <div>
          <strong>${escapeHtml(item.status)}</strong>
          <p>${escapeHtml(item.amount)} · ${escapeHtml(shortId(item.paymentId))}</p>
        </div>
        <small>${escapeHtml(formatDate(item.receivedAt))}</small>
      </li>
    `)
    .join('');
}

async function fetchPayments() {
  const backendUrl = state.settings.backendUrl;
  const apiKey = state.settings.apiKey;
  const limit = state.settings.limit;

  if (!backendUrl || !apiKey) {
    setStatus('error', 'Falta configuración');
    renderEmpty('Configura backend y API key para consultar pagos.');
    return;
  }

  setStatus('neutral', 'Sincronizando');

  try {
    const response = await fetch(`${backendUrl}/api/payments/monitor?limit=${limit}`, {
      headers: {
        'x-api-key': apiKey,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`);
    }

    const items = Array.isArray(data.data) ? data.data : [];
    renderRows(items);
    setStatus('success', `OK · ${items.length} pagos`);
    lastUpdatedEl.textContent = `Actualizado: ${new Date().toLocaleString('es-BO')}`;
  } catch (error) {
    setStatus('error', 'Error de conexión');
    renderEmpty(error.message || 'No se pudo consultar el monitor de pagos.');
    lastUpdatedEl.textContent = 'Último intento fallido.';
  }
}

async function fetchReceiverEvents() {
  setReceiverStatus('neutral', 'Consultando');

  try {
    const response = await fetch('/local-webhook/events');
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`);
    }

    const items = Array.isArray(data.data) ? data.data : [];

    const ordered = [...items].reverse();
    if (!state.receiverBootstrapped) {
      for (const entry of ordered) {
        state.seenReceiverEventIds.add(entry.id);
      }
      state.receiverBootstrapped = true;
    } else {
      for (const entry of ordered) {
        if (state.seenReceiverEventIds.has(entry.id)) {
          continue;
        }

        state.seenReceiverEventIds.add(entry.id);
        addNotificationFromEvent(entry);
      }

      if (state.seenReceiverEventIds.size > 500) {
        const compact = new Set(items.slice(0, 200).map((entry) => entry.id));
        state.seenReceiverEventIds = compact;
      }
    }

    renderReceiverRows(items);
    setReceiverStatus('success', `Recibidos: ${items.length}`);
  } catch (_error) {
    setReceiverStatus('error', 'Receiver no disponible');
    receiverBodyEl.innerHTML = '<tr><td colspan="5" class="empty-cell">No se pudo consultar el receiver local.</td></tr>';
  }
}
