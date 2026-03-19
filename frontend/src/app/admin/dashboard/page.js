'use client';
import { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { ShoppingBag, CalendarDays, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [orderStats, setOrderStats] = useState(null);
  const [reservationStats, setReservationStats] = useState(null);

  useEffect(() => {
    api.getOrderStats().then(setOrderStats).catch(() => {});
    api.getReservationStats().then(setReservationStats).catch(() => {});
  }, []);

  const StatCard = ({ icon: Icon, label, value, color = 'gold' }) => (
    <div className="card-dark p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-lounge-500 tracking-wider uppercase mb-1">{label}</p>
          <p className="text-3xl font-serif text-lounge-100 font-bold">{value ?? '—'}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 flex items-center justify-center`}>
          <Icon size={20} className={`text-${color}-500/70`} />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-serif text-lounge-100 mb-8">Dashboard</h1>

      {/* Order Stats */}
      <h2 className="text-sm text-lounge-500 tracking-wider uppercase mb-4">Orders</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={ShoppingBag} label="Total Orders" value={orderStats?.total} />
        <StatCard icon={Clock} label="Today's Orders" value={orderStats?.today} />
        <StatCard icon={AlertCircle} label="Pending" value={orderStats?.pending} />
        <div className="card-dark p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-lounge-500 tracking-wider uppercase mb-1">Today&apos;s Revenue</p>
              <p className="text-3xl font-serif text-gold-400 font-bold">
                €{parseFloat(orderStats?.todayRevenue ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign size={20} className="text-green-500/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Stats */}
      <h2 className="text-sm text-lounge-500 tracking-wider uppercase mb-4">Reservations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Total Reservations" value={reservationStats?.total} />
        <StatCard icon={Clock} label="Today" value={reservationStats?.today} />
        <StatCard icon={AlertCircle} label="Pending" value={reservationStats?.pending} />
        <StatCard icon={CheckCircle} label="Upcoming Confirmed" value={reservationStats?.upcoming} />
      </div>
    </div>
  );
}
