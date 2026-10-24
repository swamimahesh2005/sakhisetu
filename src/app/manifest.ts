import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'सखीसेतू – महिला बचत गट व्यवस्थापन प्रणाली',
    short_name: 'सखीसेतू',
    description: 'महिला स्वयंसहाय्यता बचत गट, बचत, कर्ज, मासिक सभा व लखपती दीदी उपजीविका व्यवस्थापन प्लॅटफॉर्म.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fdfbf7',
    theme_color: '#047857',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
