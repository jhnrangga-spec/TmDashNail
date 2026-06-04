'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatRupiah, formatDate, getTodayStr } from '@/lib/utils';

export default function BookingsPage() {
  const supabase = createClient();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, today: 0 });

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    const list = data || [];
    const today = getTodayStr();
    setBookings(list);
    setStats({
      pending: list.filter((b) => b.status === 'pending').length,
      confirmed: list.filter((b) => b.status === 'confirmed').length,
      today: list.filter((b) => b.booking_date === today).length,
    });
  }

  async function updateStatus(id, status) {
    await supabase.from('bookings').update({ status }).eq('id', id);
    fetchBookings();
  }

  const statusBadge = {
    pending: <span className="badge badge-warning">Menunggu</span>,
    confirmed: <span className="badge badge-success">Dikonfirmasi</span>,
    done: <span className="badge badge-success">Selesai</span>,
    cancelled: <span className="badge badge-danger">Dibatalkan</span>,
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><h1>Booking</h1></div>
        <div className="topbar-right">
          <div className="date-display">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon orange"><i className="fas fa-clock"></i></div>
            <div className="stat-info"><h3>{stats.pending}</h3><p>Menunggu Konfirmasi</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-info"><h3>{stats.confirmed}</h3><p>Dikonfirmasi</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-calendar-day"></i></div>
            <div className="stat-info"><h3>{stats.today}</h3><p>Booking Hari Ini</p></div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3><i className="fas fa-calendar-check"></i> Daftar Booking</h3>
            <Link href="/" target="_blank" className="btn btn-secondary btn-sm">
              <i className="fas fa-external-link-alt"></i> Lihat Halaman Promo
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>No. Booking</th><th>Nama</th><th>Layanan</th><th>Tanggal & Jam</th><th>WhatsApp</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>Belum ada booking</td></tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.id}</strong></td>
                      <td>{b.name}</td>
                      <td>{b.service_name}<br /><small style={{ color: 'var(--primary)' }}>{formatRupiah(b.service_price)}</small></td>
                      <td>{formatDate(b.booking_date + 'T00:00:00')}<br /><small>{b.booking_time} WIB</small></td>
                      <td>{b.phone}</td>
                      <td>{statusBadge[b.status]}</td>
                      <td>
                        {b.status === 'pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(b.id, 'confirmed')} title="Konfirmasi"><i className="fas fa-check"></i></button>{' '}
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(b.id, 'cancelled')} title="Batalkan"><i className="fas fa-times"></i></button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-primary btn-sm" onClick={() => updateStatus(b.id, 'done')} title="Selesai"><i className="fas fa-check-double"></i></button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
