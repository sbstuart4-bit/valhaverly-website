const agentForm = document.getElementById('agent-partner-form');
const agentSuccess = document.getElementById('agent-form-success');
const agentError = document.getElementById('agent-form-error');
const agentSubmit = document.getElementById('agent-form-submit');

function showAgentSuccess() {
  agentForm.hidden = true;
  agentSuccess.hidden = false;
  agentSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetAgentSubmit() {
  agentSubmit.disabled = false;
  agentSubmit.textContent = 'Apply Now';
}

function getSelectedSpecialties() {
  return Array.from(
    document.querySelectorAll('#specialtiesGroup input[name="specialty"]:checked'),
  ).map((input) => input.value);
}

if (agentForm) {
  agentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    agentError.hidden = true;

    const specialties = getSelectedSpecialties();
    if (specialties.length === 0) {
      agentError.textContent = 'Please select at least one property specialty.';
      agentError.hidden = false;
      return;
    }

    if (!agentForm.checkValidity()) {
      agentForm.reportValidity();
      return;
    }

    const formData = new FormData(agentForm);
    const data = Object.fromEntries(formData);
    data.propertySpecialties = specialties.join(', ');
    delete data.specialty;

    agentSubmit.disabled = true;
    agentSubmit.textContent = 'Submitting…';

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        agentError.textContent =
          result.error || 'Something went wrong. Please try again or email hello@valhaverly.com.';
        agentError.hidden = false;
        resetAgentSubmit();
        return;
      }

      showAgentSuccess();
    } catch {
      agentError.textContent = 'Something went wrong. Please try again or email hello@valhaverly.com.';
      agentError.hidden = false;
      resetAgentSubmit();
    }
  });
}
