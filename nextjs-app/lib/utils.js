export function formatRupiah(num) {
  return 'Rp ' + (num || 0).toLocaleString('id-ID');
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateStr) {
  return formatDate(dateStr) + ' ' + formatTime(dateStr);
}

export function generateTrxId() {
  return (
    'TRX-' +
    (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase()
  );
}

export function generateBookingId() {
  return (
    'BK-' +
    (Date.now().toString(36) + Math.random().toString(36).substr(2, 3)).toUpperCase()
  );
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getThisMonthStr() {
  return new Date().toISOString().slice(0, 7);
}
