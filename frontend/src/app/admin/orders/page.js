'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../lib/api';
import { Clock, ChefHat, CheckCircle, XCircle, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  preparing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/10 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const statusIcons = {
  pending: Clock,
  preparing: ChefHat,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(() => {
    const params = { page, limit: 15 };
    if (filter) params.status = filter;
    api.getOrders(params).then(data => {
      setOrders(data.orders);
      setTotalPages(data.totalPages);
    }).catch(() => {});
  }, [page, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      toast.success('Status updated');
      fetchOrders();
      if (selected?.id === id) setSelected(s => ({ ...s, status }));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-serif text-lounge-100">Orders</h1>
        <div className="flex space-x-2">
          {['', 'pending', 'preparing', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 text-xs rounded tracking-wider uppercase transition-all ${
                filter === s ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30' : 'text-lounge-500 hover:text-lounge-300 border border-transparent'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-lounge-800/30">
                <th className="text-left px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium">Order</th>
                <th className="text-left px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium">Customer</th>
                <th className="text-left px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium hidden md:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium">Total</th>
                <th className="text-left px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium hidden lg:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs text-lounge-500 tracking-wider uppercase font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <tr key={order.id} className="border-b border-lounge-800/20 hover:bg-lounge-900/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gold-400">{order.order_number}</td>
                    <td className="px-4 py-3 text-lounge-200">{order.customer_name}</td>
                    <td className="px-4 py-3 text-lounge-400 hidden md:table-cell">{order.phone}</td>
                    <td className="px-4 py-3 text-gold-400 font-serif">€{parseFloat(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs border ${statusColors[order.status]}`}>
                        <StatusIcon size={12} />
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-lounge-500 text-xs hidden lg:table-cell">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => setSelected(order)}
                          className="p-1.5 text-lounge-500 hover:text-gold-400 transition-colors">
                          <Eye size={14} />
                        </button>
                        {order.status === 'pending' && (
                          <button onClick={() => updateStatus(order.id, 'preparing')}
                            className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors">
                            Prepare
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button onClick={() => updateStatus(order.id, 'completed')}
                            className="px-2 py-1 text-xs bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors">
                            Complete
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'preparing') && (
                          <button onClick={() => updateStatus(order.id, 'cancelled')}
                            className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-lounge-600">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-lounge-800/30">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded text-xs ${p === page ? 'bg-gold-500/15 text-gold-400' : 'text-lounge-500 hover:text-lounge-300'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={() => setSelected(null)}>
          <div className="card-dark p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif text-gold-400">{selected.order_number}</h2>
              <button onClick={() => setSelected(null)} className="text-lounge-500 hover:text-lounge-300"><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-lounge-500">Customer</span><span className="text-lounge-200">{selected.customer_name}</span></div>
              <div className="flex justify-between"><span className="text-lounge-500">Phone</span><span className="text-lounge-200">{selected.phone}</span></div>
              {selected.table_number && <div className="flex justify-between"><span className="text-lounge-500">Table</span><span className="text-lounge-200">{selected.table_number}</span></div>}
              {selected.notes && <div><span className="text-lounge-500">Notes:</span><p className="text-lounge-300 mt-1">{selected.notes}</p></div>}

              <div className="border-t border-lounge-800/30 pt-3 mt-3">
                <p className="text-xs text-lounge-500 tracking-wider uppercase mb-2">Items</p>
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-1">
                    <span className="text-lounge-300">{item.quantity}x {item.item_name}</span>
                    <span className="text-gold-400/70">€{(parseFloat(item.item_price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-2 border-t border-lounge-800/30 font-bold">
                  <span className="text-lounge-300">Total</span>
                  <span className="text-gold-400">€{parseFloat(selected.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
