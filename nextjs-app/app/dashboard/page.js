'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { formatRupiah, formatDateTime, getTodayStr, getThisMonthStr } from '@/lib/utils';

export default function DashboardHome() {
  const supabase = createClient();
  const [stats, setStats] = useState({ todayRevenue: 0, todayCount: 0, totalServices: 0, monthRevenue: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const today = getTodayStr();
    const month = getThisMonthStr();

    const { data: allTx } = await supabase
      .from('transactions')
      .select('id, total, created_at')
      .order('created_at', { ascending: false });

    const transactions = allTx || [];
    const todayTx = transactions.filter((t) => t.created_at?.startsWith(today));
    const monthTx = transactions.filter((t) => t.created_at?.startsWith(month));

    const { count: svcCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true });

    setStats({
      todayRevenue: todayTx.reduce((s, t) => s + (t.total || 0), 0),
      todayCount: todayTx.length,
      totalServices: svcCount || 0,
      monthRevenue: monthTx.reduce((s, t) => s + (t.total || 0), 0),
    });

    const recentTx = transactions.slice(0, 5);
    const withItems = await Promise.all(
      recentTx.map(async (tx) => {
        const { data: items } = await supabase
          .from('transaction_items')
          .select('service_name')
          .eq('transaction_id', tx.id);
        return { ...tx, items: items || [] };
      })
    );
    setRecent(withItems);
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <h1 id="page-title">Dashboard</h1>
        </div>
        <div className="topbar-right">
          <div className="date-display">
            <i className="fas fa-calendar-alt"></i>
            <span>
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon pink"><i className="fas fa-wallet"></i></div>
            <div className="stat-info">
              <h3>{formatRupiah(stats.todayRevenue)}</h3>
              <p>Pendapatan Hari Ini</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-shopping-bag"></i></div>
            <div className="stat-info">
              <h3>{stats.todayCount}</h3>
              <p>Transaksi Hari Ini</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-concierge-bell"></i></div>
            <div className="stat-info">
              <h3>{stats.totalServices}</h3>
              <p>Total Layanan</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><i className="fas fa-chart-line"></i></div>
            <div className="stat-info">
              <h3>{formatRupiah(stats.monthRevenue)}</h3>
              <p>Pendapatan Bulan Ini</p>
            </div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-header">
            <h3><i className="fas fa-clock"></i> Transaksi Terakhir</h3>
            <Link href="/dashboard/pos" className="btn btn-primary btn-sm">
              <i className="fas fa-plus"></i> Transaksi Baru
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>No. Transaksi</th><th>Tanggal</th><th>Layanan</th><th>Total</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>Belum ada transaksi</td></tr>
                ) : (
                  recent.map((t) => {
                    const items = t.items.map((i) => i.service_name).join(', ');
                    return (
                      <tr key={t.id}>
                        <td><strong>{t.id}</strong></td>
                        <td>{formatDateTime(t.created_at)}</td>
                        <td>{items.length > 40 ? items.substring(0, 40) + '...' : items}</td>
                        <td><strong>{formatRupiah(t.total)}</strong></td>
                        <td><span className="badge badge-success">Lunas</span></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
