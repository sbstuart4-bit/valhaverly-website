(function () {
  'use strict';

  /**
   * Supademo popup IDs (Supademo.open) — preferred for interactive walkthroughs.
   * Keys: full, owner, member, expenses, legacy, ch1–ch6
   */
  var DEMO_POPUP_IDS = {
    owner: 'cmqvllasy0ceaqmecp66mbd06',
    member: 'cmqx4m115164gqmecu9fhxm3i',
    expenses: 'cmqwjkk8n0xq4qmecom43t0m7',
  };

  /**
   * Supademo inline embed URLs (iframe fallback).
   * Keys: full, owner, member, expenses, legacy, ch1–ch6
   */
  var DEMO_URLS = {
    full: '',
    owner: 'https://app.supademo.com/demo/cmqvllasy0ceaqmecp66mbd06?utm_source=link',
    member: 'https://app.supademo.com/demo/cmqx4m115164gqmecu9fhxm3i?utm_source=link',
    expenses: 'https://app.supademo.com/demo/cmqwjkk8n0xq4qmecom43t0m7?utm_source=link',
    legacy: '',
    ch1: '',
    ch2: '',
    ch3: '',
    ch4: '',
    ch5: '',
    ch6: '',
  };

  var modal = document.getElementById('demo-modal');
  if (!modal) return;

  var iframe = document.getElementById('demo-iframe');
  var placeholder = document.getElementById('demo-placeholder');
  var titleEl = document.getElementById('demo-modal-title');
  var closeBtn = document.getElementById('demo-modal-close');

  function openDemo(key, title) {
    var popupId = DEMO_POPUP_IDS[key];
    if (popupId && window.Supademo && typeof window.Supademo.open === 'function') {
      window.Supademo.open(popupId);
      return;
    }

    var url = DEMO_URLS[key] || '';
    titleEl.textContent = title;

    if (url) {
      iframe.src = url;
      iframe.hidden = false;
      placeholder.hidden = true;
    } else {
      iframe.removeAttribute('src');
      iframe.hidden = true;
      placeholder.hidden = false;
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDemo() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    iframe.removeAttribute('src');
  }

  document.querySelectorAll('[data-demo]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openDemo(btn.getAttribute('data-demo'), btn.getAttribute('data-demo-title') || 'Product Demo');
    });
  });

  closeBtn.addEventListener('click', closeDemo);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeDemo();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeDemo();
  });
})();
