'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../lib/api';
import { Clock, ChefHat, CheckCircle, XCircle, Eye, X, Printer, MessageCircle } from 'lucide-react';
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

  const generateInvoiceHTML = (order) => {
    const itemsRows = (order.items || []).map(item =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#d4c5a0;">${item.quantity}x ${item.item_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#c4a44a;text-align:right;">€${(parseFloat(item.item_price) * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    return `<!DOCTYPE html><html><head><title>Invoice ${order.order_number}</title>
      <style>
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 20mm; } }
        body { font-family: 'Georgia', serif; background: #0d0b08; color: #e8e0d0; margin: 0; padding: 40px; }
        .invoice { max-width: 500px; margin: 0 auto; border: 1px solid #2a2218; padding: 40px; background: #141210; }
        .header { text-align: center; border-bottom: 2px solid #c4a44a; padding-bottom: 20px; margin-bottom: 24px; }
        .header h1 { font-size: 28px; color: #c4a44a; margin: 0 0 4px 0; letter-spacing: 3px; }
        .header p { color: #8a7a5a; font-size: 12px; letter-spacing: 2px; margin: 0; }
        .meta { display: flex; justify-content: space-between; font-size: 13px; color: #8a7a5a; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #2a2218; }
        .meta div span { display: block; color: #d4c5a0; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8a7a5a; border-bottom: 1px solid #2a2a2a; }
        th:last-child { text-align: right; }
        .total-row td { border-top: 2px solid #c4a44a; font-weight: bold; font-size: 16px; padding-top: 12px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #2a2218; font-size: 12px; color: #6a5a3a; }
      </style></head><body>
      <div class="invoice">
        <div class="header">
          <h1>74 LOUNGE BAR</h1>
          <p>INVOICE</p>
        </div>
        <div class="meta">
          <div>Order<span>${order.order_number}</span></div>
          <div>Date<span>${new Date(order.created_at).toLocaleDateString()}</span></div>
          <div>Customer<span>${order.customer_name}</span></div>
        </div>
        ${order.table_number ? `<p style="font-size:13px;color:#8a7a5a;margin-bottom:16px;">Table: <span style="color:#d4c5a0;">${order.table_number}</span></p>` : ''}
        <table>
          <thead><tr><th>Item</th><th style="text-align:right;">Amount</th></tr></thead>
          <tbody>
            ${itemsRows}
            <tr class="total-row">
              <td style="padding:12px;color:#d4c5a0;">Total</td>
              <td style="padding:12px;color:#c4a44a;text-align:right;">€${parseFloat(order.total).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        <div class="footer">
          <p>Thank you for visiting 74 Lounge Bar</p>
          <p>Cash Payment Only</p>
        </div>
      </div></body></html>`;
  };

  const printInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=800');
    printWindow.document.write(generateInvoiceHTML(order));
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 300);
  };

  const sendWhatsApp = (order) => {
    const phone = order.phone.replace(/[^0-9]/g, '');
    const items = (order.items || []).map(i => `  ${i.quantity}x ${i.item_name} - €${(parseFloat(i.item_price) * i.quantity).toFixed(2)}`).join('\n');
    const message = `*74 LOUNGE BAR - Order Invoice*\n\nOrder: ${order.order_number}\nDate: ${new Date(order.created_at).toLocaleDateString()}\n\n*Items:*\n${items}\n\n*Total: €${parseFloat(order.total).toFixed(2)}*\n\nThank you for your order! 🍸\nPayment: Cash Only`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
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
                        {order.status === 'completed' && (
                          <>
                            <button onClick={() => printInvoice(order)}
                              title="Print Invoice"
                              className="p-1.5 text-lounge-500 hover:text-gold-400 transition-colors">
                              <Printer size={14} />
                            </button>
                            <button onClick={() => sendWhatsApp(order)}
                              title="Send Invoice via WhatsApp"
                              className="p-1.5 text-lounge-500 hover:text-green-400 transition-colors">
                              <MessageCircle size={14} />
                            </button>
                          </>
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

              {selected.status === 'completed' && (
                <div className="flex gap-3 pt-4 mt-4 border-t border-lounge-800/30">
                  <button onClick={() => printInvoice(selected)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gold-500/10 text-gold-400 rounded hover:bg-gold-500/20 transition-colors text-sm">
                    <Printer size={15} />
                    Print Invoice
                  </button>
                  <button onClick={() => sendWhatsApp(selected)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors text-sm">
                    <MessageCircle size={15} />
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
