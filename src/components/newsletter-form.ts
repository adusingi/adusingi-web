export function initNewsletterForm() {
  const form = document.getElementById('newsletter-form') as HTMLFormElement;
  const input = document.getElementById('newsletter-email') as HTMLInputElement;
  const button = document.getElementById('newsletter-submit') as HTMLButtonElement;
  const message = document.getElementById('newsletter-message') as HTMLDivElement;

  if (!form || !input || !button || !message) {
    console.log('Newsletter form elements not found');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = input.value.trim();

    // Reset message
    message.textContent = '';
    message.className = 'hidden';

    // Validate
    if (!email) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    // Disable form during submission
    button.disabled = true;
    const originalButtonText = button.textContent;
    button.textContent = 'Subscribing...';
    input.disabled = true;

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message || '🎉 Thanks for subscribing! Check your email.', 'success');
        input.value = '';
      } else {
        showMessage(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      showMessage('Network error. Please try again later.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = originalButtonText;
      input.disabled = false;
    }
  });

  function showMessage(text: string, type: 'success' | 'error') {
    message.textContent = text;
    message.className = type === 'success'
      ? 'text-green-600 text-sm mt-3 text-center'
      : 'text-red-600 text-sm mt-3 text-center';
  }

  function isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
