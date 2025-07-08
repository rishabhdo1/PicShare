function getPosts() {
  const accessToken = localStorage.getItem("jwtToken");
  if (!accessToken) {
    window.location.href = "/index.html";
    return;
  }

  fetch("http://localhost:5000/posts/getPosts", {
    method: "GET",
    headers: {
      Authorization: accessToken,
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        response.text().then((text) => {
          console.error(
            `Network response was not ok: ${response.status} - ${response.statusText}. Response text: ${text}`
          );
        });
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const photoGrid = document.getElementById("photo-grid");
      photoGrid.innerHTML = "";

      data.forEach((post) => {
        const photoCard = document.createElement("div");
        photoCard.className = "photo-card";
        photoCard.style.height = post.isLarge ? "400px" : "250px";

        photoCard.innerHTML = `
          <img src="${post.image_url}" alt="${post.caption || `Photo by ${post.username}`}">
          <div class="photo-overlay" aria-hidden="true"></div>
          <button class="photo-button" aria-label="View photo by ${post.username}: ${post.caption}">
            <span class="sr-only">View photo details</span>
          </button>
          <div class="photo-content">
            <div class="photo-user">
              <div class="user-avatar">
                <img src="${post.avatar || 'https://via.placeholder.com/40'}" alt="">
              </div>
              <span class="username">${post.username}</span>
            </div>
            <p class="caption">${post.caption}</p>
          </div>
        `;

        photoGrid.appendChild(photoCard);
      });

      // Handle photo clicks to enlarge image
      document.querySelectorAll(".photo-button").forEach((button) => {
        button.addEventListener("click", function () {
          const card = this.closest(".photo-card");
          const imgSrc = card.querySelector("img").src;
          const caption = card.querySelector(".caption").textContent;
          const username = card.querySelector(".username").textContent;
          showImageModal(imgSrc, caption, username);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching profile:", error);
    });
}

function showImageModal(imgSrc, caption, username) {
  // Create the modal elements
  const modalOverlay = document.createElement("div");
  modalOverlay.id = "imageModalOverlay";
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    position: relative;
    background: white;
    padding: 10px;
    max-width: 90%;
    max-height: 90%;
    text-align: center;
    border-radius: 8px;
  `;

  const image = document.createElement("img");
  image.src = imgSrc;
  image.style.maxWidth = "100%";
  image.style.maxHeight = "80vh";

  const captionEl = document.createElement("p");
  captionEl.textContent = `${username}: ${caption}`;
  captionEl.style.color = "#333";
  captionEl.style.marginTop = "10px";

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "&times;";
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
    color: #555;
  `;

  closeBtn.onclick = () => modalOverlay.remove();

  modalContent.appendChild(closeBtn);
  modalContent.appendChild(image);
  modalContent.appendChild(captionEl);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
}

function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", getPosts);


// function fetchUserProfile() {
//   const token = localStorage.getItem('jwtToken');
//   if (!token) {
//     console.error('No access token found. User might not be logged in.');
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
//     document.getElementById('username').textContent = data.username;
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
