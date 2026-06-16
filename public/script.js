// Mobile menu
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });
}

// Platform vertical tabs
const platformTabs = document.querySelectorAll('.platform-tab');
const featurePanels = document.querySelectorAll('.feature-panel');

platformTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    platformTabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    featurePanels.forEach((p) => p.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(target)?.classList.add('active');
  });
});

// Email → intake page (native GET forms + link href updates)
if (window.ValhaverlyEmail) {
  const { save, fromPage, intakeUrl } = window.ValhaverlyEmail;

  function syncEarlyAccessLinks() {
    const href = intakeUrl();
    document.querySelectorAll('a[href*="early-access"]').forEach((link) => {
      link.setAttribute('href', href);
    });
  }

  document.querySelectorAll('.signup-form input[name="email"]').forEach((input) => {
    ['input', 'change', 'blur'].forEach((eventName) => {
      input.addEventListener(eventName, () => {
        save(input.value);
        syncEarlyAccessLinks();
      });
    });
  });

  document.querySelectorAll('.signup-form').forEach((form) => {
    form.addEventListener('submit', () => {
      const email = form.querySelector('input[name="email"]')?.value.trim() || '';
      if (email) save(email);
      form.setAttribute('action', intakeUrl(email));
    });
  });

  document.addEventListener('mousedown', (e) => {
    const link = e.target.closest('a[href*="early-access"]');
    if (!link) return;
    const email = fromPage();
    if (email) save(email);
    link.setAttribute('href', intakeUrl(email));
  }, true);

  syncEarlyAccessLinks();
}

// Seamless gallery loop
const galleryTrack = document.querySelector('.gallery-track');
if (galleryTrack) {
  galleryTrack.innerHTML += galleryTrack.innerHTML;
}

// Header shadow on scroll
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.style.boxShadow = window.scrollY > 20
    ? '0 2px 20px rgba(0, 0, 0, 0.2)'
    : 'none';
}, { passive: true });
