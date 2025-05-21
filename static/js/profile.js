const select = document.querySelection('select');

Selection.addEventListener('change', changeURLLanguage);

// перенаправить на url с указанием языка
function changeURLLanguage(){
    let lang = select.value;
    location.href = window.location.pathname + '#'+lang;
    location.reload();
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('registerName').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name })
    });

    const result = await response.json();
    if (result.success) {
        window.location.href = '/pages/login.html';
    } else {
        alert(result.message);
    }
});

