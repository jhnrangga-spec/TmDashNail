const CATEGORIES = ['Semua', 'Nail Art', 'Nail Care', 'Beauty', 'Eyelash', 'Waxing', 'Paket'];

const DEFAULT_SERVICES = [
    { id: 1, name: 'Manicure Basic', category: 'Nail Care', price: 75000, emoji: '💅' },
    { id: 2, name: 'Pedicure Basic', category: 'Nail Care', price: 85000, emoji: '🦶' },
    { id: 3, name: 'Gel Manicure', category: 'Nail Care', price: 120000, emoji: '✨' },
    { id: 4, name: 'Gel Pedicure', category: 'Nail Care', price: 135000, emoji: '💎' },
    { id: 5, name: 'Nail Art Simple', category: 'Nail Art', price: 50000, emoji: '🎨' },
    { id: 6, name: 'Nail Art Medium', category: 'Nail Art', price: 100000, emoji: '🌸' },
    { id: 7, name: 'Nail Art Complex', category: 'Nail Art', price: 150000, emoji: '👑' },
    { id: 8, name: 'Nail Extension', category: 'Nail Art', price: 200000, emoji: '💫' },
    { id: 9, name: 'Nail Removal', category: 'Nail Care', price: 50000, emoji: '🔧' },
    { id: 10, name: 'Eyelash Extension Natural', category: 'Eyelash', price: 150000, emoji: '👁️' },
    { id: 11, name: 'Eyelash Extension Volume', category: 'Eyelash', price: 250000, emoji: '🦋' },
    { id: 12, name: 'Eyelash Lift & Tint', category: 'Eyelash', price: 175000, emoji: '🌟' },
    { id: 13, name: 'Facial Basic', category: 'Beauty', price: 150000, emoji: '🧖' },
    { id: 14, name: 'Facial Glowing', category: 'Beauty', price: 250000, emoji: '✨' },
    { id: 15, name: 'Waxing Underarm', category: 'Waxing', price: 50000, emoji: '🍯' },
    { id: 16, name: 'Waxing Full Leg', category: 'Waxing', price: 150000, emoji: '🦵' },
    { id: 17, name: 'Waxing Full Arm', category: 'Waxing', price: 100000, emoji: '💪' },
    { id: 18, name: 'Paket Mani-Pedi', category: 'Paket', price: 140000, emoji: '🎀' },
    { id: 19, name: 'Paket Bridal Nail', category: 'Paket', price: 350000, emoji: '💒' },
    { id: 20, name: 'Paket Beauty Complete', category: 'Paket', price: 500000, emoji: '👸' },
];

function getServices() {
    if (!localStorage.getItem('tmdash_services')) {
        localStorage.setItem('tmdash_services', JSON.stringify(DEFAULT_SERVICES));
    }
    return JSON.parse(localStorage.getItem('tmdash_services'));
}

function saveServices(services) {
    localStorage.setItem('tmdash_services', JSON.stringify(services));
}

function getTransactions() {
    return JSON.parse(localStorage.getItem('tmdash_transactions') || '[]');
}

function saveTransactions(transactions) {
    localStorage.setItem('tmdash_transactions', JSON.stringify(transactions));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
    return formatDate(dateStr) + ' ' + formatTime(dateStr);
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}
