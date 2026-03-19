'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/language';
import { api } from '../../lib/api';
import { ArrowLeft, Phone, CheckCircle, Globe, Calendar, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReservationPage() {
  const { t, lang, toggleLang } = useLanguage();
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', phone: '', date: '', time: '', guests: '', notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.phone || !form.date || !form.time || !form.guests) {
      toast.error(lang === 'al' ? 'Plotëso të gjitha fushat e detyrueshme' : 'Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.createReservation({ ...form, guests: parseInt(form.guests) });
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
          <h1 className="text-3xl font-serif text-lounge-100 mb-3">{t('reservation_success')}</h1>
          <p className="text-lounge-400 mb-6">{t('reservation_success_msg')}</p>
          <div className="card-dark p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-gold-400">
              <Phone size={18} />
              <span className="text-sm">{t('reservation_note')}</span>
            </div>
          </div>
          <Link href="/" className="btn-gold">{t('back_to_site')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lounge-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-lounge-950/95 backdrop-blur-md border-b border-lounge-800/30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-lounge-400 hover:text-gold-400 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-xs tracking-wider uppercase hidden sm:block">{t('back_to_site')}</span>
          </Link>
          <h1 className="text-lg font-serif text-gold-400">{t('reservation_title')}</h1>
          <button onClick={toggleLang}
            className="flex items-center space-x-1 text-lounge-400 hover:text-gold-400 transition-colors">
            <Globe size={16} />
            <span className="text-xs tracking-wider uppercase">{lang === 'al' ? 'EN' : 'AL'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="w-12 h-px bg-gold-500/30" />
            <span className="text-xs tracking-[0.3em] text-gold-500/50 uppercase">74 Lounge Bar</span>
            <span className="w-12 h-px bg-gold-500/30" />
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-lounge-100 mb-4">{t('reservation_title')}</h2>
          <div className="gold-divider mb-6" />

          {/* Phone confirmation notice */}
          <div className="card-dark p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gold-400/80">
              <Phone size={16} />
              <span className="text-sm font-light">{t('reservation_note')}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-lounge-500 tracking-wider uppercase mb-2">{t('name')} *</label>
            <input type="text" value={form.customer_name}
              onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
              className="input-field" required />
          </div>

          <div>
            <label className="block text-xs text-lounge-500 tracking-wider uppercase mb-2">{t('phone')} *</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-lounge-500 tracking-wider uppercase mb-2">{t('date')} *</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="input-field" required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-xs text-lounge-500 tracking-wider uppercase mb-2">{t('time')} *</label>
              <input type="time" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-xs text-lounge-500 tracking-wider uppercase mb-2">{t('guests')} *</label>
            <select value={form.guests}
              onChange={e => setForm(f => ({ ...f, guests: e.target.value }))}
              className="input-field" required>
              <option value="">—</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} {lang === 'al' ? (n === 1 ? 'person' : 'persona') : (n === 1 ? 'guest' : 'guests')}</option>
              ))}
              <option value="11">10+ ({lang === 'al' ? 'specifikoni në shënime' : 'specify in notes'})</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-lounge-500 tracking-wider uppercase mb-2">{t('notes')}</label>
            <textarea value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="input-field resize-none" rows={3}
              placeholder={lang === 'al' ? 'Kërkesa të veçanta, raste speciale...' : 'Special requests, occasions...'} />
          </div>

          <button type="submit" disabled={submitting} className="btn-gold w-full mt-4">
            {submitting ? t('loading') : t('submit_reservation')}
          </button>
        </form>
      </div>
    </div>
  );
}
