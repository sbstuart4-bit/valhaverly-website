/**
 * Valhaverly — Partner Auth (session-based)
 */
(function () {
  'use strict';

  var APP_ID_KEY = 'valhaverly_partner_application_id';
  var AGENT_CACHE_KEY = 'valhaverly_partner_agent_cache';
  var SETTINGS_KEY = 'valhaverly_agent_settings';

  var STATUS_ROUTES = {
    Draft: '/agent-partners/apply',
    Submitted: '/agent-partners/pending-approval',
    'Under Review': '/agent-partners/pending-approval',
    Approved: '/agent-partners/approved',
    Rejected: '/agent-partners/pending-approval?status=rejected',
    Suspended: '/agent-login?error=suspended',
  };

  function getApplicationId() {
    try { return localStorage.getItem(APP_ID_KEY); } catch (_) { return null; }
  }

  function setApplicationId(id) {
    try { localStorage.setItem(APP_ID_KEY, id); } catch (_) {}
  }

  function clearApplicationId() {
    try { localStorage.removeItem(APP_ID_KEY); } catch (_) {}
  }

  function cacheAgent(agent) {
    try { localStorage.setItem(AGENT_CACHE_KEY, JSON.stringify(agent)); } catch (_) {}
  }

  function getCachedAgent() {
    try {
      var raw = localStorage.getItem(AGENT_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  function clearCache() {
    try {
      localStorage.removeItem(AGENT_CACHE_KEY);
      localStorage.removeItem('valhaverly_agent_id');
    } catch (_) {}
  }

  async function parseJsonResponse(res) {
    var contentType = res.headers.get('content-type') || '';
    var text = await res.text();

    if (!contentType.includes('application/json')) {
      if (text.trim().indexOf('<!DOCTYPE') === 0 || text.trim().indexOf('<html') === 0) {
        throw new Error(
          'Server error — received HTML instead of JSON. ' +
          'Run npm run dev and restart the server if this continues.'
        );
      }
      throw new Error(text || ('Request failed (' + res.status + ')'));
    }

    try {
      return JSON.parse(text);
    } catch (_) {
      throw new Error('Invalid JSON response from server.');
    }
  }

  async function fetchSession() {
    try {
      var res = await fetch('/api/partner/auth/session', { credentials: 'include' });
      if (!res.ok) {
        return { success: false, authenticated: false };
      }
      return await parseJsonResponse(res);
    } catch (_) {
      return { success: false, authenticated: false };
    }
  }

  window.PartnerAuth = {
    APP_ID_KEY: APP_ID_KEY,
    STATUS_ROUTES: STATUS_ROUTES,

    getApplicationId: getApplicationId,
    setApplicationId: setApplicationId,
    clearApplicationId: clearApplicationId,
    cacheAgent: cacheAgent,
    getCachedAgent: getCachedAgent,

    getSession: fetchSession,

    redirectByStatus: function (status) {
      var route = STATUS_ROUTES[status] || '/agent-login';
      window.location.replace(route);
    },

    login: async function (email, password, rememberMe) {
      var res = await fetch('/api/partner/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email, password: password, rememberMe: !!rememberMe }),
      });
      var data = await parseJsonResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed.');
      }
      if (data.application && data.application.id) {
        setApplicationId(data.application.id);
      }
      if (data.agent) {
        cacheAgent(data.agent);
      }
      return data;
    },

    logout: async function () {
      try {
        await fetch('/api/partner/auth/logout', { method: 'POST', credentials: 'include' });
      } catch (_) {}
      clearCache();
      clearApplicationId();
      window.location.href = '/agent-login';
    },

    requireAuthenticated: async function () {
      var data = await fetchSession();
      if (!data.authenticated) {
        window.location.replace('/agent-login');
        return null;
      }
      if (data.agent) cacheAgent(data.agent);
      return data;
    },

    requireApproved: async function () {
      var data = await fetchSession();
      if (!data.authenticated) {
        window.location.replace('/agent-login');
        return null;
      }
      if (data.session.status !== 'Approved') {
        window.PartnerAuth.redirectByStatus(data.session.status);
        return null;
      }
      if (data.agent) cacheAgent(data.agent);
      return data;
    },

    createApplication: async function (email) {
      var res = await fetch('/api/partner/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email || '' }),
      });
      var data = await parseJsonResponse(res);
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Could not start application.');
      }
      setApplicationId(data.application.id);
      return data.application;
    },

    /** Resolve a valid Draft application id — recreates if localStorage is stale. */
    ensureDraftApplication: async function (preferredId) {
      var id = preferredId || getApplicationId();

      if (id) {
        try {
          var res = await fetch('/api/partner/applications/' + encodeURIComponent(id), {
            credentials: 'include',
          });
          if (res.ok) {
            var data = await parseJsonResponse(res);
            if (data.success && data.application) {
              if (data.application.status === 'Draft') {
                setApplicationId(data.application.id);
                return data.application;
              }
              clearApplicationId();
              window.PartnerAuth.redirectByStatus(data.application.status);
              return null;
            }
          }
        } catch (_) {
          // fall through to create fresh application
        }
        clearApplicationId();
      }

      return await this.createApplication();
    },

    saveSettings: function (agentId, settings) {
      try {
        var all = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        all[agentId] = Object.assign(all[agentId] || {}, settings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(all));
        return true;
      } catch (_) { return false; }
    },

    getSavedSettings: function (agentId) {
      try {
        var all = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        return all[agentId] || null;
      } catch (_) { return null; }
    },
  };

  // Bridge for existing portal pages
  window.AgentAuth = {
    getLoggedInId: function () {
      var agent = getCachedAgent();
      return agent ? agent.id : null;
    },

    getLoggedInAgent: async function () {
      var session = await fetchSession();
      if (session.authenticated && session.agent) {
        var saved = window.PartnerAuth.getSavedSettings(session.agent.id);
        var agent = saved ? Object.assign({}, session.agent, saved) : session.agent;
        cacheAgent(agent);
        return agent;
      }
      return getCachedAgent();
    },

    getReferralLink: function (agent) {
      return agent.referralUrl || ('https://valhaverly.com/agent/' + agent.referralCode);
    },

    logout: function () {
      window.PartnerAuth.logout();
    },

    requireAuth: function () {
      window.PartnerAuth.requireApproved().then(function (data) {
        if (!data) return false;
        return true;
      });
      return true;
    },
  };
})();
