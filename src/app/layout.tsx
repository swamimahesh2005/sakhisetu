import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SakhiSetu – महिला बचत गट व्यवस्थापन (Women SHG Management)',
  description: 'ग्रामीण महिला स्वयंसहाय्यता बचत गट, बचत, कर्ज, मासिक सभा, उपजीविका व शासकीय योजना व्यवस्थापन प्रणाली (MSRLM / UMED).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Yantramanav:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fdfbf7] text-gray-900" style={{ fontFamily: 'Yantramanav, Outfit, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
