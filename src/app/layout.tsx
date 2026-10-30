import type { Metadata, Viewport } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['bengali', 'latin'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Roxy Fashion BD | Luxury Men’s Panjabi & Designer Women’s Clothing',
  description:
    'Discover contemporary elegance with hand-embroidered Panjabis, exclusive women’s three-pieces, and festive ensembles in Bangladesh. Fast Cash on Delivery across all 64 districts.',
  keywords: [
    'Panjabi Bangladesh',
    'Mens Panjabi',
    'Womens Clothing Dhaka',
    'Three Piece Bangladesh',
    'Roxy Fashion',
    'Cash on Delivery',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-[#1C1917] selection:bg-[#631322] selection:text-white">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
