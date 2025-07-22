document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
  
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        document.getElementById('loginStatus').innerText = data.error || 'Login failed';
        return;
      }
  
      localStorage.setItem('token', data.token);
      document.getElementById('loginStatus').innerText = `Welcome, ${data.username}!`;
  
      // Optionally redirect to protected page
      // window.location.href = 'dashboard.html';
  
    } catch (err) {
      console.error(err);
      document.getElementById('loginStatus').innerText = 'Login error, try again later.';
    }
  });
  