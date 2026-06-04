"use client";

import { formatRupiah, formatDateTime } from "@/lib/utils";

export default function Receipt({ transaction, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return null;

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal" style={{ maxWidth: "400px" }}>
        <div className="modal-header">
          <h3>Struk Pembayaran</h3>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body">
          <div className="receipt">
            <div className="receipt-header" style={{ textAlign: "center" }}>
              <h2 style={{ color: "#e91e8c" }}>TmDash Nail &amp; Beauty Studio</h2>
              <p>Jl. Contoh Alamat No. 123</p>
              <p>Telp: 0812-3456-7890</p>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-info">
              <p>
                <strong>No:</strong> {transaction.id}
              </p>
              <p>
                <strong>Tanggal:</strong> {formatDateTime(transaction.created_at)}
              </p>
              <p>
                <strong>Kasir:</strong> {transaction.cashier_name}
              </p>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-items">
              <table>
                <thead>
                  <tr>
                    <th>Layanan</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {transaction.items &&
                    transaction.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.service_name}</td>
                        <td>{item.qty}</td>
                        <td>{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <hr className="receipt-divider" />

            <div className="receipt-total">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>

            <div className="receipt-footer" style={{ textAlign: "center" }}>
              <p>Terima kasih atas kunjungan Anda!</p>
              <p>Beauty is our passion ✨</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <i className="fas fa-print"></i> Cetak
          </button>
        </div>
      </div>
    </div>
  );
}
