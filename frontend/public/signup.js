// auth.js

function signup() {
   const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const bio = document.getElementById('bio').value;
    const avatar = document.getElementById('avatar').value;
  
    fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, username, password, bio, avatar , name })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Signup response:', data);
        if (data.message === 'User registered successfully!') {
          alert('Signup successful! Redirecting to login...');
          window.location.href = 'index.html';
        } else {
          alert(data.message || 'Signup failed.');
        }
      })
      .catch(error => {
        alert('Signup failed. Please try again.');
        console.error('Error during signup:', error);
      });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        signup();
      });
    }
  });
  