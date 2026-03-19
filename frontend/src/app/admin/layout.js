'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import {
  LayoutDashboard, ShoppingBag, CalendarDays, UtensilsCrossed,
  FileText, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/admin/login') {
      setLoading(false);
      setAuthed(false);
      return;
    }
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    api.verifyToken()
      .then(() => { setAuthed(true); setLoading(false); })
      .catch(() => { localStorage.removeItem('admin_token'); router.push('/admin/login'); });
  }, [pathname, router]);

  if (pathname === '/admin/login') return children;
  if (loading) {
    return (
      <div className="min-h-screen bg-lounge-950 flex items-center justify-center">
        <div className="text-gold-400 text-lg font-serif">Loading...</div>
      </div>
    );
  }
  if (!authed) return null;

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
    { href: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { href: '/admin/content', label: 'Content', icon: FileText },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-lounge-950 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-lounge-900/50 border-r border-lounge-800/30
        transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-lounge-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-serif font-bold text-gold-400">74</span>
                <span className="text-xs text-lounge-400 tracking-[0.2em] uppercase">Admin</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-lounge-400">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-6 px-3 space-y-1">
            {navItems.map(item => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                      : 'text-lounge-400 hover:bg-lounge-800/30 hover:text-lounge-200 border border-transparent'
                  }`}>
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-lounge-800/30">
            <Link href="/" className="flex items-center space-x-2 text-xs text-lounge-500 hover:text-lounge-300 mb-3 px-2">
              <ChevronRight size={14} />
              <span>View Website</span>
            </Link>
            <button onClick={handleLogout}
              className="flex items-center space-x-2 text-xs text-red-400/60 hover:text-red-400 px-2 w-full">
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-lounge-950/90 backdrop-blur-md border-b border-lounge-800/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-lounge-400 hover:text-lounge-200">
              <Menu size={20} />
            </button>
            <div className="text-sm text-lounge-500">
              {navItems.find(i => i.href === pathname)?.label || 'Admin'}
            </div>
            <div />
          </div>
        </div>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
