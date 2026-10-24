import type { Metadata } from 'next';
import { Outfit, Yantramanav } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const yantramanav = Yantramanav({
  subsets: ['devanagari', 'latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-yantramanav',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'सखीसेतू (SakhiSetu) – महिला बचत गट व्यवस्थापन प्रणाली',
  description: 'महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (UMED / MSRLM) & डिजिटल भारत प्रेरित महिला स्वयंसहाय्यता बचत गट व्यवस्थापन आणि सक्षमीकरण प्लॅटफॉर्म.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className={`h-full antialiased ${outfit.variable} ${yantramanav.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-[#fdfbf7] text-gray-900" style={{ fontFamily: 'var(--font-yantramanav), var(--font-outfit), sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
