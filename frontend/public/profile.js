function getProfile() {
 const accessToken = localStorage.getItem('jwtToken');  if (!accessToken) {
    window.location.href = '/index.html';
    return;
  }

  fetch('http://localhost:5000/profile/pro', {
    method: 'GET',
    headers: {
      'Authorization': accessToken,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      // Log the status code and response text for debugging
      response.text().then(text => {
        console.error(`Network response was not ok: ${response.status} - ${response.statusText}. Response text: ${text}`);
      });
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
  
    const profileavatarDiv = document.getElementById('profile-avatar');
    profileavatarDiv.innerHTML = `
      <img src="${data.avatar}" alt="Profile Picture">
`;
    const profileInfoDiv = document.getElementById('profile-bio-text');
    profileInfoDiv.innerHTML = `
      <p><strong>Username:</strong> ${data.username}</p>
      <p><strong>Bio:</strong> ${data.bio}</p>
      `;

    const postGridDiv = document.getElementById('posts-grid');



// Loop through each photo and add to the grid
data.photos.forEach(photo => {
    postGridDiv.innerHTML += `
    
       <img src="${photo.image_url}" alt="post" style=" height: 90%; margin: 0px;">  
  `;
});

    console.log('User profile:', data);
    })
    // <p><strong>Email:</strong> ${data.email}</p>
  .catch(error => {
    console.error('Error fetching profile:', error);
    // window.location.href = 'index.html';
  });
}

function logout() {
  localStorage.removeItem('jwtToken');
  window.location.href = 'index.html';
}

 getProfile();
// function fetchUserProfile() {
//   const token = localStorage.getItem('jwtToken');
//   if (!token) {
//   console.error('No access token found. User might not be logged in.');
//     return;
//   }

//   console.log('Token:', token);

//   fetch('http://localhost:5000/profile', {
//     method: 'GET',
//     headers: {
//       'Authorization': token,
//       'Content-Type': 'application/json'
//     }
//   })
//   .then(response => {
//     console.log('Response status:', response.status);
//     if (!response.ok) {
//       return response.text().then(text => {
//         console.error(`Network response was not ok: ${response.status} - ${response.statusText}. Response text: ${text}`);
//         throw new Error(`Network response was not ok: ${response.status}`);
//       });
//     }
//     return response.json();
//   })
//   .then(data => {
//     const usernameElement = document.getElementById('username');
//     if (usernameElement) {
//       usernameElement.textContent = data.username;
//     } 

//     // ... do the same for other elements
//   })
//   .then(data => {
    
//     console.log('User profile:', data);
//     // Handle the profile data
//   document.getElementById('username').textContent = data.username;
//     document.getElementById('email').textContent = data.email;
//     document.getElementById('profile_pic').src = data.profile_pic;
//     document.getElementById('bio').textContent = data.bio;
//   })
//   .catch(error => {
//     console.error('Error fetching user profile:', error);
//   });
// } 

// fetchUserProfile();
// document.addEventListener('DOMContentLoaded', () => {
//   const accessToken = localStorage.getItem('jwttoken'); // Assuming the token is stored in local storage after login

//   // if (!token) {
//   //     window.location.href = 'index.html'; // Redirect to login if not logged in
//   // }

//   // Fetch and display user profile
//   fetch('http://localhost:5000/profile', {
//       method: 'GET',
//       headers: {
//           'Authorization': accessToken
//       }
//   })
//   .then(response => response.json())
//   .then(data => {
//       document.getElementById('username').textContent = `Username: ${data.username}`;
//       document.getElementById('profilePic').src = data.profilePicUrl;
//       document.getElementById('bio').textContent = `Bio: ${data.bio}`;
//   })
//   .catch(error => {
//       console.error('Error fetching profile:', error);
//       alert('Failed to load profile');
//   });
