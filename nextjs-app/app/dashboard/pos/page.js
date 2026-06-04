'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRupiah, generateTrxId } from '@/lib/utils';
import Receipt from '@/components/Receipt';

const CATEGORIES = ['Semua', 'Nail Art', 'Nail Care', 'Beauty', 'Eyelash', 'Waxing', 'Paket'];

export default function POSPage() {
  const supabase = createClient();
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    supabase.from('services').select('*').order('id').then(({ data }) => setServices(data || []));
  }, []);

  const filtered = services.filter((s) => {
    const matchCat = category === 'Semua' || s.category === category;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function addToCart(service) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === service.id);
      if (existing) return prev.map((i) => (i.id === service.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id: service.id, name: service.name, price: service.price, qty: 1 }];
    });
  }

  function updateQty(id, delta) {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  async function processPayment() {
    if (cart.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

    const txId = generateTrxId();
    const cashierName = profile?.full_name || user.email;

    const { error: txErr } = await supabase.from('transactions').insert({
      id: txId,
      subtotal,
      total: subtotal,
      cashier_name: cashierName,
      cashier_id: user.id,
    });

    if (txErr) { alert('Gagal menyimpan transaksi'); return; }

    const items = cart.map((i) => ({
      transaction_id: txId,
      service_name: i.name,
      price: i.price,
      qty: i.qty,
      subtotal: i.price * i.qty,
    }));

    await supabase.from('transaction_items').insert(items);

    setReceipt({
      id: txId,
      created_at: new Date().toISOString(),
      cashier_name: cashierName,
      total: subtotal,
      items: items.map((i) => ({ service_name: i.service_name, qty: i.qty, subtotal: i.subtotal })),
    });

    setCart([]);
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><h1>Kasir / POS</h1></div>
        <div className="topbar-right">
          <div className="date-display">
            <i className="fas fa-calendar-alt"></i>
            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      <div className="page-content">
        <div className="pos-container">
          <div className="pos-services">
            <div className="pos-services-header">
              <h3><i className="fas fa-spa"></i> Pilih Layanan</h3>
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Cari layanan..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="category-filters">
              {CATEGORIES.map((cat) => (
                <button key={cat} className={`cat-btn ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>
            <div className="services-grid">
              {filtered.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Tidak ada layanan ditemukan</div>
              ) : (
                filtered.map((s) => (
                  <div key={s.id} className="service-card" onClick={() => addToCart(s)}>
                    <div className="service-emoji">{s.emoji}</div>
                    <h4>{s.name}</h4>
                    <div className="price">{formatRupiah(s.price)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pos-cart">
            <div className="cart-header">
              <h3><i className="fas fa-shopping-cart"></i> Keranjang</h3>
              <button className="btn btn-danger btn-sm" onClick={() => setCart([])}><i className="fas fa-trash"></i> Kosongkan</button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="cart-empty">
                  <i className="fas fa-shopping-basket"></i>
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>{formatRupiah(item.price)} x {item.qty} = {formatRupiah(item.price * item.qty)}</p>
                    </div>
                    <div className="cart-item-actions">
                      <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><i className="fas fa-minus"></i></button>
                      <span className="cart-item-qty">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="cart-summary">
              <div className="cart-row"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
              <div className="cart-row total"><span>Total</span><span>{formatRupiah(subtotal)}</span></div>
            </div>
            <div className="cart-actions">
              <button className="btn btn-primary" onClick={processPayment}><i className="fas fa-check-circle"></i> Bayar</button>
            </div>
          </div>
        </div>
      </div>

      {receipt && <Receipt transaction={receipt} onClose={() => setReceipt(null)} />}
    </>
  );
}
