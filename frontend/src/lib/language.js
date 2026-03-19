'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  // Navigation
  nav_home: { al: 'Ballina', en: 'Home' },
  nav_menu: { al: 'Menu', en: 'Menu' },
  nav_about: { al: 'Rreth Nesh', en: 'About' },
  nav_contact: { al: 'Kontakti', en: 'Contact' },
  nav_reserve: { al: 'Rezervo Tavolinë', en: 'Reserve Table' },
  nav_order: { al: 'Porosit Online', en: 'Order Online' },

  // Hero
  view_menu: { al: 'Shiko Menunë', en: 'View Menu' },
  reserve_table: { al: 'Rezervo Tavolinë', en: 'Reserve Table' },
  order_online: { al: 'Porosit Online', en: 'Order Online' },

  // Menu
  menu_title: { al: 'Menuja Jonë', en: 'Our Menu' },
  featured_title: { al: 'Të Veçanta', en: 'Featured' },
  back_to_site: { al: 'Kthehu në Faqe', en: 'Back to Website' },
  add_to_cart: { al: 'Shto në Shportë', en: 'Add to Cart' },

  // Order
  order_title: { al: 'Porosit Online', en: 'Order Online' },
  your_cart: { al: 'Shporta Juaj', en: 'Your Cart' },
  cart_empty: { al: 'Shporta është bosh', en: 'Cart is empty' },
  total: { al: 'Totali', en: 'Total' },
  place_order: { al: 'Dërgo Porosinë', en: 'Place Order' },
  name: { al: 'Emri', en: 'Name' },
  phone: { al: 'Numri i Telefonit', en: 'Phone Number' },
  table_number: { al: 'Numri i Tavolinës (opsionale)', en: 'Table Number (optional)' },
  notes: { al: 'Shënime', en: 'Notes' },
  order_success: { al: 'Porosia u pranua me sukses!', en: 'Order placed successfully!' },
  order_success_msg: { al: 'Porosia juaj do të përgatitet. Pagesa bëhet me para në dorë.', en: 'Your order will be prepared. Payment is cash only.' },
  cash_only: { al: 'Vetëm me para në dorë', en: 'Cash payment only' },
  remove: { al: 'Hiq', en: 'Remove' },

  // Reservation
  reservation_title: { al: 'Rezervo Tavolinë', en: 'Reserve a Table' },
  date: { al: 'Data', en: 'Date' },
  time: { al: 'Ora', en: 'Time' },
  guests: { al: 'Numri i Mysafirëve', en: 'Number of Guests' },
  submit_reservation: { al: 'Dërgo Kërkesën', en: 'Submit Request' },
  reservation_note: { al: 'Rezervimi juaj do të konfirmohet përmes thirrjes telefonike.', en: 'Your reservation will be confirmed via phone call.' },
  reservation_success: { al: 'Kërkesa u dërgua!', en: 'Request submitted!' },
  reservation_success_msg: { al: 'Do t\'ju kontaktojmë për konfirmim.', en: 'We will contact you for confirmation.' },

  // Contact
  contact_title: { al: 'Na Kontaktoni', en: 'Contact Us' },
  address: { al: 'Adresa', en: 'Address' },
  opening_hours: { al: 'Orari', en: 'Opening Hours' },
  follow_us: { al: 'Na Ndiqni', en: 'Follow Us' },

  // Footer
  all_rights: { al: 'Të gjitha të drejtat e rezervuara', en: 'All rights reserved' },

  // General
  loading: { al: 'Duke u ngarkuar...', en: 'Loading...' },
  error: { al: 'Gabim', en: 'Error' },
  close: { al: 'Mbyll', en: 'Close' },
  required: { al: 'E detyrueshme', en: 'Required' },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('al');

  useEffect(() => {
    const saved = localStorage.getItem('74_lang');
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'al' ? 'en' : 'al';
    setLang(newLang);
    localStorage.setItem('74_lang', newLang);
  };

  const t = (key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.al || key;
  };

  const localizedField = (obj, field) => {
    if (!obj) return '';
    return obj[`${field}_${lang}`] || obj[`${field}_al`] || '';
  };

  const localizedContent = (content, key) => {
    if (!content || !content[key]) return '';
    return content[key][lang] || content[key].al || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, localizedField, localizedContent }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
