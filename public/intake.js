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

    intakeSubmit.disabled = true;
    intakeSubmit.textContent = 'Submitting…';

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        intakeError.textContent =
          result.error || 'Something went wrong. Please try again or email hello@valhaverly.com.';
        intakeError.hidden = false;
        resetIntakeSubmit();
        return;
      }

      showIntakeSuccess();
    } catch {
      intakeError.textContent = 'Something went wrong. Please try again or email hello@valhaverly.com.';
      intakeError.hidden = false;
      resetIntakeSubmit();
    }
  });
}
