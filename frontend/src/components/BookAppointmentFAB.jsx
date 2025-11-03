import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';

export default function BookAppointmentFAB() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/dashboard/admin');
  const isConsultantArea = pathname.startsWith('/consultant') || pathname.startsWith('/dashboard/consultant');
  const isAppointmentForm = pathname === '/appointments/new';

  const canShow =
    user &&
    (user.role === 'student' || user.role === 'client') &&
    !isAdminArea &&
    !isConsultantArea &&
    !isAppointmentForm;

  if (!canShow) return null;

  return (
    <Link to="/appointments/new" className="fab-book-appointment" aria-label="Book Appointment">
      Book Appointment
    </Link>
  );
}
