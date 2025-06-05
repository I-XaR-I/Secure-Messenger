let wrapper = document.querySelector('.wrapper'),
    signUpLink = document.querySelector('.link .signup-link'),
    signInLink = document.querySelector('.link .signin-link');

signUpLink.addEventListener('click', () => {
    wrapper.classList.add('animated-signin');
    wrapper.classList.remove('animated-signup');
});

signInLink.addEventListener('click', () => {
    wrapper.classList.add('animated-signup');
    wrapper.classList.remove('animated-signin');
});

// Handle Sign-Up Form Submission
document.getElementById('signUpBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signUpUsername').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;

    // Validation (can add more checks if needed)
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    // Sending data to the server
    try {
        const response = await fetch('http://localhost:8000/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password, confirm_password: confirmPassword })
        });

        const result = await response.text();
        if (response.ok) {
            alert('Registration successful! Please log in to continue.');
            window.location.href = '/public/login.html';
        } else {
            alert(result);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
});

// Handle Sign-In Form Submission
document.getElementById('signInBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8000/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.text();
        if (response.ok) {
            alert('Login successful!');
            window.location.href = `/public/main.html?username=${username}`;
        } else {
            alert(result);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});
