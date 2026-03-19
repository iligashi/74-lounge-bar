'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../lib/language';
import { api } from '../lib/api';
import { ArrowRight, MapPin, Phone, Mail, Clock, Star } from 'lucide-react';

export default function HomePage() {
  const { t, lang, localizedField, localizedContent } = useLanguage();
  const [content, setContent] = useState(null);
  const [featured, setFeatured] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([api.getContent(), api.getFeatured()])
      .then(([c, f]) => { setContent(c); setFeatured(f); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-lounge-950">
          <div className="absolute inset-0 bg-gradient-to-b from-lounge-950/60 via-lounge-950/40 to-lounge-950" />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(201, 154, 13, 0.08) 0%, transparent 60%)',
          }} />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full border border-gold-500/5" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full border border-gold-500/8" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-3 mb-6">
              <span className="w-12 h-px bg-gold-500/40" />
              <span className="text-xs tracking-[0.4em] text-gold-400/80 uppercase font-light">Est. 2024</span>
              <span className="w-12 h-px bg-gold-500/40" />
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-gold-400 mb-2 tracking-tight">
            74
          </h1>
          <p className="text-xl md:text-2xl tracking-[0.4em] text-lounge-300 uppercase font-light mb-8">
            Lounge Bar
          </p>

          <div className="gold-divider mb-8" />

          <p className="text-lg md:text-xl text-lounge-400 font-light italic font-serif max-w-2xl mx-auto mb-12">
            {content ? localizedContent(content, 'hero_subtitle') : (lang === 'al' ? 'Ku eleganca takon shijen' : 'Where elegance meets taste')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/menu" className="btn-gold">
              {t('view_menu')}
              <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link href="/reservation" className="btn-outline">
              {t('reserve_table')}
            </Link>
            <Link href="/order" className="btn-outline">
              {t('order_online')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-16 bg-gradient-to-b from-transparent to-gold-500/30" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-3 mb-6">
            <span className="w-8 h-px bg-gold-500/40" />
            <span className="text-xs tracking-[0.3em] text-gold-500/60 uppercase">{t('nav_about')}</span>
            <span className="w-8 h-px bg-gold-500/40" />
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-lounge-100 mb-6">
            {content ? localizedContent(content, 'about_title') : t('nav_about')}
          </h2>

          <div className="gold-divider mb-8" />

          <p className="text-lounge-400 text-lg leading-relaxed font-light max-w-3xl mx-auto">
            {content ? localizedContent(content, 'about_text') : ''}
          </p>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section id="menu-preview" className="section-padding bg-lounge-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 mb-6">
              <span className="w-8 h-px bg-gold-500/40" />
              <Star size={14} className="text-gold-500/60" />
              <span className="w-8 h-px bg-gold-500/40" />
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-lounge-100 mb-4">
              {t('featured_title')}
            </h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 6).map(item => (
              <div key={item.id} className="card-dark p-6 hover:border-gold-500/20 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-serif text-lg text-lounge-100 group-hover:text-gold-400 transition-colors">
                      {localizedField(item, 'name')}
                    </h3>
                    <p className="text-xs text-gold-500/60 tracking-wider uppercase mt-1">
                      {localizedField(item, 'category_name')}
                    </p>
                  </div>
                  <span className="text-gold-400 font-serif text-lg font-medium">
                    €{parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-lounge-500 font-light leading-relaxed">
                  {localizedField(item, 'description')}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/menu" className="btn-outline">
              {t('view_menu')}
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-lounge-100 mb-4">
              {t('contact_title')}
            </h2>
            <div className="gold-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-dark p-8 text-center">
              <MapPin size={24} className="mx-auto mb-4 text-gold-500/70" />
              <h4 className="font-serif text-gold-400 mb-3">{t('address')}</h4>
              <p className="text-sm text-lounge-400 font-light">
                {content ? localizedContent(content, 'address') : ''}
              </p>
            </div>

            <div className="card-dark p-8 text-center">
              <Clock size={24} className="mx-auto mb-4 text-gold-500/70" />
              <h4 className="font-serif text-gold-400 mb-3">{t('opening_hours')}</h4>
              <p className="text-sm text-lounge-400 font-light whitespace-pre-line">
                {content ? localizedContent(content, 'opening_hours') : ''}
              </p>
            </div>

            <div className="card-dark p-8 text-center">
              <Phone size={24} className="mx-auto mb-4 text-gold-500/70" />
              <h4 className="font-serif text-gold-400 mb-3">{t('nav_contact')}</h4>
              <p className="text-sm text-lounge-400 font-light">
                {content ? localizedContent(content, 'phone') : ''}
              </p>
              <p className="text-sm text-lounge-400 font-light mt-1">
                {content ? localizedContent(content, 'email') : ''}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer content={content} />
    </div>
  );
}
