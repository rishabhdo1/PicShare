document.addEventListener("DOMContentLoaded", () => {
  const jwtToken = localStorage.getItem("jwtToken")
  if (!jwtToken) return (window.location.href = "/index.html")

  // DOM Elements
  const circlesGrid = document.getElementById("circles-grid")
  const detailModal = document.getElementById("circle-details-modal")
  const closeDetailModal = document.getElementById("close-details-modal")
  const createCircleModal = document.getElementById("create-circle-modal")
  const createCircleBtn = document.getElementById("create-circle-btn")
  const closeCreateModal = document.getElementById("close-create-modal")
  const cancelCreateBtn = document.getElementById("cancel-create")
  const createCircleForm = document.getElementById("create-circle-form")
  const logoutBtn = document.getElementById("logout-btn")
  const loading = document.getElementById("loading")

  const circleNameElem = document.getElementById("circle-details-name")
  const circleDescriptionElem = document.getElementById("circle-details-description")
  const memberCountElem = document.getElementById("member-count")
  const photoCountElem = document.getElementById("photo-count")
  const membersGrid = document.getElementById("members-grid")
  const photosGrid = document.getElementById("circle-photos-grid")

  // Add Members Modal Elements
  const addMembersBtn = document.getElementById("add-members-btn")
  const addMembersModal = document.getElementById("add-members-modal")
  const closeAddMembersModal = document.getElementById("close-add-members-modal")
  const cancelAddMembers = document.getElementById("cancel-add-members")
  const memberSearchInput = document.getElementById("member-search")
  const searchResults = document.getElementById("search-results")
  const selectedMembers = document.getElementById("selected-members")
  const confirmAddMembersBtn = document.getElementById("confirm-add-members")

  // State
  let currentCircleId = null
  const selectedUsers = new Map() // Map to store selected users (userId -> user object)

  // Modal functions
  function showDetailModal() {
    detailModal.style.display = "flex"
    detailModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
  }

  function hideDetailModal() {
    detailModal.style.display = "none"
    detailModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = "auto"
    membersGrid.innerHTML = ""
    photosGrid.innerHTML = ""
  }

  function showCreateModal() {
    createCircleModal.style.display = "flex"
    createCircleModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
    document.getElementById("circle-name").focus()
  }

  function hideCreateModal() {
    createCircleModal.style.display = "none"
    createCircleModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = "auto"
    createCircleForm.reset()
  }

  function showAddMembersModal() {
    addMembersModal.style.display = "flex"
    addMembersModal.setAttribute("aria-hidden", "false")
    document.body.style.overflow = "hidden"
    memberSearchInput.focus()

    // Reset state
    selectedUsers.clear()
    updateSelectedMembersUI()
    confirmAddMembersBtn.disabled = true

    // Reset search
    memberSearchInput.value = ""
    searchResults.innerHTML = `
      <div class="empty-search-state">
        <i class="fa-solid fa-search"></i>
        <p>Search for users to add to your circle</p>
      </div>
    `
  }

  function hideAddMembersModal() {
    addMembersModal.style.display = "none"
    addMembersModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = "auto"
  }

  // Event listeners
  closeDetailModal.addEventListener("click", hideDetailModal)
  createCircleBtn.addEventListener("click", showCreateModal)
  closeCreateModal.addEventListener("click", hideCreateModal)
  cancelCreateBtn.addEventListener("click", hideCreateModal)
  addMembersBtn.addEventListener("click", showAddMembersModal)
  closeAddMembersModal.addEventListener("click", hideAddMembersModal)
  cancelAddMembers.addEventListener("click", hideAddMembersModal)

  // Close modals when clicking overlay
  detailModal.addEventListener("click", (e) => {
    if (e.target === detailModal) hideDetailModal()
  })

  createCircleModal.addEventListener("click", (e) => {
    if (e.target === createCircleModal) hideCreateModal()
  })

  addMembersModal.addEventListener("click", (e) => {
    if (e.target === addMembersModal) hideAddMembersModal()
  })

  // Logout functionality
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    localStorage.removeItem("jwtToken")
    window.location.href = "/index.html"
  })

  // Create circle form submission
  createCircleForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.getElementById("circle-name").value.trim()
    const description = document.getElementById("circle-description").value.trim()

    if (!name) return

    try {
      const submitBtn = createCircleForm.querySelector('button[type="submit"]')
      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...'

      const response = await fetch("http://localhost:5000/circles/create", {
        method: "POST",
        headers: {
          Authorization: jwtToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        hideCreateModal()
        fetchCircles() // Refresh the circles list
        showNotification("Circle created successfully!", "success")
      } else {
        throw new Error("Failed to create circle")
      }
    } catch (error) {
      console.error("Error creating circle:", error)
      showNotification("Failed to create circle. Please try again.", "error")
    } finally {
      const submitBtn = createCircleForm.querySelector('button[type="submit"]')
      submitBtn.disabled = false
      submitBtn.innerHTML = "Create Circle"
    }
  })

  // Search for users
  memberSearchInput.addEventListener("input", debounce(searchUsers, 300))

  function debounce(func, delay) {
    let timeout
    return function () {
      const args = arguments
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), delay)
    }
  }

  async function searchUsers() {
  const query = memberSearchInput.value.trim()

  if (query.length < 2) {
    searchResults.innerHTML = `
      <div class="empty-search-state">
        <i class="fa-solid fa-search"></i>
        <p>Enter at least 2 characters to search</p>
      </div>
    `
    return
  }

  try {
    const jwtToken = localStorage.getItem("jwtToken")
    const userResponse = await fetch(`http://localhost:5000/profile/getUsers`, {
      method: "GET",
      headers: {
        Authorization: jwtToken,
        Accept: "application/json",
      },
    })

    if (!userResponse.ok) throw new Error("Failed to fetch users")

    const searchedUsers = await userResponse.json()
    searchResults.innerHTML = ""

    // Fetch all posts once to extract profile images
    const postsResponse = await fetch("http://localhost:5000/posts/getPosts", {
      method: "GET",
      headers: {
        Authorization: jwtToken,
        Accept: "application/json",
      },
    })

    const posts = postsResponse.ok ? await postsResponse.json() : []

    for (const user of searchedUsers) {
      try {
        // Find a post made by the user to use as profile picture
        const userPost = posts.find((post) => post.username === user.username)

        if (userPost && userPost.image_url) {
          user.avatar = userPost.image_url.startsWith("http")
            ? userPost.image_url
            : `http://localhost:5000${userPost.image_url}`
        } else {
          user.avatar = ""
        }
      } catch (error) {
        console.error(`Error setting avatar for ${user.username}:`, error)
        user.avatar = ""
      }

      const isSelected = selectedUsers.has(user.id)

      const userElement = document.createElement("div")
      userElement.className = `user-result ${isSelected ? "selected" : ""}`
      userElement.dataset.userId = user.id
      userElement.innerHTML = `
        <div class="user-avatar">
          <img src="${user.avatar}" alt="${escapeHtml(user.username)}">
        </div>
        <div class="user-info">
          <div class="user-name">${escapeHtml(user.username)}</div>
          <div class="user-email">${escapeHtml(user.email)}</div>
        </div>
        <div class="user-action">
          <i class="fa-solid ${isSelected ? "fa-check" : "fa-plus"}"></i>
        </div>
      `

      userElement.addEventListener("click", () => toggleUserSelection(user))
      searchResults.appendChild(userElement)
    }
  } catch (error) {
    console.error("Error searching users:", error)
    searchResults.innerHTML = `
      <div class="empty-search-state">
        <i class="fa-solid fa-exclamation-triangle"></i>
        <p>Error searching users. Please try again.</p>
      </div>
    `
  }
}

  // Toggle user selection
  function toggleUserSelection(user) {
    if (selectedUsers.has(user.id)) {
      selectedUsers.delete(user.id)
    } else {
      selectedUsers.set(user.id, user)
    }

    // Update UI
    updateSelectedMembersUI()

    // Update search results UI
    const userElement = searchResults.querySelector(`.user-result[data-user-id="${user.id}"]`)
    if (userElement) {
      if (selectedUsers.has(user.id)) {
        userElement.classList.add("selected")
        userElement.querySelector(".user-action i").className = "fa-solid fa-check"
      } else {
        userElement.classList.remove("selected")
        userElement.querySelector(".user-action i").className = "fa-solid fa-plus"
      }
    }

    // Enable/disable confirm button
    confirmAddMembersBtn.disabled = selectedUsers.size === 0
  }

  // Update selected members UI
  function updateSelectedMembersUI() {
    if (selectedUsers.size === 0) {
      selectedMembers.innerHTML = `
        <div class="empty-selection">
          <p>No users selected yet</p>
        </div>
      `
      return
    }

    selectedMembers.innerHTML = ""
    selectedUsers.forEach((user) => {
      const memberTag = document.createElement("div")
      memberTag.className = "selected-member-tag"
      memberTag.innerHTML = `
        <span>${escapeHtml(user.username)}</span>
        <div class="remove-member" data-user-id="${user.id}">
          <i class="fa-solid fa-times"></i>
        </div>
      `

      memberTag.querySelector(".remove-member").addEventListener("click", (e) => {
        e.stopPropagation()
        selectedUsers.delete(user.id)
        updateSelectedMembersUI()

        // Update search results UI
        const userElement = searchResults.querySelector(`.user-result[data-user-id="${user.id}"]`)
        if (userElement) {
          userElement.classList.remove("selected")
          userElement.querySelector(".user-action i").className = "fa-solid fa-plus"
        }

        // Enable/disable confirm button
        confirmAddMembersBtn.disabled = selectedUsers.size === 0
      })

      selectedMembers.appendChild(memberTag)
    })
  }

  confirmAddMembersBtn.addEventListener("click", async () => {
  if (selectedUsers.size === 0 || !currentCircleId) return

  try {
    confirmAddMembersBtn.disabled = true
    confirmAddMembersBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Adding...'

    const jwtToken = localStorage.getItem("jwtToken")
    const userList = Array.from(selectedUsers.values())

    let addedCount = 0
    for (const user of userList) {
      const response = await fetch("http://localhost:5000/circles/add-member", {
        method: "POST",
        headers: {
          Authorization: jwtToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circle_id: currentCircleId,
          username: user.username
        })
      })

      if (response.ok) {
        addedCount++
      } else {
        const errData = await response.json()
        console.error(`Failed to add ${user.username}:`, errData.error)
      }
    }

    hideAddMembersModal()
    await loadCircleMembers(currentCircleId)

    showNotification(`Added ${addedCount} member${addedCount !== 1 ? "s" : ""} to circle!`, "success")
  } catch (error) {
    console.error("Error adding members:", error)
    showNotification("Failed to add members. Please try again.", "error")
  } finally {
    confirmAddMembersBtn.disabled = false
    confirmAddMembersBtn.innerHTML = "Add to Circle"
  }
  console.log("Add button clicked");
console.log("Selected users:", [...selectedUsers]);
console.log("Circle ID:", currentCircleId);
})

  // Fetch and display circles
  async function fetchCircles() {
    try {
      loading.style.display = "flex"

      const res = await fetch("http://localhost:5000/circles/getcircle", {
        method: "POST",
        headers: {
          Authorization: jwtToken,
          "Content-Type": "application/json",
        },
      })

      const circles = await res.json()

      loading.style.display = "none"

      if (!Array.isArray(circles) || circles.length === 0) {
        circlesGrid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-users"></i>
            <h3>No circles yet</h3>
            <p>Create your first circle to start sharing photos with your close friends and family.</p>
            <button class="btn btn-primary" onclick="document.getElementById('create-circle-btn').click()">
              <i class="fa-solid fa-plus"></i>
              Create Your First Circle
            </button>
          </div>
        `
        return
      }

      circlesGrid.innerHTML = ""
      circles.forEach((circle, index) => {
        const card = document.createElement("div")
        card.className = "circle-card fade-in"
        card.style.animationDelay = `${index * 0.1}s`
        card.innerHTML = `
          <h4>${escapeHtml(circle.name)}</h4>
          <p>${escapeHtml(circle.description || "No description available.")}</p>
          <button class="view-btn">
            <i class="fa-solid fa-eye"></i>
            View Circle
          </button>
        `

        card.querySelector(".view-btn").addEventListener("click", (e) => {
          e.stopPropagation()
          loadCircleDetails(circle)
        })

        card.addEventListener("click", () => loadCircleDetails(circle))
        circlesGrid.appendChild(card)
      })
    } catch (err) {
      console.error("Failed to load circles:", err)
      loading.style.display = "none"
      circlesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h3>Error loading circles</h3>
          <p>There was a problem loading your circles. Please try again.</p>
          <button class="btn btn-primary" onclick="fetchCircles()">
            <i class="fa-solid fa-refresh"></i>
            Try Again
          </button>
        </div>
      `
    }
  }

  // Load circle details
  async function loadCircleDetails(circle) {
    try {
      // Set current circle ID
      currentCircleId = circle.id

      // Set modal content
      circleNameElem.textContent = circle.name
      circleDescriptionElem.textContent = circle.description || "No description"

      // Show loading states
      memberCountElem.textContent = "..."
      photoCountElem.textContent = "..."
      membersGrid.innerHTML =
        '<div class="loading-container"><div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i></div><p>Loading members...</p></div>'
      photosGrid.innerHTML =
        '<div class="loading-container"><div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i></div><p>Loading photos...</p></div>'

      showDetailModal()

      // Fetch Members
      await loadCircleMembers(circle.id)

      // Fetch Photos
      await loadCirclePhotos(circle.id)
    } catch (err) {
      console.error("Failed to load circle details:", err)
      showNotification("Failed to load circle details. Please try again.", "error")
    }
  }

  // Load circle members
  async function loadCircleMembers(circleId) {
    try {
      const memberRes = await fetch("http://localhost:5000/circles/getmember", {
        method: "POST",
        headers: {
          Authorization: jwtToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ circleId }),
      })

      const members = await memberRes.json()
      memberCountElem.textContent = members.length

      membersGrid.innerHTML = ""
      if (members.length === 0) {
        membersGrid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-user-plus"></i>
            <h4>No members yet</h4>
            <p>Invite friends to join this circle</p>
          </div>
        `
      } else {
        members.forEach((member, index) => {
          const div = document.createElement("div")
          div.className = "member-card fade-in"
          div.style.animationDelay = `${index * 0.05}s`
          div.innerHTML = `
            <i class="fa-solid fa-user" style="margin-bottom: 0.5rem; color: var(--primary-color);"></i>
            <div>${escapeHtml(member.username)}</div>
          `
          membersGrid.appendChild(div)
        })
      }
    } catch (error) {
      console.error("Error loading members:", error)
      membersGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h4>Error loading members</h4>
          <p>There was a problem loading the members.</p>
        </div>
      `
    }
  }

  // Load circle photos
  async function loadCirclePhotos(circleId) {
    try {
      const photoRes = await fetch("http://localhost:5000/posts/getcirclePosts", {
        method: "POST",
        headers: {
          Authorization: jwtToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ circleId }),
      })

      const photos = await photoRes.json()
      photoCountElem.textContent = photos.length

      photosGrid.innerHTML = ""
      if (photos.length === 0) {
        photosGrid.innerHTML = `
          <div class="empty-state">
            <i class="fa-solid fa-camera"></i>
            <h4>No photos yet</h4>
            <p>Start sharing memories in this circle</p>
          </div>
        `
      } else {
        // Create Instagram-style feed
        photos.forEach((photo, index) => {
          const postDiv = document.createElement("div")
          postDiv.className = "instagram-post fade-in"
          postDiv.style.animationDelay = `${index * 0.05}s`

          postDiv.innerHTML = `
            <img src="${photo.image_url}" alt="Circle Photo" class="post-image">
            <div class="post-content">
              <p class="post-caption ${!photo.caption ? "empty" : ""}">${escapeHtml(photo.caption) || "No caption"}</p>
            </div>
          `

          // Add click event to image for full view
          const img = postDiv.querySelector(".post-image")
          img.addEventListener("click", () => {
            showImageModal(photo.image_url, photo.caption || "Circle photo")
          })

          photosGrid.appendChild(postDiv)
        })
      }
    } catch (error) {
      console.error("Error loading photos:", error)
      photosGrid.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <h4>Error loading photos</h4>
          <p>There was a problem loading the photos.</p>
        </div>
      `
    }
  }

  // Show image modal
  function showImageModal(imageSrc, caption) {
    const modal = document.createElement("div")
    modal.className = "modal-overlay"
    modal.setAttribute("aria-hidden", "false")
    modal.style.display = "flex"
    modal.innerHTML = `
      <div class="modal" style="max-width: 90%; max-height: 90%;">
        <div class="modal-header">
          <h3 class="modal-title">${escapeHtml(caption)}</h3>
          <button class="modal-close">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        <div class="modal-body" style="padding: 0;">
          <img src="${imageSrc}" alt="${escapeHtml(caption)}" style="width: 100%; height: auto; border-radius: 0 0 var(--radius-xl) var(--radius-xl);">
        </div>
      </div>
    `

    modal.querySelector(".modal-close").addEventListener("click", () => {
      document.body.removeChild(modal)
      document.body.style.overflow = "auto"
    })

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
        document.body.style.overflow = "auto"
      }
    })

    document.body.appendChild(modal)
    document.body.style.overflow = "hidden"
  }

  // Show notification
  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "var(--success-color)" : type === "error" ? "var(--error-color)" : "var(--primary-color)"};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: 10000;
      transform: translateX(100%);
      transition: var(--transition);
    `
    notification.textContent = message

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  // Utility function to escape HTML
  function escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // Initialize
  fetchCircles()
})
