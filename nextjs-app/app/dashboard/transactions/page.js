'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRupiah, formatDateTime } from '@/lib/utils';
import Receipt from '@/components/Receipt';

export default function TransactionsPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState([]);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => { fetchTransactions(); }, []);

  async function fetchTransactions() {
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    const withItems = await Promise.all(
      (txs || []).map(async (tx) => {
        const { data: items } = await supabase
          .from('transaction_items')
          .select('*')
          .eq('transaction_id', tx.id);
        return { ...tx, items: items || [] };
      })
    );
    setTransactions(withItems);
  }

  function viewReceipt(tx) {
    setReceipt({
      id: tx.id,
      created_at: tx.created_at,
      cashier_name: tx.cashier_name,
      total: tx.total,
      items: tx.items.map((i) => ({ service_name: i.service_name, qty: i.qty, subtotal: i.subtotal })),
    });
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><h1>Riwayat Transaksi</h1></div>
        <div className="topbar-right">
          <div className="date-display">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="table-container">
          <div className="table-header">
            <h3><i className="fas fa-receipt"></i> Semua Transaksi</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>No. Transaksi</th><th>Tanggal</th><th>Layanan</th><th>Total</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>Belum ada transaksi</td></tr>
                ) : (
                  transactions.map((t) => {
                    const items = t.items.map((i) => `${i.service_name} (x${i.qty})`).join(', ');
                    return (
                      <tr key={t.id}>
                        <td><strong>{t.id}</strong></td>
                        <td>{formatDateTime(t.created_at)}</td>
                        <td>{items.length > 50 ? items.substring(0, 50) + '...' : items}</td>
                        <td><strong>{formatRupiah(t.total)}</strong></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => viewReceipt(t)}><i className="fas fa-eye"></i></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {receipt && <Receipt transaction={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}
