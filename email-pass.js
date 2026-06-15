// Shared email handoff between index and early-access pages
(function () {
  const KEY = 'valhaverly_email';
  const COOKIE = 'valhaverly_email';

  function save(email) {
    const value = (email || '').trim();
    if (!value) return;
    try {
      sessionStorage.setItem(KEY, value);
      localStorage.setItem(KEY, value);
    } catch (_) {}
    document.cookie = `${COOKIE}=${encodeURIComponent(value)};path=/;max-age=86400;SameSite=Lax`;
  }

  function read() {
    const fromUrl = new URLSearchParams(window.location.search).get('email');
    if (fromUrl) return fromUrl.trim();

    if (window.location.hash.startsWith('#email=')) {
      return decodeURIComponent(window.location.hash.slice(7)).trim();
    }

    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
    if (cookieMatch) return decodeURIComponent(cookieMatch[1]).trim();

    try {
      return (sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || '').trim();
    } catch (_) {
      return '';
    }
  }

  function fromPage() {
    for (const input of document.querySelectorAll('.signup-form input[name="email"]')) {
      const value = input.value.trim();
      if (value) return value;
    }
    return read();
  }

  function intakeUrl(email) {
    const value = (email || fromPage()).trim();
    if (!value) return 'early-access.html';
    const encoded = encodeURIComponent(value);
    return `early-access.html?email=${encoded}#email=${encoded}`;
  }

  function fillField(id) {
    const email = read();
    const input = document.getElementById(id);
    if (email && input) input.value = email;
    return email;
  }

  window.ValhaverlyEmail = { save, read, fromPage, intakeUrl, fillField };

  document.addEventListener('DOMContentLoaded', () => {
    fillField('email');
  });
})();
