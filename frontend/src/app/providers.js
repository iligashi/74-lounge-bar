'use client';
import { LanguageProvider } from '../lib/language';
import { CartProvider } from '../lib/cart';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }) {
  return (
    <LanguageProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1b1610',
              color: '#e8e4db',
              border: '1px solid rgba(201, 154, 13, 0.3)',
            },
          }}
        />
      </CartProvider>
    </LanguageProvider>
  );
}
