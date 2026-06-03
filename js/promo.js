let activeCategory = 'Semua';

document.addEventListener('DOMContentLoaded', () => {
    initPromoPage();
    initNavScroll();
    setMinBookingDate();
});

function initPromoPage() {
    renderPromoCategories();
    renderServicesShowcase();
    renderPackages();
    populateBookingServices();
}

// Navbar scroll
function initNavScroll() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.getElementById('nav-links').classList.remove('open');
        });
    });
}

function toggleNav() {
    document.getElementById('nav-links').classList.toggle('open');
}

// Service Categories
function renderPromoCategories() {
    const container = document.getElementById('promo-categories');
    const cats = ['Semua', 'Nail Art', 'Nail Care', 'Beauty', 'Eyelash', 'Waxing'];
    container.innerHTML = cats.map(cat =>
        `<button class="svc-cat-btn ${cat === activeCategory ? 'active' : ''}" onclick="filterPromoCategory('${cat}')">${cat}</button>`
    ).join('');
}

function filterPromoCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.svc-cat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    renderServicesShowcase();
}

// Services Grid
function renderServicesShowcase() {
    const services = getServices().filter(s => s.category !== 'Paket');
    const container = document.getElementById('services-showcase');

    const filtered = activeCategory === 'Semua'
        ? services
        : services.filter(s => s.category === activeCategory);

    container.innerHTML = filtered.map(s => `
        <div class="svc-card">
            <div class="svc-card-emoji">${s.emoji}</div>
            <h4>${s.name}</h4>
            <div class="svc-category">${s.category}</div>
            <div class="svc-price">${formatRupiah(s.price)}</div>
            <a href="#booking" class="btn btn-outline" onclick="preselectService(${s.id})">
                <i class="fas fa-calendar-check"></i> Booking Sekarang
            </a>
        </div>
    `).join('');
}

// Packages
function renderPackages() {
    const packages = getServices().filter(s => s.category === 'Paket');
    const container = document.getElementById('packages-grid');

    const packageDetails = {
        'Paket Mani-Pedi': {
            desc: 'Perawatan lengkap untuk tangan dan kaki Anda. Sempurna untuk relaksasi di akhir pekan.',
            includes: ['Manicure lengkap', 'Pedicure lengkap', 'Nail polish pilihan', 'Hand & foot massage'],
            featured: false
        },
        'Paket Bridal Nail': {
            desc: 'Tampil sempurna di hari spesial Anda. Paket lengkap nail art premium untuk pengantin.',
            includes: ['Gel manicure premium', 'Nail art custom design', 'Pedicure lengkap', 'Nail extension (opsional)', 'Free 1x touch up'],
            featured: true
        },
        'Paket Beauty Complete': {
            desc: 'Perawatan menyeluruh dari ujung kuku hingga bulu mata. Paket terlengkap untuk Anda.',
            includes: ['Gel manicure & pedicure', 'Nail art medium', 'Eyelash extension natural', 'Facial glowing', 'Free aftercare kit'],
            featured: false
        }
    };

    container.innerHTML = packages.map(pkg => {
        const detail = packageDetails[pkg.name] || { desc: 'Paket layanan spesial', includes: [], featured: false };
        return `
            <div class="package-card ${detail.featured ? 'featured' : ''}">
                ${detail.featured ? '<div class="package-badge">BEST SELLER</div>' : ''}
                <div class="package-emoji">${pkg.emoji}</div>
                <h3>${pkg.name}</h3>
                <p class="package-desc">${detail.desc}</p>
                <ul class="package-includes">
                    ${detail.includes.map(item => `<li><i class="fas fa-check-circle"></i> ${item}</li>`).join('')}
                </ul>
                <div class="package-price">
                    <span class="price">${formatRupiah(pkg.price)}</span>
                    <span class="price-note">/ sesi</span>
                </div>
                <a href="#booking" class="btn btn-primary btn-full" onclick="preselectService(${pkg.id})">
                    <i class="fas fa-calendar-check"></i> Pilih Paket Ini
                </a>
            </div>
        `;
    }).join('');
}

// Booking
function populateBookingServices() {
    const services = getServices();
    const select = document.getElementById('book-service');
    const grouped = {};

    services.forEach(s => {
        if (!grouped[s.category]) grouped[s.category] = [];
        grouped[s.category].push(s);
    });

    let html = '<option value="">-- Pilih Layanan --</option>';
    for (const cat in grouped) {
        html += `<optgroup label="${cat}">`;
        grouped[cat].forEach(s => {
            html += `<option value="${s.id}">${s.name} - ${formatRupiah(s.price)}</option>`;
        });
        html += '</optgroup>';
    }
    select.innerHTML = html;
}

function preselectService(serviceId) {
    setTimeout(() => {
        document.getElementById('book-service').value = serviceId;
    }, 500);
}

function setMinBookingDate() {
    const dateInput = document.getElementById('book-date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
}

function getBookings() {
    return JSON.parse(localStorage.getItem('tmdash_bookings') || '[]');
}

function saveBookings(bookings) {
    localStorage.setItem('tmdash_bookings', JSON.stringify(bookings));
}

function submitBooking(e) {
    e.preventDefault();

    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const serviceId = parseInt(document.getElementById('book-service').value);
    const date = document.getElementById('book-date').value;
    const time = document.getElementById('book-time').value;
    const notes = document.getElementById('book-notes').value.trim();

    if (!name || !phone || !serviceId || !date || !time) return false;

    const services = getServices();
    const service = services.find(s => s.id === serviceId);

    const booking = {
        id: 'BK-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase(),
        name,
        phone,
        serviceId,
        serviceName: service ? service.name : 'Unknown',
        servicePrice: service ? service.price : 0,
        date,
        time,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    const bookings = getBookings();
    bookings.push(booking);
    saveBookings(bookings);

    showBookingSuccess(booking);
    document.getElementById('booking-form').reset();
    return false;
}

function showBookingSuccess(booking) {
    const modal = document.getElementById('booking-success-modal');
    document.getElementById('booking-confirm-text').textContent =
        `Terima kasih, ${booking.name}! Booking Anda telah kami terima.`;

    document.getElementById('booking-detail').innerHTML = `
        <p><span>No. Booking</span> <strong>${booking.id}</strong></p>
        <p><span>Layanan</span> <strong>${booking.serviceName}</strong></p>
        <p><span>Harga</span> <strong>${formatRupiah(booking.servicePrice)}</strong></p>
        <p><span>Tanggal</span> <strong>${formatDate(booking.date + 'T00:00:00')}</strong></p>
        <p><span>Jam</span> <strong>${booking.time} WIB</strong></p>
        <p><span>WhatsApp</span> <strong>${booking.phone}</strong></p>
        ${booking.notes ? `<p><span>Catatan</span> <strong>${booking.notes}</strong></p>` : ''}
    `;

    modal.classList.add('active');
}

function closeBookingModal() {
    document.getElementById('booking-success-modal').classList.remove('active');
}
