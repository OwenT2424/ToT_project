// main.js — global client-side behaviour

// Logout
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/auth/login';
  });
}
