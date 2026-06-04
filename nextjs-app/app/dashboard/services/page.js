'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

export default function ServicesPage() {
  const supabase = createClient();
  const [services, setServices] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Nail Care', price: '', emoji: '💅' });

  useEffect(() => { fetchServices(); }, []);

  async function fetchServices() {
    const { data } = await supabase.from('services').select('*').order('id');
    setServices(data || []);
  }

  function openAdd() {
    setEditing(null);
    setForm({ name: '', category: 'Nail Care', price: '', emoji: '💅' });
    setModal(true);
  }

  function openEdit(s) {
    setEditing(s.id);
    setForm({ name: s.name, category: s.category, price: s.price, emoji: s.emoji });
    setModal(true);
  }

  async function saveService() {
    if (!form.name || !form.price) return;
    const payload = { name: form.name, category: form.category, price: parseInt(form.price), emoji: form.emoji || '💅' };

    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing);
    } else {
      await supabase.from('services').insert(payload);
    }
    setModal(false);
    fetchServices();
  }

  async function deleteService(id) {
    if (!confirm('Hapus layanan ini?')) return;
    await supabase.from('services').delete().eq('id', id);
    fetchServices();
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-left"><h1>Layanan</h1></div>
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
            <h3><i className="fas fa-list"></i> Daftar Layanan</h3>
            <button className="btn btn-primary" onClick={openAdd}><i className="fas fa-plus"></i> Tambah Layanan</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr><th>Nama Layanan</th><th>Kategori</th><th>Harga</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>{s.emoji} {s.name}</td>
                    <td><span className="badge badge-success">{s.category}</span></td>
                    <td><strong>{formatRupiah(s.price)}</strong></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}><i className="fas fa-edit"></i></button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteService(s.id)}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Layanan' : 'Tambah Layanan'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nama Layanan</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Manicure Basic" />
              </div>
              <div className="form-group">
                <label>Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {['Nail Care', 'Nail Art', 'Beauty', 'Eyelash', 'Waxing', 'Paket'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Harga (Rp)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="75000" />
              </div>
              <div className="form-group">
                <label>Emoji</label>
                <input type="text" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="💅" maxLength={4} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveService}><i className="fas fa-save"></i> Simpan</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
