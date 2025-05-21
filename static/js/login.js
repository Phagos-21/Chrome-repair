document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
        window.location.href = '/pages/profile.html';
    } else {
        document.getElementById('loginMessage').innerText = result.message;
    }

    if (email == "teacherEmail@rocklinusd.org" && password == "TeacherPassword") {
        window.location.href = '/pages/teacher';
        return;
    }
});
