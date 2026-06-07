'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#e91e8c', '#6c63ff', '#ff6b9d', '#00c897', '#ffb800', '#ff4757', '#a855f7', '#3b82f6'];

function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  if (period === 'daily') {
    start.setDate(now.getDate() - 30);
  } else if (period === 'weekly') {
    start.setDate(now.getDate() - 12 * 7);
  } else {
    start.setMonth(now.getMonth() - 11);
  }
  return { start, end: now };
}

function groupByPeriod(transactions, period) {
  const grouped = {};

  transactions.forEach((tx) => {
    const d = new Date(tx.created_at);
    let key;
    if (period === 'daily') {
      key = d.toISOString().slice(0, 10);
    } else if (period === 'weekly') {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().slice(0, 10);
    } else {
      key = d.toISOString().slice(0, 7);
    }
    if (!grouped[key]) grouped[key] = { period: key, revenue: 0, count: 0 };
    grouped[key].revenue += tx.total;
    grouped[key].count += 1;
  });

  return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
}

function formatLabel(key, period) {
  if (period === 'monthly') {
    const [y, m] = key.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
  }
  if (period === 'weekly') {
    const d = new Date(key + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
  const d = new Date(key + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a1a30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', fontSize: '0.82rem' }}>
      <p style={{ marginBottom: 4, fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name === 'revenue' ? 'Pendapatan' : 'Transaksi'}: {p.name === 'revenue' ? formatRupiah(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const supabase = createClient();
  const [period, setPeriod] = useState('daily');
  const [transactions, setTransactions] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { start } = getDateRange(period);

    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', start.toISOString())
      .order('created_at', { ascending: true });

    const txList = txs || [];
    setTransactions(txList);

    if (txList.length > 0) {
      const ids = txList.map((t) => t.id);
      const { data: items } = await supabase
        .from('transaction_items')
        .select('*')
        .in('transaction_id', ids);
      setAllItems(items || []);
    } else {
      setAllItems([]);
    }
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = groupByPeriod(transactions, period).map((d) => ({
    ...d,
    label: formatLabel(d.period, period),
  }));

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalTransactions = transactions.length;
  const avgTransaction = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

  const serviceStats = {};
  allItems.forEach((item) => {
    if (!serviceStats[item.service_name]) {
      serviceStats[item.service_name] = { name: item.service_name, qty: 0, revenue: 0 };
    }
    serviceStats[item.service_name].qty += item.qty;
    serviceStats[item.service_name].revenue += item.subtotal;
  });
  const topServices = Object.values(serviceStats)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  const pieData = topServices.map((s) => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + '...' : s.name,
    value: s.qty,
  }));

  function exportCSV() {
    const headers = ['Periode', 'Pendapatan', 'Jumlah Transaksi'];
    const rows = chartData.map((d) => [d.label, d.revenue, d.count]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    window.print();
  }

  const periodLabels = { daily: 'Harian (30 hari)', weekly: 'Mingguan (12 minggu)', monthly: 'Bulanan (12 bulan)' };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><h1>Laporan & Statistik</h1></div>
        <div className="topbar-right">
          <div className="date-display">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Period Selector & Export */}
        <div className="report-toolbar">
          <div className="period-selector">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                className={`cat-btn${period === p ? ' active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
          <div className="report-export-btns">
            <button className="btn btn-success btn-sm" onClick={exportCSV}>
              <i className="fas fa-file-excel"></i> Export Excel
            </button>
            <button className="btn btn-danger btn-sm" onClick={exportPDF}>
              <i className="fas fa-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon pink"><i className="fas fa-coins"></i></div>
            <div className="stat-info">
              <h3>{formatRupiah(totalRevenue)}</h3>
              <p>Total Pendapatan</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-receipt"></i></div>
            <div className="stat-info">
              <h3>{totalTransactions}</h3>
              <p>Total Transaksi</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-calculator"></i></div>
            <div className="stat-info">
              <h3>{formatRupiah(avgTransaction)}</h3>
              <p>Rata-rata / Transaksi</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><i className="fas fa-star"></i></div>
            <div className="stat-info">
              <h3>{topServices.length > 0 ? topServices[0].name : '-'}</h3>
              <p>Layanan Terpopuler</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: 12 }}></i>
            <p>Memuat data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="table-container" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <i className="fas fa-chart-bar" style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}></i>
            <p>Belum ada data transaksi untuk periode {periodLabels[period]}</p>
          </div>
        ) : (
          <>
            {/* Revenue Chart */}
            <div className="table-container report-chart-container">
              <div className="table-header">
                <h3><i className="fas fa-chart-line"></i> Grafik Pendapatan — {periodLabels[period]}</h3>
              </div>
              <div className="report-chart">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" stroke="#9a9ab0" fontSize={12} />
                    <YAxis stroke="#9a9ab0" fontSize={12} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : v} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="revenue" fill="#e91e8c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction Count Chart */}
            <div className="table-container report-chart-container" style={{ marginTop: 20 }}>
              <div className="table-header">
                <h3><i className="fas fa-chart-area"></i> Jumlah Transaksi — {periodLabels[period]}</h3>
              </div>
              <div className="report-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" stroke="#9a9ab0" fontSize={12} />
                    <YAxis stroke="#9a9ab0" fontSize={12} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="count" name="count" stroke="#6c63ff" strokeWidth={3} dot={{ fill: '#6c63ff', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Services */}
            <div className="report-grid" style={{ marginTop: 20 }}>
              {/* Pie Chart */}
              <div className="table-container report-chart-container">
                <div className="table-header">
                  <h3><i className="fas fa-chart-pie"></i> Layanan Terpopuler</h3>
                </div>
                <div className="report-chart">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={true} fontSize={11}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Tidak ada data</p>
                  )}
                </div>
              </div>

              {/* Top Services Table */}
              <div className="table-container">
                <div className="table-header">
                  <h3><i className="fas fa-trophy"></i> Ranking Layanan</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr><th>#</th><th>Layanan</th><th>Qty</th><th>Pendapatan</th></tr>
                    </thead>
                    <tbody>
                      {topServices.length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>Tidak ada data</td></tr>
                      ) : (
                        topServices.map((s, i) => (
                          <tr key={s.name}>
                            <td>
                              <span className={`rank-badge rank-${i + 1}`}>{i + 1}</span>
                            </td>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.qty}x</td>
                            <td>{formatRupiah(s.revenue)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
