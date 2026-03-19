'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/language';
import { useCart } from '../../lib/cart';
import { api } from '../../lib/api';
import { ArrowLeft, Globe, Plus, ShoppingBag, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const { t, lang, toggleLang, localizedField } = useLanguage();
  const { addItem, count } = useCart();
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

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
    toast.success(lang === 'al' ? 'U shtua në shportë' : 'Added to cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lounge-950">
        <div className="text-center">
          <div className="text-4xl font-serif text-gold-400 mb-4">74</div>
          <p className="text-lounge-500 text-sm tracking-widest uppercase">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lounge-950">
      {/* Menu Header */}
      <div className="sticky top-0 z-40 bg-lounge-950/95 backdrop-blur-md border-b border-lounge-800/30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-lounge-400 hover:text-gold-400 transition-colors">
            <ArrowLeft size={18} />
            <span className="text-xs tracking-wider uppercase hidden sm:block">{t('back_to_site')}</span>
          </Link>

          <div className="text-center">
            <span className="text-xl font-serif font-bold text-gold-400">74</span>
            <span className="text-xs text-lounge-400 tracking-[0.2em] uppercase ml-2">Menu</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleLang}
              className="flex items-center space-x-1 text-lounge-400 hover:text-gold-400 transition-colors">
              <Globe size={16} />
              <span className="text-xs tracking-wider uppercase font-medium">{lang === 'al' ? 'EN' : 'AL'}</span>
            </button>
            <Link href="/order" className="relative text-lounge-400 hover:text-gold-400 transition-colors">
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-gold-500 text-lounge-950 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Book */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Cover */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="w-16 h-px bg-gold-500/30" />
            <span className="text-xs tracking-[0.4em] text-gold-500/50 uppercase font-light">74 Lounge Bar</span>
            <span className="w-16 h-px bg-gold-500/30" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-lounge-100 mb-2">{t('menu_title')}</h1>
          <div className="gold-divider mt-4" />
        </div>

        {/* Category Navigation */}
        <div className="mb-10 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center space-x-1 min-w-max px-4">
            {menu.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 text-xs tracking-[0.15em] uppercase transition-all duration-300 rounded-sm whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-lounge-500 hover:text-lounge-300 border border-transparent'
                }`}
              >
                {localizedField(cat, 'name')}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        {menu.map(category => (
          <div key={category.id}
            className={`transition-all duration-500 ${activeCategory === category.id ? 'block' : 'hidden'}`}>

            {/* Category Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif text-gold-400 mb-2">
                {localizedField(category, 'name')}
              </h2>
              {localizedField(category, 'description') && (
                <p className="text-sm text-lounge-500 font-light italic">
                  {localizedField(category, 'description')}
                </p>
              )}
              <div className="menu-category-divider mt-6 mx-auto max-w-xs" />
            </div>

            {/* Items */}
            <div className="space-y-1 max-w-3xl mx-auto">
              {category.items.map(item => (
                <div key={item.id}
                  className="group px-4 py-5 hover:bg-lounge-900/30 rounded-lg transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-serif text-base md:text-lg text-lounge-100 group-hover:text-gold-400 transition-colors">
                          {localizedField(item, 'name')}
                        </h3>
                        <span className="flex-1 border-b border-dotted border-lounge-800/40 min-w-[40px] translate-y-[-4px]" />
                        <span className="text-gold-400 font-serif text-base font-medium whitespace-nowrap">
                          €{parseFloat(item.price).toFixed(2)}
                        </span>
                      </div>
                      {localizedField(item, 'description') && (
                        <p className="text-sm text-lounge-500 mt-1 font-light leading-relaxed">
                          {localizedField(item, 'description')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-full border border-gold-500/30
                                 text-gold-500/60 hover:bg-gold-500 hover:text-lounge-950 hover:border-gold-500 transition-all duration-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="menu-category-divider mt-10 mx-auto max-w-xs" />
          </div>
        ))}

        {/* Footer */}
        <div className="text-center mt-16 pb-12">
          <div className="inline-flex items-center space-x-3 mb-4">
            <span className="w-8 h-px bg-gold-500/20" />
            <span className="text-2xl font-serif text-gold-500/30">74</span>
            <span className="w-8 h-px bg-gold-500/20" />
          </div>
          <p className="text-xs text-lounge-600 tracking-wider uppercase">
            {lang === 'al' ? 'Faleminderit që na zgjodhët' : 'Thank you for choosing us'}
          </p>
        </div>
      </div>

      {/* Floating cart button */}
      {count > 0 && (
        <Link href="/order"
          className="fixed bottom-6 right-6 z-50 bg-gold-500 text-lounge-950 px-6 py-3 rounded-full
                     shadow-lg shadow-gold-500/20 flex items-center space-x-2 hover:bg-gold-400 transition-colors">
          <ShoppingBag size={18} />
          <span className="font-medium text-sm">{count} {lang === 'al' ? 'artikuj' : 'items'}</span>
        </Link>
      )}
    </div>
  );
}
