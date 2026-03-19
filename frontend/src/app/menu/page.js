'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/language';
import { useCart } from '../../lib/cart';
import { api } from '../../lib/api';
import { ArrowLeft, Globe, Plus, ShoppingBag, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const { t, lang, toggleLang, localizedField } = useLanguage();
  const { addItem, count } = useCart();
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState({});
  const catScrollRef = useRef(null);

  useEffect(() => {
    api.getMenu()
      .then(data => {
        setMenu(data);
        if (data.length > 0) setActiveCategory(data[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAddToCart = (item) => {
    addItem({
      id: item.id,
      menu_item_id: item.id,
      name: localizedField(item, 'name'),
      price: item.price,
    });
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1200);
    toast.success(lang === 'al' ? 'U shtua në shportë' : 'Added to cart', {
      style: { background: '#1b1610', color: '#e8e0d0', border: '1px solid #50432c', fontSize: '13px' },
      iconTheme: { primary: '#c4a44a', secondary: '#0d0b08' },
    });
  };

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    // Scroll the active tab into view
    const el = document.getElementById(`cat-tab-${catId}`);
    if (el && catScrollRef.current) {
      const container = catScrollRef.current;
      const scrollLeft = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lounge-950">
        <div className="text-center">
          <div className="text-5xl font-serif text-gold-400 mb-3 animate-pulse">74</div>
          <p className="text-lounge-600 text-[11px] tracking-[0.35em] uppercase">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const activeItems = menu.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-lounge-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-lounge-950/90 backdrop-blur-xl border-b border-gold-500/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          {/* Back */}
          <Link href="/" className="flex items-center gap-2 text-lounge-500 hover:text-gold-400 transition-colors active:scale-95">
            <ArrowLeft size={18} />
            <span className="text-[11px] tracking-[0.15em] uppercase hidden sm:inline">{t('back_to_site')}</span>
          </Link>

          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-serif font-bold text-gold-400 leading-none">74</span>
            <span className="text-[10px] sm:text-[11px] text-lounge-500 tracking-[0.25em] uppercase">Menu</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-lounge-800/50
                         text-lounge-400 hover:text-gold-400 hover:border-gold-500/30 transition-all active:scale-95">
              <Globe size={13} />
              <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">{lang === 'al' ? 'EN' : 'AL'}</span>
            </button>
            <Link href="/order" className="relative text-lounge-400 hover:text-gold-400 transition-colors active:scale-95 p-1">
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-gold-500 text-lounge-950 rounded-full
                                 text-[9px] flex items-center justify-center font-bold shadow-lg shadow-gold-500/30">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Cover Title ── */}
      <div className="text-center pt-8 pb-2 sm:pt-12 sm:pb-4 px-4">
        <div className="inline-flex items-center gap-3 mb-3">
          <span className="w-10 sm:w-16 h-px bg-gradient-to-r from-transparent to-gold-500/30" />
          <span className="text-[10px] sm:text-[11px] tracking-[0.4em] text-gold-500/40 uppercase font-light">74 Lounge Bar</span>
          <span className="w-10 sm:w-16 h-px bg-gradient-to-l from-transparent to-gold-500/30" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-lounge-100 leading-tight">
          {t('menu_title')}
        </h1>
        <div className="w-12 h-px bg-gold-500/50 mx-auto mt-4 sm:mt-5" />
      </div>

      {/* ── Category Tabs ── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-lounge-950/90 backdrop-blur-xl border-b border-gold-500/8">
        <div ref={catScrollRef}
          className="max-w-3xl mx-auto overflow-x-auto scrollbar-hide py-3 px-3 sm:px-6">
          <div className="flex gap-1.5 sm:gap-2 sm:justify-center min-w-max">
            {menu.map(cat => (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => scrollToCategory(cat.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-xs tracking-[0.12em] uppercase
                           rounded-full transition-all duration-300 whitespace-nowrap active:scale-95
                  ${activeCategory === cat.id
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30 shadow-sm shadow-gold-500/5'
                    : 'text-lounge-500 hover:text-lounge-300 border border-transparent hover:border-lounge-800/50'
                  }`}
              >
                {localizedField(cat, 'name')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu Items ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-32">
        {activeItems && (
          <div className="animate-fadeIn">
            {/* Category Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-gold-400">
                {localizedField(activeItems, 'name')}
              </h2>
              {localizedField(activeItems, 'description') && (
                <p className="text-xs sm:text-sm text-lounge-500 font-light italic mt-1.5 max-w-md mx-auto">
                  {localizedField(activeItems, 'description')}
                </p>
              )}
              <div className="menu-category-divider mt-4 sm:mt-5 mx-auto max-w-[200px]" />
            </div>

            {/* Items List */}
            <div className="space-y-0.5">
              {activeItems.items.map(item => (
                <div key={item.id}
                  className="group relative flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-4 sm:py-5
                             rounded-xl hover:bg-lounge-900/30 active:bg-lounge-900/40
                             transition-all duration-200 -mx-1 sm:-mx-2">

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    {/* Mobile: name + price stacked, Desktop: name ... price */}
                    <div className="hidden sm:flex items-baseline gap-2">
                      <h3 className="font-serif text-base md:text-lg text-lounge-100 group-hover:text-gold-400 transition-colors">
                        {localizedField(item, 'name')}
                      </h3>
                      <span className="flex-1 border-b border-dotted border-lounge-800/30 min-w-[30px] translate-y-[-3px]" />
                      <span className="text-gold-400 font-serif text-base font-medium whitespace-nowrap">
                        €{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>

                    {/* Mobile layout */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-[15px] text-lounge-100 leading-snug">
                          {localizedField(item, 'name')}
                        </h3>
                        <span className="text-gold-400 font-serif text-[15px] font-medium whitespace-nowrap flex-shrink-0 pt-px">
                          €{parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {localizedField(item, 'description') && (
                      <p className="text-xs sm:text-sm text-lounge-500/80 mt-1 sm:mt-1.5 font-light leading-relaxed line-clamp-2">
                        {localizedField(item, 'description')}
                      </p>
                    )}
                    {!item.is_available && (
                      <span className="inline-block mt-1.5 text-[10px] tracking-wider uppercase text-red-400/70 border border-red-400/20
                                       rounded px-2 py-0.5">
                        {lang === 'al' ? 'Jo disponueshëm' : 'Unavailable'}
                      </span>
                    )}
                  </div>

                  {/* Add Button */}
                  {item.is_available !== 0 && (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full
                                  transition-all duration-300 active:scale-90
                        ${addedItems[item.id]
                          ? 'bg-gold-500 text-lounge-950 border-gold-500 scale-110'
                          : 'border border-gold-500/25 text-gold-500/50 hover:bg-gold-500 hover:text-lounge-950 hover:border-gold-500'
                        }`}
                    >
                      {addedItems[item.id] ? <Check size={15} strokeWidth={3} /> : <Plus size={15} />}
                    </button>
                  )}
                </div>
              ))}

              {activeItems.items.length === 0 && (
                <div className="text-center py-12 text-lounge-600 text-sm italic">
                  {lang === 'al' ? 'Asnjë artikull në këtë kategori' : 'No items in this category'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 sm:mt-20">
          <div className="inline-flex items-center gap-3 mb-3">
            <span className="w-8 h-px bg-gold-500/15" />
            <span className="text-2xl font-serif text-gold-500/20">74</span>
            <span className="w-8 h-px bg-gold-500/15" />
          </div>
          <p className="text-[10px] sm:text-[11px] text-lounge-700 tracking-[0.25em] uppercase">
            {lang === 'al' ? 'Faleminderit që na zgjodhët' : 'Thank you for choosing us'}
          </p>
        </div>
      </div>

      {/* ── Floating Cart ── */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
          <div className="max-w-3xl mx-auto flex justify-end">
            <Link href="/order"
              className="pointer-events-auto flex items-center gap-2.5 bg-gold-500 text-lounge-950
                         pl-5 pr-6 py-3 sm:py-3.5 rounded-full shadow-xl shadow-gold-500/25
                         hover:bg-gold-400 active:scale-95 transition-all duration-200">
              <ShoppingBag size={17} strokeWidth={2.5} />
              <span className="font-semibold text-sm tracking-wide">
                {count} {lang === 'al' ? 'artikuj' : (count === 1 ? 'item' : 'items')}
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
