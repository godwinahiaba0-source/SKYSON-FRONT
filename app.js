// ==========================================
// SHARED FRONTEND UTILITIES (app.js)
// ==========================================

const API_URL = 'https://skyson-backend-production.up.railway.app';

// 1. Gorgeous Toast Notification System
function showToast(message, type = 'error') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    padding: 14px 20px;
    border-radius: 12px;
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(-10px);
    pointer-events: auto;
    font-family: inherit;
    background: ${type === 'success' ? 'linear-gradient(135deg, #2ecc71, #27ae60)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 2. Authentication Protection Guard (for protected pages like home.html)
function requireAuth() {
  const token = localStorage.getItem('skyson_token');
  if (!token) {
    window.location.href = 'index.html';
  }
}

// 3. Authenticated Fetch Helper
async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem('skyson_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await res.json().catch(() => ({}));
    
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('skyson_token');
      localStorage.removeItem('skyson_user');
      showToast('Session expired. Please log in again.', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
      throw new Error('Unauthorized');
    }
    
    return { res, data };
  } catch (err) {
    if (err.message !== 'Unauthorized') {
      showToast('Network error. Could not connect to server.', 'error');
    }
    throw err;
  }
}