let currentPage = 'dashboard';
let cart = [];
let editingServiceId = null;

document.addEventListener('DOMContentLoaded', () => {
    const session = checkAuth();
    if (!session) return;

    document.getElementById('user-name').textContent = session.name;
    document.getElementById('user-role').textContent = session.role;
    document.getElementById('user-initial').textContent = session.name.charAt(0).toUpperCase();

    updateDate();
    setInterval(updateDate, 60000);

    navigateTo('dashboard');
    updateBookingBadge();
});

function updateDate() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
}

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById('page-' + page).classList.add('active');
    const navEl = document.querySelector(`[data-page="${page}"]`);
    if (navEl) navEl.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        pos: 'Kasir / POS',
        services: 'Layanan',
        transactions: 'Riwayat Transaksi',
        bookings: 'Booking'
    };
    document.getElementById('page-title').textContent = titles[page] || '';

    if (page === 'dashboard') renderDashboard();
    if (page === 'pos') renderPOS();
    if (page === 'services') renderServices();
    if (page === 'transactions') renderTransactions();
    if (page === 'bookings') renderBookings();

    closeSidebar();
}

// Dashboard
function renderDashboard() {
    const transactions = getTransactions();
    const today = getTodayStr();
    const todayTx = transactions.filter(t => t.date.startsWith(today));

    const todayRevenue = todayTx.reduce((sum, t) => sum + t.total, 0);
    const todayCount = todayTx.length;
    const totalServices = getServices().length;

    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthTx = transactions.filter(t => t.date.startsWith(thisMonth));
    const monthRevenue = monthTx.reduce((sum, t) => sum + t.total, 0);

    document.getElementById('stat-today-revenue').textContent = formatRupiah(todayRevenue);
    document.getElementById('stat-today-tx').textContent = todayCount;
    document.getElementById('stat-services').textContent = totalServices;
    document.getElementById('stat-month-revenue').textContent = formatRupiah(monthRevenue);

    const tbody = document.getElementById('recent-transactions');
    tbody.innerHTML = '';
    const recent = transactions.slice(-5).reverse();

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada transaksi</td></tr>';
        return;
    }

    recent.forEach(t => {
        const items = t.items.map(i => i.name).join(', ');
        tbody.innerHTML += `
            <tr>
                <td><strong>${t.id}</strong></td>
                <td>${formatDateTime(t.date)}</td>
                <td>${items.length > 40 ? items.substring(0, 40) + '...' : items}</td>
                <td><strong>${formatRupiah(t.total)}</strong></td>
                <td><span class="badge badge-success">Lunas</span></td>
            </tr>`;
    });
}

// POS
function renderPOS() {
    renderCategoryFilters();
    renderServiceCards();
    renderCart();
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    container.innerHTML = CATEGORIES.map(cat =>
        `<button class="cat-btn ${cat === 'Semua' ? 'active' : ''}" onclick="filterCategory('${cat}')">${cat}</button>`
    ).join('');
}

function filterCategory(cat) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderServiceCards(cat === 'Semua' ? null : cat);
}

function renderServiceCards(category = null) {
    const services = getServices();
    const search = document.getElementById('pos-search')?.value?.toLowerCase() || '';
    const grid = document.getElementById('services-grid');

    const filtered = services.filter(s => {
        const matchCat = !category || s.category === category;
        const matchSearch = !search || s.name.toLowerCase().includes(search) || s.category.toLowerCase().includes(search);
        return matchCat && matchSearch;
    });

    grid.innerHTML = filtered.map(s => `
        <div class="service-card" onclick="addToCart(${s.id})">
            <div class="service-emoji">${s.emoji}</div>
            <h4>${s.name}</h4>
            <div class="price">${formatRupiah(s.price)}</div>
        </div>
    `).join('');

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Tidak ada layanan ditemukan</div>';
    }
}

function addToCart(serviceId) {
    const services = getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const existing = cart.find(item => item.id === serviceId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: service.id, name: service.name, price: service.price, qty: 1 });
    }
    renderCart();
}

