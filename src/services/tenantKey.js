const PRIMARY_STORAGE_KEY = 'frogpay_api_key';
const LEGACY_STORAGE_KEY = 'api_key';

function readFromStorage(key) {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return localStorage.getItem(key) || '';
  } catch (_error) {
    return '';
  }
}

function writeToStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch (_error) {
    // Silencioso: el navegador puede bloquear storage en algunos modos.
  }
}

function notifyChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event('frogpay:api-key-changed'));
}

export function getStoredApiKey() {
  return readFromStorage(PRIMARY_STORAGE_KEY) || readFromStorage(LEGACY_STORAGE_KEY);
}

export function setStoredApiKey(apiKey) {
  const value = String(apiKey || '').trim();

  writeToStorage(PRIMARY_STORAGE_KEY, value);
  writeToStorage(LEGACY_STORAGE_KEY, value);
  notifyChange();

  return value;
}

export function clearStoredApiKey() {
  writeToStorage(PRIMARY_STORAGE_KEY, '');
  writeToStorage(LEGACY_STORAGE_KEY, '');
  notifyChange();
}

export function maskApiKey(apiKey) {
  const value = String(apiKey || '').trim();

  if (!value) {
    return '';
  }

  if (value.length <= 12) {
    return `${value.slice(0, 4)}••••${value.slice(-2)}`;
  }

  const visiblePrefix = value.startsWith('fp_') ? value.slice(0, 8) : value.slice(0, 6);
  const visibleSuffix = value.slice(-4);
  const hiddenLength = Math.max(8, value.length - visiblePrefix.length - visibleSuffix.length);

  return `${visiblePrefix}${'•'.repeat(hiddenLength)}${visibleSuffix}`;
}
