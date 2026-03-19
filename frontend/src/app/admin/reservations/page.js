'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';
import { Clock, CheckCircle, XCircle, Phone, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReservations = useCallback(() => {
    const params = { page, limit: 15 };
    if (filter) params.status = filter;
    api.getReservations(params).then(data => {
      setReservations(data.reservations);
      setTotalPages(data.totalPages);
    }).catch(() => {});
  }, [page, filter]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateReservationStatus(id, status);
      toast.success('Status updated');
      fetchReservations();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif text-lounge-100">Reservations</h1>
        <div className="flex space-x-2">
          {['', 'pending', 'confirmed', 'rejected'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded tracking-wider uppercase transition-all ${
                filter === s ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'text-lounge-500 hover:text-lounge-300 border border-transparent'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {reservations.map(res => (
          <div key={res.id} className="card-dark p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-serif text-lounge-100">{res.customer_name}</h3>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${statusColors[res.status]}`}>
                    {res.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-lounge-400">
                  <span className="flex items-center space-x-1.5"><Phone size={14} className="text-gold-500/50" /><span>{res.phone}</span></span>
                  <span className="flex items-center space-x-1.5"><Calendar size={14} className="text-gold-500/50" /><span>{res.date}</span></span>
                  <span className="flex items-center space-x-1.5"><Clock size={14} className="text-gold-500/50" /><span>{res.time}</span></span>
                  <span className="flex items-center space-x-1.5"><Users size={14} className="text-gold-500/50" /><span>{res.guests} guests</span></span>
                </div>
                {res.notes && <p className="text-sm text-lounge-500 italic">{res.notes}</p>}
              </div>

              <div className="flex items-center space-x-2">
                {res.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(res.id, 'confirmed')}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors">
                      <CheckCircle size={12} /><span>Confirm</span>
                    </button>
                    <button onClick={() => updateStatus(res.id, 'rejected')}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors">
                      <XCircle size={12} /><span>Reject</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {reservations.length === 0 && (
          <div className="text-center py-16 text-lounge-600">No reservations found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded text-xs ${p === page ? 'bg-gold-500/15 text-gold-400' : 'text-lounge-500 hover:text-lounge-300'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
