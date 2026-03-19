import '../styles/globals.css';
import { Providers } from './providers';

export const metadata = {
  title: '74 Lounge Bar — Premium Lounge Experience',
  description: 'Where elegance meets taste. Premium cocktails, refined cuisine, and an unforgettable atmosphere.',
  keywords: '74 Lounge Bar, lounge, bar, restaurant, cocktails, premium dining',
};

export default function RootLayout({ children }) {
  return (
    <html lang="sq">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
