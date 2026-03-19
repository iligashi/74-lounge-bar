'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/language';
import { useCart } from '../../lib/cart';
import { api } from '../../lib/api';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag, CheckCircle, Banknote, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderPage() {
  const { t, lang, toggleLang, localizedField } = useLanguage();
  const { items, addItem, updateQuantity, removeItem, clearCart, total, count } = useCart();
  const [menu, setMenu] = useState([]);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: '', phone: '', table_number: '', notes: '' });

  useEffect(() => {
    api.getMenu().then(setMenu).catch(() => {});
  }, []);

  const handleAddItem = (item) => {
    addItem({
      id: item.id,
      menu_item_id: item.id,
      name: localizedField(item, 'name'),
      price: item.price,
    });
    toast.success(lang === 'al' ? 'U shtua në shportë' : 'Added to cart');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone) {
      toast.error(lang === 'al' ? 'Plotëso emrin dhe telefonin' : 'Please fill name and phone');
      return;
    }
    if (items.length === 0) {
      toast.error(lang === 'al' ? 'Shporta është bosh' : 'Cart is empty');
      return;
    }
    setSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        menu_item_id: item.menu_item_id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));
      const result = await api.createOrder({ ...form, items: orderItems });
      setOrderNumber(result.order_number);
      clearCart();
      setSuccess(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-lounge-950 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <CheckCircle size={64} className="mx-auto mb-6 text-green-500" />
          <h1 className="text-3xl font-serif text-lounge-100 mb-3">{t('order_success')}</h1>
          <p className="text-lounge-400 mb-2">{t('order_success_msg')}</p>
          <div className="card-dark p-4 my-6">
            <p className="text-xs text-lounge-500 uppercase tracking-wider mb-1">
              {lang === 'al' ? 'Numri i porosisë' : 'Order number'}
            </p>
            <p className="text-2xl font-serif text-gold-400 font-bold">{orderNumber}</p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gold-500/70 mb-8">
            <Banknote size={18} />
            <span className="text-sm">{t('cash_only')}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/menu" className="btn-outline">{t('view_menu')}</Link>
            <Link href="/" className="btn-gold">{t('back_to_site')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lounge-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-lounge-950/95 backdrop-blur-md border-b border-lounge-800/30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/menu" className="flex items-center space-x-2 text-lounge-400 hover:text-gold-400 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-xs tracking-wider uppercase hidden sm:block">{t('view_menu')}</span>
          </Link>
          <h1 className="text-lg font-serif text-gold-400">{t('order_title')}</h1>
          <button onClick={toggleLang}
            className="flex items-center space-x-1 text-lounge-400 hover:text-gold-400 transition-colors">
            <Globe size={16} />
            <span className="text-xs tracking-wider uppercase">{lang === 'al' ? 'EN' : 'AL'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Menu Browse */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-serif text-lounge-200 mb-6">{t('menu_title')}</h2>
            {menu.map(category => (
              <div key={category.id} className="mb-8">
                <h3 className="text-sm tracking-[0.2em] text-gold-500/70 uppercase mb-4 font-serif">
                  {localizedField(category, 'name')}
                </h3>
                <div className="space-y-2">
                  {category.items.map(item => (
                    <div key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-lounge-900/30 transition-colors group">
                      <div className="flex-1 min-w-0 mr-4">
                        <h4 className="font-serif text-sm text-lounge-200 group-hover:text-gold-400 transition-colors">
                          {localizedField(item, 'name')}
                        </h4>
                        <p className="text-xs text-lounge-600 mt-0.5 truncate">{localizedField(item, 'description')}</p>
                      </div>
                      <span className="text-gold-400/80 text-sm font-serif mr-3">€{parseFloat(item.price).toFixed(2)}</span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gold-500/30
                                   text-gold-500/50 hover:bg-gold-500 hover:text-lounge-950 hover:border-gold-500 transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="card-dark p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <ShoppingBag size={18} className="text-gold-500/70" />
                  <h2 className="text-lg font-serif text-lounge-200">{t('your_cart')}</h2>
                  <span className="text-xs text-lounge-500">({count})</span>
                </div>

                {items.length === 0 ? (
                  <p className="text-center text-lounge-600 text-sm py-8">{t('cart_empty')}</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="text-sm text-lounge-200 truncate">{item.name}</p>
                            <p className="text-xs text-gold-500/60">€{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-lounge-700/50 text-lounge-400 hover:text-lounge-200">
                              <Minus size={10} />
                            </button>
                            <span className="text-sm text-lounge-300 w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded border border-lounge-700/50 text-lounge-400 hover:text-lounge-200">
                              <Plus size={10} />
                            </button>
                            <button onClick={() => removeItem(item.id)} className="text-red-500/50 hover:text-red-400 ml-1">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-lounge-800/30 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-lounge-400">{t('total')}</span>
                        <span className="text-xl font-serif text-gold-400 font-bold">€{total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-2">
                        <Banknote size={14} className="text-gold-500/50" />
                        <span className="text-xs text-gold-500/50">{t('cash_only')}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitOrder} className="space-y-3">
                      <input type="text" placeholder={t('name') + ' *'} value={form.customer_name}
                        onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                        className="input-field text-sm" required />
                      <input type="tel" placeholder={t('phone') + ' *'} value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="input-field text-sm" required />
                      <input type="text" placeholder={t('table_number')} value={form.table_number}
                        onChange={e => setForm(f => ({ ...f, table_number: e.target.value }))}
                        className="input-field text-sm" />
                      <textarea placeholder={t('notes')} value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                        className="input-field text-sm resize-none" rows={2} />
                      <button type="submit" disabled={submitting} className="btn-gold w-full">
                        {submitting ? t('loading') : t('place_order')}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
