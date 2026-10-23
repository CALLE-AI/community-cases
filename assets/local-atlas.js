document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const feedback = button.nextElementSibling;
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      feedback.textContent = 'Copied.';
    } catch {
      feedback.textContent = 'Copy unavailable. Select the text or download the starter pack.';
    }
  });
});
