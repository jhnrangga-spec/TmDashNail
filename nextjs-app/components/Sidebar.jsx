"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Sidebar({ user, pendingBookings }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { href: "/dashboard", icon: "fa-home", label: "Dashboard", exact: true },
    { href: "/dashboard/pos", icon: "fa-cash-register", label: "Kasir / POS" },
    { href: "/dashboard/services", icon: "fa-concierge-bell", label: "Layanan" },
    { href: "/dashboard/transactions", icon: "fa-receipt", label: "Riwayat Transaksi" },
    { href: "/dashboard/bookings", icon: "fa-calendar-check", label: "Booking" },
  ];

  const isActive = (href, exact) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const firstLetter = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?";

  return (
    <>
      <button className="btn-menu" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="logo-icon">
            <Image src="/logo.png" alt="TmDash Logo" width={50} height={50} />
          </div>
          <h2>TmDash</h2>
          <span>Nail & Beauty Studio</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href, item.exact) ? "active" : ""}`}
              onClick={closeSidebar}
            >
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
              {item.href === "/dashboard/bookings" && pendingBookings > 0 && (
                <span className="nav-badge">{pendingBookings}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{firstLetter}</div>
            <div className="user-details">
              <h4>{user?.fullName || "User"}</h4>
              <span>{user?.role || "Staff"}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
