document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('jwtToken');

    const form = document.getElementById('create-post-form');
    const shareBtn = form.querySelector('.share-btn');

    const imageInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('preview-img');
    const uploadPlaceholder = document.getElementById('upload-placeholder');
    const imagePreviewContainer = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image');

    // Enable share button if image and caption are present
    form.addEventListener('input', () => {
        const caption = document.getElementById('caption').value.trim();
        const hasImage = imageInput.files.length > 0;
        shareBtn.disabled = !(caption && hasImage);
    });

    uploadPlaceholder.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                imagePreview.src = reader.result;
                uploadPlaceholder.style.display = 'none';
                imagePreviewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        imageInput.value = '';
        imagePreview.src = '';
        uploadPlaceholder.style.display = 'flex';
        imagePreviewContainer.style.display = 'none';
        shareBtn.disabled = true;
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('caption', document.getElementById('caption').value);
        formData.append('image', imageInput.files[0]);

        try {
            const response = await fetch('http://localhost:5000/posts/createPosts', {
                method: 'POST',
                headers: {
                    'Authorization': accessToken
                },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                  window.location.href = 'profile.html';

            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the post');
        }
    });
});

// document.addEventListener('DOMContentLoaded', () => {
//     const accessToken=localStorage.getItem('jwtToken');
//     // Handle post creation
//     document.getElementById('postForm').addEventListener('submit', async (event) => {
//         event.preventDefault();

//         const formData = new FormData();
//         formData.append('title', document.getElementById('title').value);
//         formData.append('content', document.getElementById('content').value);
//         formData.append('image', document.getElementById('image').files[0]);

//         try {
//             const response = await fetch('http://localhost:5000/posts/createPosts', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': accessToken
//                 },
//                 body: formData
//             });

//             if (response.ok) {
//                 const result = await response.json();
//                 alert(result.message);
//                 loadPosts(); // Reload posts after successful creation
//             } else {
//                 const error = await response.json();
//                 alert(error.message);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             alert('An error occurred while creating the post');
//         }
//     });

    // Function to load and display user's posts
    // async function loadPosts() {
    //     try {
    //         const response = await fetch('http://localhost:5000/posts/getPosts', {
    //             method: 'GET',
    //             headers: {
    //                 'Authorization': accessToken
    //             }
    //         });
    //         const posts = await response.json();

    //         console.log('Fetched posts:', posts); // Log the entire response

    //         const postsContainer = document.getElementById('posts');
    //         postsContainer.innerHTML = ''; // Clear existing posts

    //         if (posts && posts.length > 0) {
    //             console.log('Posts:', posts); // Log posts to the console for debugging
    //             posts.forEach(post => {
    //                 const postElement = document.createElement('div');
    //                 postElement.className = 'post';
    //                 postElement.innerHTML = `
    //                     <h3>${post.caption}</h3>
    //                     <p>${post.content}</p>
    //                     <img src="${post.image_url}" alt="Post Image" width="300">
    //                 `;
    //                 postsContainer.appendChild(postElement);
    //             });
    //         } else {
    //             console.log('No posts found'); // Log if no posts are found
    //             postsContainer.innerHTML = '<p>No posts found</p>';
    //         }
    //     } catch (error) {
    //         console.error('Error fetching posts:', error);
    //         alert('Failed to load posts');
    //     }
    // }

    // Load posts on page load
    // loadPosts();
// });
