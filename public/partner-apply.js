(function () {
  'use strict';

  var TOTAL_STEPS = 6;
  var currentStep = 1;
  var applicationId = null;
  var panels = [];
  var errorEl = null;
  var progressFill = null;
  var stepLabel = null;

  var SPECIALTIES = [
    'Cottage Properties', 'Lake Houses', 'Cabins', 'Recreational Land',
    'Family Farms', 'Luxury Properties', 'Shared Ownership Properties', 'Vacation Homes',
  ];

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    panels = Array.from(document.querySelectorAll('.po-step-panel'));
    errorEl = document.getElementById('apply-error');
    progressFill = document.getElementById('progress-fill');
    stepLabel = document.getElementById('step-label');

    try {
      var session = await PartnerAuth.getSession();
      var preferredId = null;

      if (session.authenticated) {
        if (session.session.status === 'Approved') {
          window.location.replace('/agent-partners/approved');
          return;
        }
        if (session.session.status !== 'Draft') {
          PartnerAuth.redirectByStatus(session.session.status);
          return;
        }
        preferredId = session.session.applicationId;
      }

      var app = await PartnerAuth.ensureDraftApplication(preferredId);
      if (!app) return;
      applicationId = app.id;
    } catch (err) {
      showError(err.message || 'Could not start application. Restart the dev server and refresh.');
      bindNav();
      showStep(1);
      return;
    }

    renderSpecialties();
    bindNav();
    showStep(1);
  }

  function renderSpecialties() {
    var group = document.getElementById('specialties-group');
    if (!group) return;
    group.innerHTML = SPECIALTIES.map(function (s) {
      return '<label class="po-check"><input type="checkbox" name="specialty" value="' + s + '"> ' + s + '</label>';
    }).join('');
  }

  function bindNav() {
    document.getElementById('btn-back').addEventListener('click', function () {
      if (currentStep > 1) showStep(currentStep - 1);
    });
    document.getElementById('btn-continue').addEventListener('click', handleContinue);
    document.querySelectorAll('.po-upload input[type="file"]').forEach(function (input) {
      input.addEventListener('change', function () { handleUpload(input); });
    });
  }

  function showStep(step) {
    currentStep = step;
    panels.forEach(function (p) {
      p.classList.toggle('active', Number(p.dataset.step) === step);
    });
    document.querySelectorAll('.po-step-pill').forEach(function (pill) {
      var n = Number(pill.dataset.step);
      pill.classList.toggle('active', n === step);
      pill.classList.toggle('done', n < step);
    });
    if (progressFill) progressFill.style.width = ((step / TOTAL_STEPS) * 100) + '%';
    if (stepLabel) stepLabel.textContent = 'Step ' + step + ' of ' + TOTAL_STEPS;
    var intro = document.getElementById('po-intro');
    var shell = document.getElementById('po-shell');
    if (intro) intro.classList.toggle('po-intro--hidden', step > 1);
    if (shell) shell.classList.toggle('po-shell--in-progress', step > 1);
    document.getElementById('btn-back').style.visibility = step === 1 ? 'hidden' : 'visible';
    document.getElementById('btn-continue').textContent = step === TOTAL_STEPS ? 'Submit Application' : 'Continue';
    hideError();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function collectStepData(step) {
    if (step === 1) {
      return {
        step: 1,
        firstName: val('firstName'),
        lastName: val('lastName'),
        email: val('email'),
        phone: val('phone'),
        linkedIn: val('linkedIn'),
      };
    }
    if (step === 2) {
      return {
        step: 2,
        brokerageName: val('brokerageName'),
        licenseNumber: val('licenseNumber'),
        provinceState: val('provinceState'),
        primaryMarket: val('primaryMarket'),
        specialties: getCheckedSpecialties(),
        yearsInRealEstate: val('yearsInRealEstate'),
        annualTransactions: val('annualTransactions'),
      };
    }
    if (step === 3) {
      return {
        step: 3,
        primaryRegion: val('primaryRegion'),
        secondaryRegions: val('secondaryRegions'),
        serviceRadius: val('serviceRadius'),
      };
    }
    if (step === 4) {
      return {
        step: 4,
        interestReason: val('interestReason'),
        postClosingSupport: val('postClosingSupport'),
        recreationalPropertiesAnnually: val('recreationalPropertiesAnnually'),
      };
    }
    if (step === 6) {
      return {
        step: 6,
        acceptedTerms: document.getElementById('acceptedTerms').checked,
        acceptedPrivacy: document.getElementById('acceptedPrivacy').checked,
        certifiedAccurate: document.getElementById('certifiedAccurate').checked,
        password: val('password'),
        confirmPassword: val('confirmPassword'),
      };
    }
    return { step: step };
  }

  function validateClient(step) {
    if (step === 2 && getCheckedSpecialties().length === 0) {
      return 'Please select at least one property specialty.';
    }
    if (step === 5) {
      var uploads = document.querySelectorAll('.po-upload');
      for (var i = 0; i < uploads.length; i++) {
        if (!uploads[i].classList.contains('has-file')) {
          return 'Please upload all required verification documents.';
        }
      }
    }
    if (step === 6) {
      var pw = val('password');
      var cpw = val('confirmPassword');
      if (pw.length < 8) return 'Password must be at least 8 characters.';
      if (pw !== cpw) return 'Passwords do not match.';
    }
    return null;
  }

  async function handleContinue() {
    hideError();
    var clientErr = validateClient(currentStep);
    if (clientErr) { showError(clientErr); return; }

    if (currentStep === 5) {
      showStep(6);
      return;
    }

    var btn = document.getElementById('btn-continue');
    btn.disabled = true;

    try {
      if (currentStep !== 5) {
        var payload = collectStepData(currentStep);
        var res = await fetch('/api/partner/applications/' + applicationId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        var text = await res.text();
        var data;
        try { data = JSON.parse(text); } catch (_) {
          throw new Error('Server error — restart dev server (npm run dev) and try again.');
        }
        if (!res.ok || !data.success) {
          if (res.status === 404) {
            var fresh = await PartnerAuth.ensureDraftApplication();
            if (!fresh) return;
            applicationId = fresh.id;
            payload = collectStepData(currentStep);
            res = await fetch('/api/partner/applications/' + applicationId, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            text = await res.text();
            try { data = JSON.parse(text); } catch (_) {
              throw new Error('Server error — restart dev server (npm run dev) and try again.');
            }
            if (!res.ok || !data.success) throw new Error(data.error || 'Save failed.');
          } else {
            throw new Error(data.error || 'Save failed.');
          }
        }
      }

      if (currentStep === TOTAL_STEPS) {
        var submitRes = await fetch('/api/partner/applications/' + applicationId + '/submit', {
          method: 'POST',
        });
        var submitText = await submitRes.text();
        var submitData;
        try { submitData = JSON.parse(submitText); } catch (_) {
          throw new Error('Server error — restart dev server (npm run dev) and try again.');
        }
        if (!submitRes.ok || !submitData.success) throw new Error(submitData.error || 'Submit failed.');
        window.location.href = '/agent-partners/application-submitted?id=' + applicationId;
        return;
      }

      showStep(currentStep + 1);
    } catch (err) {
      showError(err.message);
    } finally {
      btn.disabled = false;
    }
  }

  async function handleUpload(input) {
    var field = input.dataset.field;
    var file = input.files[0];
    if (!file || !field) return;

    var wrap = input.closest('.po-upload');
    var status = wrap.querySelector('.po-upload-status');
    status.textContent = 'Uploading…';

    var formData = new FormData();
    formData.append('field', field);
    formData.append('file', file);

    try {
      var res = await fetch('/api/partner/applications/' + applicationId + '/upload', {
        method: 'POST',
        body: formData,
      });
      var uploadText = await res.text();
      var data;
      try { data = JSON.parse(uploadText); } catch (_) {
        throw new Error('Server error — restart dev server (npm run dev) and try again.');
      }
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed.');
      wrap.classList.add('has-file');
      status.textContent = '✓ ' + file.name;
    } catch (err) {
      status.textContent = err.message;
      wrap.classList.remove('has-file');
    }
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function getCheckedSpecialties() {
    return Array.from(document.querySelectorAll('#specialties-group input:checked')).map(function (c) {
      return c.value;
    });
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function hideError() {
    if (errorEl) errorEl.hidden = true;
  }
})();
