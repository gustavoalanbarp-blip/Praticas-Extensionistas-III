// Verifica autenticação e carrega dados do usuário
async function initPage(pageKey) {
    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { window.location.href = '/login.html'; return null; }
        const user = await res.json();
        const nameEl = document.getElementById('userName');
        const avatarEl = document.getElementById('userAvatar');
        if (nameEl) nameEl.textContent = user.nome;
        if (avatarEl) avatarEl.textContent = (user.nome || 'A').charAt(0).toUpperCase();
        // Highlight active nav link
        const links = document.querySelectorAll('.nav-link');
        links.forEach(l => {
            if (l.dataset.page === pageKey) l.classList.add('active');
        });
        // Logout
        const logoutBtn = document.getElementById('btnLogout');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        return user;
    } catch { window.location.href = '/login.html'; return null; }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
}

function showAlert(containerId, message, type = 'error') {
    const el = document.getElementById(containerId);
    if (!el) return;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'info' ? 'fa-info-circle' : 'fa-exclamation-circle';
    el.innerHTML = `<div class="alert alert-${type}"><i class="fas ${icon}"></i>${message}</div>`;
    if (type === 'success') setTimeout(() => el.innerHTML = '', 4000);
}

function clearAlert(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function formatCPF(cpf) {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substring(0, 14) || cpf;
}

function statusBadge(status) {
    const map = { agendada: 'Agendada', realizada: 'Realizada', cancelada: 'Cancelada' };
    return `<span class="badge badge-${status}">${map[status] || status}</span>`;
}

async function apiFetch(url, opts = {}) {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Erro na requisição.');
    return data;
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modal on overlay click
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
});
