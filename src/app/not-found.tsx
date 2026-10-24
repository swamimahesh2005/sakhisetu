import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-4xl font-black shadow-inner">
          ४०४
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-900">पान आढळले नाही</h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Page Not Found</p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          आपण शोधत असलेले पृष्ठ उपलब्ध नाही किंवा त्याचा पत्ता बदलला आहे. कृपया मुख्य पानावर परत जा.
        </p>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md transition"
          >
            <span>🏠</span>
            <span>सखीसेतू मुख्य पानावर जा (Go to Home)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
