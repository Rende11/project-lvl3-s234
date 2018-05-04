export const stateChanger = {
    failed: (el, message) => {
      el.classList.add('is-invalid');
      el.classList.remove('is-valid');
      document.getElementById('invalid-message').textContent = message;
    },
    success: (el, message) => {
      el.classList.remove('is-invalid');
      el.classList.add('is-valid');
      document.getElementById('valid-message').textContent = message;
    },
    neutral: (el) => {
      el.classList.remove('is-invalid');
      el.classList.remove('is-valid');
    },
  }