'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, downloadCSV } from '@/lib/export-helpers';
import {
  FileTextIcon,
  PrinterIcon,
  DownloadIcon,
  UsersIcon,
  PiggyBankIcon,
  BanknoteIcon,
  AwardIcon,
  VolumeUpIcon
} from './icons';

export const ReportsModule: React.FC = () => {
  const { shgs, members, savings, loans, blocks, speakText } = useApp();

  const [selectedReport, setSelectedReport] = useState<'PASSBOOK' | 'MONTHLY_REGISTER' | 'BLOCK_SUMMARY'>('PASSBOOK');
  const [selectedSHGId, setSelectedSHGId] = useState<string>(shgs[0]?.id || '');

  const activeSHG = shgs.find(s => s.id === selectedSHGId) || shgs[0];
  const shgMembers = members.filter(m => m.shgId === selectedSHGId);
  const shgSavings = savings.filter(s => s.shgId === selectedSHGId);
  const shgLoans = loans.filter(l => l.shgId === selectedSHGId);

  const handleExportCSV = () => {
    if (selectedReport === 'PASSBOOK') {
      const headers = ['पावती क्र.', 'दिनांक', 'सदस्य नाव', 'रक्कम (₹)', 'प्रकार'];
      const rows = shgSavings.map(s => [s.receiptNumber, s.date, s.memberName, s.totalAmount, s.paymentMode]);
      downloadCSV(`${activeSHG?.name || 'shg'}_passbook.csv`, headers, rows);
    } else {
      const headers = ['सदस्य नाव', 'पद', 'एकूण बचत (₹)', 'सक्रिय कर्ज (₹)', 'लखपती दीदी स्थिती'];
      const rows = shgMembers.map(m => [m.marathiName, m.designation, m.totalSaved, m.activeLoanAmount, m.lakhpatiDidiStatus]);
      downloadCSV(`${activeSHG?.name || 'shg'}_members_summary.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-orange-700">
              <FileTextIcon className="w-6 h-6" />
            </span>
            अहवाल व पासबुक केंद्र (Reports & Registers)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            बचत गट मासिक संकलन पत्रक, सभासद पासबुक, कर्ज नोंदवही आणि ब्लॉक प्रगती अहवाल
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
          >
            <DownloadIcon className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 transition"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>अहवाल प्रिंट (Print Report)</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-gray-200">
        <button
          onClick={() => setSelectedReport('PASSBOOK')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedReport === 'PASSBOOK'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          १. बचत गट पासबुक (SHG Passbook)
        </button>

        <button
          onClick={() => setSelectedReport('MONTHLY_REGISTER')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedReport === 'MONTHLY_REGISTER'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          २. मासिक संकलन पत्रक (Monthly Register)
        </button>

        <button
          onClick={() => setSelectedReport('BLOCK_SUMMARY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            selectedReport === 'BLOCK_SUMMARY'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          ३. तालुका प्रगती अहवाल (Block Summary)
        </button>
      </div>

      {/* Report 1 & 2: SHG Selector */}
      {selectedReport !== 'BLOCK_SUMMARY' && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-3">
          <label className="text-xs font-bold text-gray-700">बचत गट निवडा:</label>
          <select
            value={selectedSHGId}
            onChange={e => setSelectedSHGId(e.target.value)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900"
          >
            {shgs.map(s => (
              <option key={s.id} value={s.id}>
                {s.marathiName} ({s.villageName})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Printable Report View */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-md space-y-6 print:m-0 print:p-0 print:border-none">
        {/* Report Header */}
        <div className="text-center border-b-2 border-orange-600 pb-4">
          <div className="text-xs font-bold text-orange-700 uppercase tracking-widest">
            महाराष्ट्र शासन - ग्रामविकास विभाग (MSRLM / UMED)
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
            {selectedReport === 'PASSBOOK'
              ? `${activeSHG?.marathiName || 'बचत गट'} - डिजिटल पासबुक व हिशोब नोंदवही`
              : selectedReport === 'MONTHLY_REGISTER'
              ? `${activeSHG?.marathiName || 'बचत गट'} - मासिक बचत व कर्ज संकलन पत्रक`
              : 'हवेली तालुका - स्वयंसहाय्यता गट सर्वसमावेशक प्रगती अहवाल'}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            दिनांक: {new Date().toLocaleDateString('mr-IN')} | तयारकर्ता: सुमित्रा पवार (समूह सखी / CRP)
          </p>
        </div>

        {/* Content for PASSBOOK */}
        {selectedReport === 'PASSBOOK' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-orange-50/70 p-4 rounded-2xl border border-orange-200">
              <div>
                <span className="text-gray-500 block font-bold">बचत गट कोड:</span>
                <span className="font-mono font-bold text-gray-900">{activeSHG?.code}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">बँक व शाखा:</span>
                <span className="font-bold text-gray-900">{activeSHG?.bankName.split('(')[0]}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">एकूण बचत निधी:</span>
                <span className="font-black text-emerald-800 text-sm">{formatINR(activeSHG?.totalSavings || 0)}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">सक्रिय CCL कर्ज:</span>
                <span className="font-black text-purple-800 text-sm">{formatINR(activeSHG?.cclOutstandingBalance || 0)}</span>
              </div>
            </div>

            <h4 className="font-extrabold text-sm text-gray-800 pt-2">बचत व जमा नोंदी (Passbook Ledger)</h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">पावती क्र.</th>
                    <th className="p-3">दिनांक</th>
                    <th className="p-3">सदस्य नाव</th>
                    <th className="p-3">नियमित बचत</th>
                    <th className="p-3">ऐच्छिक ठेव</th>
                    <th className="p-3">एकूण जमा (₹)</th>
                    <th className="p-3">प्रकार</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shgSavings.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono font-bold text-gray-900">{s.receiptNumber}</td>
                      <td className="p-3 text-gray-500">{s.date}</td>
                      <td className="p-3 font-bold text-gray-900">{s.memberName}</td>
                      <td className="p-3 text-emerald-700">₹{s.mandatoryAmount}</td>
                      <td className="p-3 text-gray-600">₹{s.voluntaryAmount}</td>
                      <td className="p-3 font-black text-emerald-900">{formatINR(s.totalAmount)}</td>
                      <td className="p-3 text-gray-500">{s.paymentMode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content for MONTHLY_REGISTER */}
        {selectedReport === 'MONTHLY_REGISTER' && (
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-gray-800">
              सभासद निहाय मासिक बचत व कर्ज पत्रक (Member-wise Monthly Register)
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3">अ.क्र.</th>
                    <th className="p-3">सभासदाचे नाव</th>
                    <th className="p-3">पद</th>
                    <th className="p-3">मासिक बचत (₹)</th>
                    <th className="p-3">सक्रिय कर्ज शिल्लक (₹)</th>
                    <th className="p-3">उपजीविका व्यवसाय</th>
                    <th className="p-3">स्वाक्षरी / अंगठा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shgMembers.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-500">{idx + 1}</td>
                      <td className="p-3 font-bold text-gray-900">{m.marathiName.split('(')[0]}</td>
                      <td className="p-3 text-gray-600">{m.designation.split(' ')[0]}</td>
                      <td className="p-3 font-bold text-emerald-800">₹{m.totalSaved}</td>
                      <td className="p-3 font-bold text-purple-800">₹{m.activeLoanAmount}</td>
                      <td className="p-3 text-gray-600">{m.primaryOccupation.split('(')[0]}</td>
                      <td className="p-3 font-mono text-gray-400">✓ प्रमाणित</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content for BLOCK_SUMMARY */}
        {selectedReport === 'BLOCK_SUMMARY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-orange-50/70 p-4 rounded-2xl border border-orange-200">
              <div>
                <span className="text-gray-500 block font-bold">एकूण गावे:</span>
                <span className="font-bold text-gray-900 text-sm">१८ गावे</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">सक्रिय बचत गट:</span>
                <span className="font-bold text-gray-900 text-sm">{shgs.length * 10} गट</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">एकूण बचत भांडवल:</span>
                <span className="font-black text-emerald-800 text-sm">₹४२,५०,०००</span>
              </div>
              <div>
                <span className="text-gray-500 block font-bold">एकूण CCL कर्ज वाटप:</span>
                <span className="font-black text-purple-800 text-sm">₹१,२५,००,०००</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-4 text-xs text-gray-700 space-y-2">
              <h5 className="font-bold text-gray-900">प्रखंड व्यवस्थापक टिप्पणी:</h5>
              <p className="leading-relaxed">
                हवेली तालुक्यातील सर्व बचत गटांची नियमित मासिक सभा व बचत संकलन १००% वेळेवर होत आहे. बँक ऑफ महाराष्ट्र व स्टेट बँक ऑफ इंडिया सोबत बँक लिंकेज प्रभावीपणे कार्यरत असून लखपती दीदी उपक्रमांतर्गत ४८ महिलांनी ₹१ लाखापेक्षा अधिक वार्षिक उत्पन्नाचा टप्पा ओलांडला आहे.
              </p>
            </div>
          </div>
        )}

        {/* Signature Box */}
        <div className="pt-8 border-t border-gray-200 flex justify-between text-xs text-gray-700 font-bold">
          <div>
            <div>_______________________</div>
            <div className="mt-1">अध्यक्षा / सचिव स्वाक्षरी</div>
            <div className="text-[10px] text-gray-500 font-normal">सावित्रीबाई फुले महिला बचत गट</div>
          </div>

          <div>
            <div>_______________________</div>
            <div className="mt-1">समूह सखी (CRP) स्वाक्षरी</div>
            <div className="text-[10px] text-gray-500 font-normal">सुमित्रा पवार (खेड शिवापूर)</div>
          </div>

          <div>
            <div>_______________________</div>
            <div className="mt-1">प्रखंड व्यवस्थापक (Block Mgr)</div>
            <div className="text-[10px] text-gray-500 font-normal">राजेश शिंदे (हवेली तालुका)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
