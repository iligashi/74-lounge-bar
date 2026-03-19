'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/language';
import { useCart } from '../../lib/cart';
import { Menu, X, ShoppingBag, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, lang, toggleLang } = useLanguage();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/#about', label: t('nav_about') },
    { href: '/#menu-preview', label: t('nav_menu') },
    { href: '/#contact', label: t('nav_contact') },
    { href: '/reservation', label: t('nav_reserve') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-lounge-950/95 backdrop-blur-md shadow-lg shadow-black/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-gold-400 tracking-wider">74</span>
            <span className="hidden sm:block text-sm text-lounge-300 tracking-[0.3em] uppercase font-light">Lounge Bar</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map(link => (
              <a key={link.href} href={link.href}
                className="text-sm text-lounge-300 hover:text-gold-400 transition-colors tracking-wider uppercase font-light">
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleLang}
              className="flex items-center space-x-1.5 text-lounge-400 hover:text-gold-400 transition-colors">
              <Globe size={16} />
              <span className="text-xs font-medium tracking-wider uppercase">{lang === 'al' ? 'EN' : 'AL'}</span>
            </button>

            <Link href="/order" className="relative text-lounge-300 hover:text-gold-400 transition-colors">
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-gold-500 text-lounge-950 rounded-full text-xs flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>

            <Link href="/order" className="hidden md:block btn-gold text-xs px-6 py-2.5">
              {t('order_online')}
            </Link>

            <button onClick={() => setOpen(!open)} className="lg:hidden text-lounge-300 hover:text-gold-400">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-lounge-950/98 backdrop-blur-lg border-t border-lounge-800/30">
          <div className="px-6 py-8 space-y-6">
            {navLinks.map(link => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block text-lounge-200 hover:text-gold-400 transition-colors tracking-wider uppercase text-sm">
                {link.label}
              </a>
            ))}
            <Link href="/order" onClick={() => setOpen(false)}
              className="block text-gold-400 tracking-wider uppercase text-sm font-medium">
              {t('order_online')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
