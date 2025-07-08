document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://localhost:5000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      console.log('Login response:', data);
      if (data.accessToken) {
        localStorage.setItem('jwtToken', data.accessToken);
        alert('Login successful!');
        window.location.href = 'profile.html';
      } else {
        alert(data.message || 'Login failed');
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      alert('Login error. See console.');
    });
});
