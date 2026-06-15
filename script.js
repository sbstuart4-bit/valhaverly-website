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

// Carry email to intake page
const INTAKE_EMAIL_KEY = 'valhaverly_email';

function saveIntakeEmail(email) {
  const value = email.trim();
  if (!value) return;
  try {
    sessionStorage.setItem(INTAKE_EMAIL_KEY, value);
    localStorage.setItem(INTAKE_EMAIL_KEY, value);
  } catch (_) {}
}

function getSignupEmail() {
  for (const input of document.querySelectorAll('.signup-form input[name="email"]')) {
    const value = input.value.trim();
    if (value) return value;
  }
  try {
    return sessionStorage.getItem(INTAKE_EMAIL_KEY) || localStorage.getItem(INTAKE_EMAIL_KEY) || '';
  } catch (_) {
    return '';
  }
}

function earlyAccessHref(email) {
  const value = (email || getSignupEmail()).trim();
  return value
    ? `early-access.html?email=${encodeURIComponent(value)}`
    : 'early-access.html';
}

function goToIntake(email) {
  const value = (email || getSignupEmail()).trim();
  if (value) saveIntakeEmail(value);
  window.location.href = earlyAccessHref(value);
}

function updateEarlyAccessLinks() {
  const href = earlyAccessHref();
  document.querySelectorAll('a[href*="early-access"]').forEach((link) => {
    link.setAttribute('href', href);
  });
}

document.querySelectorAll('.signup-form input[name="email"]').forEach((input) => {
  input.addEventListener('input', () => {
    saveIntakeEmail(input.value);
    updateEarlyAccessLinks();
  });
});

document.querySelectorAll('.signup-form').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[name="email"]')?.value.trim() || '';
    goToIntake(email);
  });
});

document.querySelectorAll('a[href*="early-access"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const email = getSignupEmail();
    if (!email) return;
    e.preventDefault();
    goToIntake(email);
  });
});

updateEarlyAccessLinks();

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