function updateQty(serviceId, delta) {
    const item = cart.find(i => i.id === serviceId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== serviceId);
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-basket"></i>
                <p>Keranjang kosong</p>
            </div>`;
        subtotalEl.textContent = formatRupiah(0);
        totalEl.textContent = formatRupiah(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatRupiah(item.price)} x ${item.qty} = ${formatRupiah(item.price * item.qty)}</p>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateQty(${item.id}, -1)"><i class="fas fa-minus"></i></button>
                <span class="cart-item-qty">${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${item.id}, 1)"><i class="fas fa-plus"></i></button>
            </div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    subtotalEl.textContent = formatRupiah(subtotal);
    totalEl.textContent = formatRupiah(subtotal);
}

function processPayment() {
    if (cart.length === 0) return;

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const transaction = {
        id: 'TRX-' + generateId().toUpperCase(),
        date: new Date().toISOString(),
        items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty, subtotal: i.price * i.qty })),
        subtotal: subtotal,
        total: subtotal,
        cashier: JSON.parse(sessionStorage.getItem('tmdash_session')).name
    };

    const transactions = getTransactions();
    transactions.push(transaction);
    saveTransactions(transactions);

    showReceipt(transaction);
    cart = [];
    renderCart();
}

function showReceipt(tx) {
    const modal = document.getElementById('receipt-modal');
    const body = document.getElementById('receipt-body');

    const itemsHtml = tx.items.map(i =>
        `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${formatRupiah(i.subtotal)}</td></tr>`
    ).join('');

    body.innerHTML = `
        <div class="receipt" id="receipt-print">
            <div class="receipt-header">
                <h2>TmDash Nail & Beauty Studio</h2>
                <p>Jl. Contoh Alamat No. 123</p>
                <p>Telp: 0812-3456-7890</p>
            </div>
            <hr class="receipt-divider">
            <p><strong>No:</strong> ${tx.id}</p>
            <p><strong>Tanggal:</strong> ${formatDateTime(tx.date)}</p>
            <p><strong>Kasir:</strong> ${tx.cashier}</p>
            <hr class="receipt-divider">
            <div class="receipt-items">
                <table>
                    <thead><tr><th>Layanan</th><th style="text-align:center">Qty</th><th style="text-align:right">Subtotal</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
            </div>
            <hr class="receipt-divider">
            <div class="receipt-total">
                <span>TOTAL</span>
                <span>${formatRupiah(tx.total)}</span>
            </div>
            <div class="receipt-footer">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Beauty is our passion ✨</p>
            </div>
        </div>`;

    openModal('receipt-modal');
}

function printReceipt() {
    window.print();
}

// Services Management
function renderServices() {
    const services = getServices();
    const tbody = document.getElementById('services-table');
    tbody.innerHTML = '';

    services.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.emoji} ${s.name}</td>
                <td><span class="badge badge-success">${s.category}</span></td>
                <td><strong>${formatRupiah(s.price)}</strong></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteService(${s.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
    });
}

function openAddService() {
    editingServiceId = null;
    document.getElementById('service-modal-title').textContent = 'Tambah Layanan';
    document.getElementById('svc-name').value = '';
    document.getElementById('svc-category').value = 'Nail Care';
    document.getElementById('svc-price').value = '';
    document.getElementById('svc-emoji').value = '💅';
    openModal('service-modal');
}

function editService(id) {
    const services = getServices();
    const s = services.find(sv => sv.id === id);
    if (!s) return;

    editingServiceId = id;
    document.getElementById('service-modal-title').textContent = 'Edit Layanan';
    document.getElementById('svc-name').value = s.name;
    document.getElementById('svc-category').value = s.category;
    document.getElementById('svc-price').value = s.price;
    document.getElementById('svc-emoji').value = s.emoji;
    openModal('service-modal');
}

function saveService() {
    const name = document.getElementById('svc-name').value.trim();
    const category = document.getElementById('svc-category').value;
    const price = parseInt(document.getElementById('svc-price').value);
    const emoji = document.getElementById('svc-emoji').value.trim() || '💅';

    if (!name || !price) return;

    const services = getServices();

    if (editingServiceId) {
        const idx = services.findIndex(s => s.id === editingServiceId);
        if (idx !== -1) {
            services[idx] = { ...services[idx], name, category, price, emoji };
        }
    } else {
        const maxId = services.reduce((max, s) => Math.max(max, s.id), 0);
        services.push({ id: maxId + 1, name, category, price, emoji });
    }

    saveServices(services);
    closeModal('service-modal');
    renderServices();
}

function deleteService(id) {
    if (!confirm('Hapus layanan ini?')) return;
    const services = getServices().filter(s => s.id !== id);
    saveServices(services);
    renderServices();
}

// Transactions
function renderTransactions() {
    const transactions = getTransactions();
    const tbody = document.getElementById('transactions-table');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada transaksi</td></tr>';
        return;
    }

    transactions.slice().reverse().forEach(t => {
        const items = t.items.map(i => `${i.name} (x${i.qty})`).join(', ');
        tbody.innerHTML += `
            <tr>
                <td><strong>${t.id}</strong></td>
                <td>${formatDateTime(t.date)}</td>
                <td>${items.length > 50 ? items.substring(0, 50) + '...' : items}</td>
                <td><strong>${formatRupiah(t.total)}</strong></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick='viewTransaction("${t.id}")'><i class="fas fa-eye"></i></button>
                </td>
            </tr>`;
    });
}

function viewTransaction(txId) {
    const transactions = getTransactions();
    const tx = transactions.find(t => t.id === txId);
    if (tx) showReceipt(tx);
}

// Modal helpers
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Bookings
function getBookings() {
    return JSON.parse(localStorage.getItem('tmdash_bookings') || '[]');
}

function saveBookings(bookings) {
    localStorage.setItem('tmdash_bookings', JSON.stringify(bookings));
}

function renderBookings() {
    const bookings = getBookings();
    const tbody = document.getElementById('bookings-table');
    const today = getTodayStr();

    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const todayBookings = bookings.filter(b => b.date === today).length;

    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-confirmed').textContent = confirmed;
    document.getElementById('stat-today-bookings').textContent = todayBookings;

    if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">Belum ada booking</td></tr>';
        return;
    }

    tbody.innerHTML = bookings.slice().reverse().map(b => {
        const statusBadge = {
            pending: '<span class="badge badge-warning">Menunggu</span>',
            confirmed: '<span class="badge badge-success">Dikonfirmasi</span>',
            done: '<span class="badge badge-success">Selesai</span>',
            cancelled: '<span class="badge badge-danger">Dibatalkan</span>'
        };

        return `<tr>
            <td><strong>${b.id}</strong></td>
            <td>${b.name}</td>
            <td>${b.serviceName}<br><small style="color:var(--primary)">${formatRupiah(b.servicePrice)}</small></td>
            <td>${formatDate(b.date + 'T00:00:00')}<br><small>${b.time} WIB</small></td>
            <td>${b.phone}</td>
            <td>${statusBadge[b.status] || statusBadge.pending}</td>
            <td>
                ${b.status === 'pending' ? `
                    <button class="btn btn-success btn-sm" onclick="updateBookingStatus('${b.id}','confirmed')" title="Konfirmasi"><i class="fas fa-check"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="updateBookingStatus('${b.id}','cancelled')" title="Batalkan"><i class="fas fa-times"></i></button>
                ` : ''}
                ${b.status === 'confirmed' ? `
                    <button class="btn btn-primary btn-sm" onclick="updateBookingStatus('${b.id}','done')" title="Selesai"><i class="fas fa-check-double"></i></button>
                ` : ''}
            </td>
        </tr>`;
    }).join('');
}

function updateBookingStatus(bookingId, status) {
    const bookings = getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
        bookings[idx].status = status;
        saveBookings(bookings);
        renderBookings();
        updateBookingBadge();
    }
}

function updateBookingBadge() {
    const bookings = getBookings();
    const pending = bookings.filter(b => b.status === 'pending').length;
    const badge = document.getElementById('booking-badge');
    if (badge) {
        if (pending > 0) {
            badge.textContent = pending;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Sidebar mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
}
