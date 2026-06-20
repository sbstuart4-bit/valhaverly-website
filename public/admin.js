(function () {
  'use strict';

  var AdminAuth = {
    async getSession() {
      var res = await fetch('/api/admin/auth/session', { credentials: 'include' });
      return res.json();
    },

    async login(email, password) {
      var res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      return data;
    },

    async logout() {
      await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/admin';
    },

    async requireAuth() {
      var session = await this.getSession();
      if (!session.authenticated) {
        window.location.replace('/admin');
        return null;
      }
      return session.admin;
    },
  };

  var AdminApi = {
    async list(params) {
      var qs = new URLSearchParams(params || {}).toString();
      var res = await fetch('/api/admin/applications?' + qs, { credentials: 'include' });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load applications.');
      return data;
    },

    async get(id) {
      var res = await fetch('/api/admin/applications/' + encodeURIComponent(id), { credentials: 'include' });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load application.');
      return data.application;
    },

    async action(id, action, body) {
      var res = await fetch('/api/admin/applications/' + encodeURIComponent(id) + '/' + action, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body || {}),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed.');
      return data;
    },

    async sendEmail(id, body) {
      var res = await fetch('/api/admin/applications/' + encodeURIComponent(id) + '/email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email.');
      return data;
    },
  };

  function statusClass(status) {
    return 'adm-status adm-status--' + status.replace(/\s+/g, '-');
  }

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function showToast(msg, isError) {
    var el = document.createElement('div');
    el.className = 'adm-toast' + (isError ? ' adm-toast--error' : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 4000);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  window.AdminAuth = AdminAuth;
  window.AdminApi = AdminApi;
  window.AdminUI = { statusClass: statusClass, formatDate: formatDate, showToast: showToast, escapeHtml: escapeHtml };
})();
