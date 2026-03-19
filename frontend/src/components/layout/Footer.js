'use client';
import Link from 'next/link';
import { useLanguage } from '../../lib/language';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react';

export default function Footer({ content }) {
  const { t, localizedContent } = useLanguage();

  return (
    <footer className="bg-lounge-950 border-t border-lounge-800/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-3xl font-serif font-bold text-gold-400">74</span>
              <span className="text-sm text-lounge-400 tracking-[0.3em] uppercase">Lounge Bar</span>
            </div>
            <p className="text-lounge-500 text-sm leading-relaxed">
              {localizedContent(content, 'hero_subtitle')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-serif">Links</h4>
            <div className="space-y-3">
              <Link href="/#about" className="block text-sm text-lounge-400 hover:text-lounge-200 transition-colors">{t('nav_about')}</Link>
              <Link href="/menu" className="block text-sm text-lounge-400 hover:text-lounge-200 transition-colors">{t('nav_menu')}</Link>
              <Link href="/reservation" className="block text-sm text-lounge-400 hover:text-lounge-200 transition-colors">{t('nav_reserve')}</Link>
              <Link href="/order" className="block text-sm text-lounge-400 hover:text-lounge-200 transition-colors">{t('nav_order')}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-serif">{t('nav_contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm text-lounge-400">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gold-500/60" />
                <span>{localizedContent(content, 'address')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-lounge-400">
                <Phone size={16} className="flex-shrink-0 text-gold-500/60" />
                <span>{localizedContent(content, 'phone')}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-lounge-400">
                <Mail size={16} className="flex-shrink-0 text-gold-500/60" />
                <span>{localizedContent(content, 'email')}</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-serif">{t('opening_hours')}</h4>
            <div className="flex items-start space-x-3 text-sm text-lounge-400">
              <Clock size={16} className="mt-0.5 flex-shrink-0 text-gold-500/60" />
              <span className="whitespace-pre-line">{localizedContent(content, 'opening_hours')}</span>
            </div>
            <div className="flex items-center space-x-4 mt-6">
              <a href={localizedContent(content, 'facebook')} target="_blank" rel="noopener noreferrer"
                className="text-lounge-500 hover:text-gold-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href={localizedContent(content, 'instagram')} target="_blank" rel="noopener noreferrer"
                className="text-lounge-500 hover:text-gold-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-lounge-800/30 text-center">
          <p className="text-sm text-lounge-600">
            &copy; {new Date().getFullYear()} 74 Lounge Bar. {t('all_rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
}
