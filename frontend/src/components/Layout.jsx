// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import '@styles/App.css';
import layoutStyles from '@styles/Layout.module.css';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import BookAppointmentFAB from '@/components/BookAppointmentFAB.jsx'; // <- floating CTA

function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toggleSidebar = () => setSidebarCollapsed((s) => !s);

  return (
    <div
      className={`${layoutStyles['app-shell']} ${
        sidebarCollapsed ? layoutStyles['app-shell--collapsed'] : ''
      }`}
    >
      {/* Sidebar */}
      <div className={layoutStyles['app-shell__sidebar']}>
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Header */}
      <div className={layoutStyles['app-shell__header']}>
        <Header />
      </div>

      {/* Main Content */}
      <div className={layoutStyles['app-shell__content']}>
        {/* (Removed the old top "Book Appointment" link) */}
        <Outlet />
      </div>

      {/* Floating "Book Appointment" button (student/client only) */}
      <BookAppointmentFAB />
    </div>
  );
}

export default Layout;
