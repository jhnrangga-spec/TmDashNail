const DEFAULT_USERS = [
    { username: 'admin', password: 'admin123', name: 'Admin', role: 'Administrator' }
];

function initUsers() {
    if (!localStorage.getItem('tmdash_users')) {
        localStorage.setItem('tmdash_users', JSON.stringify(DEFAULT_USERS));
    }
}

function handleLogin(e) {
    e.preventDefault();
    initUsers();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const users = JSON.parse(localStorage.getItem('tmdash_users'));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const session = { username: user.username, name: user.name, role: user.role, loginTime: new Date().toISOString() };
        sessionStorage.setItem('tmdash_session', JSON.stringify(session));
        window.location.href = 'dashboard.html';
    } else {
        const errEl = document.getElementById('login-error');
        const errText = document.getElementById('error-text');
        errText.textContent = 'Username atau password salah!';
        errEl.style.display = 'flex';
        document.getElementById('password').value = '';
    }
    return false;
}

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eye-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function checkAuth() {
    const session = sessionStorage.getItem('tmdash_session');
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(session);
}

function logout() {
    sessionStorage.removeItem('tmdash_session');
    window.location.href = 'index.html';
}
