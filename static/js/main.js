document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // We block the form until it is fully verified.

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const role = document.getElementById('registerRole').value;
    const errorDiv = document.getElementById("password-error");

   // checking conditions
    const isLongEnough = password.length >= 7;
    const hasNumber = /[0-9]/.test(password);
   

    if (!isLongEnough) {
        errorDiv.textContent = "Password must be at least 7 characters long and contain a number.";
        return;
    }

    if (password !== confirmPassword) {
        errorDiv.textContent = "Passwords do not match!";
        return;
    }

    errorDiv.textContent = "";

    // Sending data to the server
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = '/pages/profile.html';
        } else {
            alert(result.message || "Registration failed");
        }
    } catch (err) {
        console.error(err);
        alert("An error occurred. Please try again.");
    }
});

// не работало так как было в не правльном месте

//login
document.getElementById('goToLoginBtn').addEventListener('click', () => {
    window.location.href = '/pages/login.html';
});