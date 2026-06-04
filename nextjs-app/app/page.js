'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { formatRupiah, generateBookingId } from '@/lib/utils';

export default function LandingPage() {
  const supabase = createClient();

  // ── State ──
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedService, setSelectedService] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bookingRef = useRef(null);

  // ── Scroll listener for navbar ──
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Fetch services ──
  useEffect(() => {
    async function fetchServices() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .neq('category', 'Paket')
        .order('id');
      if (data) setServices(data);
    }
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch packages ──
  useEffect(() => {
    async function fetchPackages() {
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('category', 'Paket')
        .order('id');
      if (data) setPackages(data);
    }
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ──
  const categories = ['Semua', 'Nail Art', 'Nail Care', 'Beauty', 'Eyelash', 'Waxing'];

  const filteredServices =
    activeCategory === 'Semua'
      ? services
      : services.filter((s) => s.category === activeCategory);

  const scrollToBooking = (serviceId) => {
    if (serviceId) setSelectedService(serviceId);
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const timeSlots = [];
  for (let h = 9; h <= 20; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 20) timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  // Group services by category for optgroup
  const groupedServices = services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = [];
    acc[svc.category].push(svc);
    return acc;
  }, {});
  // Add packages
  if (packages.length > 0) {
    groupedServices['Paket'] = packages;
  }

  // ── Package details (hardcoded) ──
  const packageDetails = [
    {
      name: 'Paket Mani-Pedi',
      desc: 'Perawatan lengkap untuk tangan dan kaki Anda agar selalu tampil cantik dan terawat.',
      includes: [
        'Manicure lengkap',
        'Pedicure lengkap',
        'Nail polish pilihan',
        'Hand & foot massage',
      ],
      featured: false,
    },
    {
      name: 'Paket Bridal Nail',
      desc: 'Paket spesial untuk hari istimewa Anda. Tampil sempurna di hari pernikahan.',
      includes: [
        'Gel manicure premium',
        'Nail art custom design',
        'Pedicure lengkap',
        'Nail extension (opsional)',
        'Free 1x touch up',
      ],
      featured: true,
    },
    {
      name: 'Paket Beauty Complete',
      desc: 'Paket lengkap untuk tampil cantik dari ujung kaki hingga ujung rambut.',
      includes: [
        'Gel manicure & pedicure',
        'Nail art medium',
        'Eyelash extension natural',
        'Facial glowing',
        'Free aftercare kit',
      ],
      featured: false,
    },
  ];

  const galleryItems = [
    { title: 'Nail Art Floral', gradient: 'linear-gradient(135deg, #ff9a9e, #fad0c4)', icon: 'fa-hand-sparkles' },
    { title: 'Gel Extension', gradient: 'linear-gradient(135deg, #a1c4fd, #c2e9fb)', icon: 'fa-gem' },
    { title: 'Eyelash Volume', gradient: 'linear-gradient(135deg, #fbc2eb, #f6a085)', icon: 'fa-eye' },
    { title: 'Facial Glowing', gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)', icon: 'fa-spa' },
    { title: 'Chrome Nails', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', icon: 'fa-palette' },
    { title: 'Bridal Set', gradient: 'linear-gradient(135deg, #c471f5, #fa71cd)', icon: 'fa-crown' },
  ];

  const testimonials = [
    {
      name: 'Rina S.',
      role: 'Pelanggan Setia',
      quote: 'Sudah 3 tahun jadi pelanggan TmDash dan selalu puas dengan hasilnya. Nail art-nya selalu keren dan up to date!',
      avatar: 'R',
    },
    {
      name: 'Dinda A.',
      role: 'Pelanggan Baru',
      quote: 'Pertama kali coba langsung suka! Tempatnya bersih, terapisnya ramah, dan hasilnya bagus banget. Pasti balik lagi!',
      avatar: 'D',
    },
    {
      name: 'Maya P.',
      role: 'Bride-to-be',
      quote: 'Paket bridal nail-nya luar biasa! Semua teman-teman di wedding aku pada nanyain kuku aku dimana. Highly recommended!',
      avatar: 'M',
    },
  ];

  // ── Submit booking ──
  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const bookingId = generateBookingId();
    const allSvc = [...services, ...packages];
    const chosenSvc = allSvc.find((s) => String(s.id) === String(selectedService));

    const payload = {
      booking_id: bookingId,
      customer_name: formName,
      phone: formPhone,
      service_id: selectedService ? Number(selectedService) : null,
      booking_date: formDate,
      booking_time: formTime,
      notes: formNotes,
      status: 'pending',
    };

    const { error } = await supabase.from('bookings').insert([payload]);

    setSubmitting(false);

    if (!error) {
      setBookingSuccess({
        bookingId,
        name: formName,
        phone: formPhone,
        service: chosenSvc?.name || '-',
        date: formDate,
        time: formTime,
        notes: formNotes,
      });
      setFormName('');
      setFormPhone('');
      setSelectedService('');
      setFormDate('');
      setFormTime('');
      setFormNotes('');
    }
  };

  // ── Render ──
  return (
    <>
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          <a href="#hero" className="nav-brand">
            <i className="fas fa-spa"></i>
            <span>TmDash</span>
            <small>Nail &amp; Beauty</small>
          </a>

          <div className={`nav-links${navOpen ? ' nav-open' : ''}`}>
            {['Beranda', 'Layanan', 'Paket', 'Galeri', 'Booking', 'Kontak'].map((item) => {
              const idMap = {
                Beranda: '#hero',
                Layanan: '#services',
                Paket: '#packages',
                Galeri: '#gallery',
                Booking: '#booking',
                Kontak: '#contact',
              };
              return (
                <a
                  key={item}
                  href={idMap[item]}
                  className="nav-link"
                  onClick={() => setNavOpen(false)}
                >
                  {item}
                </a>
              );
            })}
          </div>

          <button className="nav-toggle" onClick={() => setNavOpen(!navOpen)}>
            <i className={`fas ${navOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section id="hero" className="hero">
        <div className="container hero-content">
          <span className="hero-badge">
            <i className="fas fa-spa"></i> Nail &amp; Beauty Studio
          </span>
          <h1>
            Tampil Cantik Mulai dari <span className="text-gradient">Ujung Jari</span>
          </h1>
          <p className="hero-desc">
            Nikmati pengalaman perawatan nail art dan kecantikan terbaik dengan produk premium dan
            terapis berpengalaman. Jadikan setiap momen spesial dimulai dari ujung jari Anda.
          </p>
          <div className="hero-actions">
            <a href="#booking" className="btn btn-primary btn-lg">
              <i className="fas fa-calendar-check"></i> Buat Janji
            </a>
            <a href="#services" className="btn btn-outline btn-lg">
              <i className="fas fa-eye"></i> Lihat Layanan
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>500+</strong>
              <span>Pelanggan Puas</span>
            </div>
            <div className="hero-stat">
              <strong>20+</strong>
              <span>Jenis Layanan</span>
            </div>
            <div className="hero-stat">
              <strong>5+</strong>
              <span>Tahun Pengalaman</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ WHY US ════════════════ */}
      <section id="why-us" className="section section-dark">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Kenapa Kami?</span>
            <h2>Alasan Memilih TmDash</h2>
            <p>Kami menghadirkan pengalaman perawatan terbaik untuk Anda</p>
          </div>
          <div className="features-grid">
            {[
              { icon: 'fa-gem', title: 'Produk Premium', desc: 'Menggunakan produk berkualitas tinggi dari brand ternama untuk hasil yang tahan lama.' },
              { icon: 'fa-user-md', title: 'Terapis Berpengalaman', desc: 'Tim terapis profesional yang terlatih dan bersertifikasi di bidangnya.' },
              { icon: 'fa-shield-alt', title: 'Higienis & Steril', desc: 'Semua peralatan disterilkan sebelum digunakan untuk keamanan Anda.' },
              { icon: 'fa-heart', title: 'Pelayanan Terbaik', desc: 'Pelayanan ramah dan nyaman yang membuat Anda merasa seperti di rumah sendiri.' },
            ].map((feat) => (
              <div className="feature-card" key={feat.title}>
                <div className="feature-icon">
                  <i className={`fas ${feat.icon}`}></i>
                </div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ SERVICES ════════════════ */}
      <section id="services" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Menu Layanan</span>
            <h2>Layanan Kami</h2>
            <p>Pilih layanan perawatan terbaik sesuai kebutuhan Anda</p>
          </div>

          <div className="svc-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`svc-cat-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="services-showcase">
            {filteredServices.map((svc) => (
              <div className="svc-card" key={svc.id}>
                <div className="svc-card-emoji">{svc.emoji || '💅'}</div>
                <h3>{svc.name}</h3>
                <span className="svc-category">{svc.category}</span>
                <div className="svc-price">{formatRupiah(svc.price)}</div>
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => scrollToBooking(String(svc.id))}
                >
                  Booking Sekarang
                </button>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <p style={{ textAlign: 'center', gridColumn: '1/-1', opacity: 0.6 }}>
                Belum ada layanan di kategori ini.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════ PACKAGES ════════════════ */}
      <section id="packages" className="section section-dark">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Paket Hemat</span>
            <h2>Paket Spesial</h2>
            <p>Dapatkan harga spesial dengan paket perawatan lengkap</p>
          </div>

          <div className="packages-grid">
            {packageDetails.map((pkg, idx) => {
              const dbPkg = packages.find((p) => p.name === pkg.name);
              return (
                <div className={`package-card${pkg.featured ? ' package-featured' : ''}`} key={idx}>
                  {pkg.featured && <div className="package-badge">BEST SELLER</div>}
                  <div className="package-emoji">{dbPkg?.emoji || '💎'}</div>
                  <h3>{pkg.name}</h3>
                  <p className="package-desc">{pkg.desc}</p>
                  <ul className="package-includes">
                    {pkg.includes.map((item, i) => (
                      <li key={i}>
                        <i className="fas fa-check"></i> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="package-price">
                    {dbPkg ? formatRupiah(dbPkg.price) : '-'}
                  </div>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => scrollToBooking(dbPkg ? String(dbPkg.id) : '')}
                  >
                    Pilih Paket Ini
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ GALLERY ════════════════ */}
      <section id="gallery" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Portofolio</span>
            <h2>Galeri Kami</h2>
            <p>Lihat hasil karya terbaik dari tim kami</p>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item, idx) => (
              <div
                className="gallery-placeholder"
                key={idx}
                style={{ background: item.gradient }}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ BOOKING ════════════════ */}
      <section id="booking" className="section section-dark" ref={bookingRef}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Reservasi</span>
            <h2>Buat Janji Sekarang</h2>
            <p>Booking online untuk pengalaman yang lebih nyaman</p>
          </div>

          <div className="booking-container">
            {/* Left – Info */}
            <div className="booking-info">
              <h3>Kenapa Harus Booking?</h3>
              <div className="booking-benefits">
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Tidak perlu antri lama</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Pilih jadwal sesuai keinginan</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Terapis sudah siap saat Anda datang</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Konfirmasi instan via WhatsApp</span>
                </div>
              </div>

              <div className="booking-hours">
                <h4><i className="fas fa-clock"></i> Jam Operasional</h4>
                <p>Senin - Sabtu: 09:00 - 21:00</p>
                <p>Minggu: 10:00 - 20:00</p>
              </div>

              <div className="booking-location">
                <h4><i className="fas fa-map-marker-alt"></i> Lokasi</h4>
                <p>Jl. Kecantikan No. 123, Jakarta Selatan</p>
              </div>
            </div>

            {/* Right – Form */}
            <div className="booking-form-card">
              <form onSubmit={handleBooking}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Masukkan nama Anda"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>No. WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      required
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Pilih Layanan</label>
                  <select
                    required
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="">-- Pilih Layanan --</option>
                    {Object.keys(groupedServices).map((cat) => (
                      <optgroup label={cat} key={cat}>
                        {groupedServices[cat].map((svc) => (
                          <option key={svc.id} value={svc.id}>
                            {svc.name} - {formatRupiah(svc.price)}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tanggal</label>
                    <input
                      type="date"
                      required
                      min={tomorrow()}
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Waktu</label>
                    <select
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                    >
                      <option value="">-- Pilih Waktu --</option>
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Catatan (opsional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tulis catatan atau request khusus..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={submitting}>
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-calendar-check"></i> Konfirmasi Booking
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section id="testimonials" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Testimoni</span>
            <h2>Apa Kata Mereka?</h2>
            <p>Cerita pelanggan kami yang sudah merasakan layanan TmDash</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <div className="testimonial-card" key={idx}>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <i className="fas fa-star" key={i}></i>
                  ))}
                </div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>
                <i className="fas fa-spa"></i> TmDash
              </h3>
              <p>
                Studio nail art dan kecantikan terpercaya. Tampil cantik dan percaya diri mulai dari
                ujung jari Anda.
              </p>
              <div className="social-links">
                <a href="#"><i className="fab fa-instagram"></i></a>
                <a href="#"><i className="fab fa-tiktok"></i></a>
                <a href="#"><i className="fab fa-whatsapp"></i></a>
                <a href="#"><i className="fab fa-facebook"></i></a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Menu</h4>
              <a href="#hero">Beranda</a>
              <a href="#services">Layanan</a>
              <a href="#packages">Paket</a>
              <a href="#gallery">Galeri</a>
              <a href="#booking">Booking</a>
            </div>

            <div className="footer-links">
              <h4>Layanan</h4>
              <a href="#services">Nail Art</a>
              <a href="#services">Nail Care</a>
              <a href="#services">Beauty</a>
              <a href="#services">Eyelash</a>
              <a href="#services">Waxing</a>
            </div>

            <div className="footer-contact">
              <h4>Kontak</h4>
              <p><i className="fas fa-map-marker-alt"></i> Jl. Kecantikan No. 123, Jakarta Selatan</p>
              <p><i className="fas fa-phone"></i> +62 812-3456-7890</p>
              <p><i className="fas fa-envelope"></i> hello@tmdash.id</p>
              <p><i className="fas fa-clock"></i> Sen-Sab 09:00-21:00</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 TmDash Nail &amp; Beauty Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ════════════════ BOOKING SUCCESS MODAL ════════════════ */}
      {bookingSuccess && (
        <div className="modal-overlay" onClick={() => setBookingSuccess(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Booking Berhasil!</h2>
            <p>Terima kasih, booking Anda telah kami terima.</p>

            <div className="booking-detail-card">
              <div className="detail-row">
                <span>Booking ID</span>
                <strong>{bookingSuccess.bookingId}</strong>
              </div>
              <div className="detail-row">
                <span>Nama</span>
                <strong>{bookingSuccess.name}</strong>
              </div>
              <div className="detail-row">
                <span>WhatsApp</span>
                <strong>{bookingSuccess.phone}</strong>
              </div>
              <div className="detail-row">
                <span>Layanan</span>
                <strong>{bookingSuccess.service}</strong>
              </div>
              <div className="detail-row">
                <span>Tanggal</span>
                <strong>{bookingSuccess.date}</strong>
              </div>
              <div className="detail-row">
                <span>Waktu</span>
                <strong>{bookingSuccess.time}</strong>
              </div>
              {bookingSuccess.notes && (
                <div className="detail-row">
                  <span>Catatan</span>
                  <strong>{bookingSuccess.notes}</strong>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={() => setBookingSuccess(null)}
            >
              Oke, Mengerti!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
