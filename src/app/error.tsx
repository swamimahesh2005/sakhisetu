'use client';

import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('SakhiSetu Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 shadow-xl space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 text-rose-700 flex items-center justify-center text-3xl font-black shadow-inner">
          ⚠️
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900">काहीतरी त्रुटी झाली</h2>
          <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">Application Encountered An Error</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          सिस्टीम चालवताना अडचण आली आहे. आपण पुन्हा प्रयत्न करू शकता किंवा पेज रीफ्रेश करू शकता.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md transition"
          >
            पुन्हा प्रयत्न करा (Try Again)
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition"
          >
            पेज रीफ्रेश करा (Refresh Page)
          </button>
        </div>
      </div>
    </div>
  );
}
