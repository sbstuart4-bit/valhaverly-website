// Replace with your deployed Google Apps Script web app URL (see google-apps-script.gs)
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzCcmNgxR42uYkJVPP-TDpJNHuyo_MxMyjwehg5xKLUgnItemCUbBR7uZdTgDG3TH6D/exec';

function showIntakeSuccess() {
  intakeForm.hidden = true;
  intakeSuccess.hidden = false;
  intakeSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetIntakeSubmit() {
  intakeSubmit.disabled = false;
  intakeSubmit.textContent = 'Request Early Access';
}

const intakeForm = document.getElementById('intake-form');
const intakeSuccess = document.getElementById('intake-success');
const intakeError = document.getElementById('intake-error');
const intakeSubmit = document.getElementById('intake-submit');

if (window.ValhaverlyEmail) {
  window.ValhaverlyEmail.fillField('email');
}

if (intakeForm) {
  intakeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    intakeError.hidden = true;

    if (!intakeForm.checkValidity()) {
      intakeForm.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(intakeForm));

    if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
      intakeError.textContent = 'Form is not connected yet. Add your Google Apps Script URL in intake.js.';
      intakeError.hidden = false;
      return;
    }

    intakeSubmit.disabled = true;
    intakeSubmit.textContent = 'Submitting…';

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      });

      showIntakeSuccess();
    } catch {
      intakeError.textContent = 'Something went wrong. Please try again or email hello@valhaverly.com.';
      intakeError.hidden = false;
      resetIntakeSubmit();
    }
  });
}
