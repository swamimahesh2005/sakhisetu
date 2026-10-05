'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, downloadCSV } from '@/lib/export-helpers';
import {
  PiggyBankIcon,
  PlusIcon,
  SearchIcon,
  DownloadIcon,
  VolumeUpIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { SavingsRecord } from '@/types';

interface SavingsModuleProps {
  onOpenQuickSavings: () => void;
}

export const SavingsModule: React.FC<SavingsModuleProps> = ({ onOpenQuickSavings }) => {
  const { savings, shgs, deleteSavings, speakText, globalSearch, setGlobalSearch } = useApp();

  const [filterSHG, setFilterSHG] = useState<string>('ALL');
  const [savingsToDelete, setSavingsToDelete] = useState<SavingsRecord | null>(null);

  const filteredSavings = savings.filter(s => {
    const matchesSearch =
      s.memberName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      s.receiptNumber.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(globalSearch.toLowerCase()));

    const matchesSHG = filterSHG === 'ALL' || s.shgId === filterSHG;
    return matchesSearch && matchesSHG;
  });

  const totalCollectedInList = filteredSavings.reduce((acc, cur) => acc + cur.totalAmount, 0);

  const handleExportCSV = () => {
    const headers = ['पावती क्र.', 'दिनांक', 'महिला सदस्य', 'नियमित बचत (₹)', 'ऐच्छिक ठेव (₹)', 'दंड (₹)', 'एकूण (₹)', 'भरणा प्रकार', 'नोंद'];
    const rows = filteredSavings.map(s => [
      s.receiptNumber,
      s.date,
      s.memberName,
      s.mandatoryAmount,
      s.voluntaryAmount,
      s.penaltyAmount,
      s.totalAmount,
      s.paymentMode,
      s.notes || '-'
    ]);
    downloadCSV('sakhisetu_savings_report.csv', headers, rows);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
              <PiggyBankIcon className="w-6 h-6" />
            </span>
            आजची व मासिक बचत नोंदवही (Savings Tracking)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            महिला सभासदांच्या नियमित मासिक बचतीचे संकलन, डिजिटल पावत्या आणि पासबुक हिशोब
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
            onClick={onOpenQuickSavings}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-2.5 rounded-xl font-black text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>+ आजची बचत नोंदवा</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-800 to-teal-800 text-white p-5 rounded-3xl shadow-md border border-emerald-700">
          <span className="text-xs uppercase font-black text-emerald-200 block">एकूण संकलित बचत (Total Collected)</span>
          <span className="text-3xl font-black mt-1 block">{formatINR(totalCollectedInList)}</span>
          <span className="text-xs text-emerald-100 mt-1 block">{filteredSavings.length} पावत्या नोंदवल्या</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-500 block">नियमित मासिक बचत (Mandatory)</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {formatINR(filteredSavings.reduce((acc, c) => acc + c.mandatoryAmount, 0))}
          </span>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">अनिवार्य बचत निधी</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-500 block">ऐच्छिक ठेव व दंड (Voluntary/Fine)</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {formatINR(filteredSavings.reduce((acc, c) => acc + c.voluntaryAmount + c.penaltyAmount, 0))}
          </span>
          <span className="text-xs text-purple-700 font-semibold mt-1 block">अतिरिक्त बचत व विलंब शुल्क</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-gray-600 mb-1">शोध (Search):</label>
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="महिला सदस्य किंवा पावती क्रमांक शोधा..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-600 mb-1">बचत गट निवडा (Filter by SHG):</label>
          <select
            value={filterSHG}
            onChange={e => setFilterSHG(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व बचत गट (All SHGs)</option>
            {shgs.map(s => (
              <option key={s.id} value={s.id}>
                {s.marathiName} ({s.villageName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Savings Ledger Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-base text-gray-900">
            बचत पावत्या यादी (Savings Collection Records)
          </h3>
          <span className="text-xs text-gray-500 font-medium">{filteredSavings.length} नोंदी</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-emerald-50/70 text-emerald-950 font-black border-b border-emerald-100">
              <tr>
                <th className="p-3">पावती क्र.</th>
                <th className="p-3">दिनांक</th>
                <th className="p-3">महिला सदस्य</th>
                <th className="p-3">नियमित बचत</th>
                <th className="p-3">ऐच्छिक ठेव</th>
                <th className="p-3">एकूण जमा</th>
                <th className="p-3">भरणा प्रकार</th>
                <th className="p-3">नोंदणीकर्ता</th>
                <th className="p-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSavings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    कोणतीही बचत नोंद आढळली नाही.
                  </td>
                </tr>
              ) : (
                filteredSavings.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-mono font-bold text-gray-900">{s.receiptNumber}</td>
                    <td className="p-3 text-gray-500">{s.date}</td>
                    <td className="p-3 font-black text-gray-900">{s.memberName}</td>
                    <td className="p-3 text-emerald-700 font-bold">₹{s.mandatoryAmount}</td>
                    <td className="p-3 text-gray-600">₹{s.voluntaryAmount}</td>
                    <td className="p-3 font-black text-emerald-900 text-sm">{formatINR(s.totalAmount)}</td>
                    <td className="p-3">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {s.paymentMode}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{s.recordedBy.split(' ')[0]}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            speakText(`${s.memberName} यांची ${s.totalAmount} रुपये बचत पावती.`);
                          }}
                          className="p-1.5 bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 rounded-lg transition"
                          title="ऐका"
                        >
                          <VolumeUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSavingsToDelete(s)}
                          className="p-1.5 bg-gray-100 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition"
                          title="बचत पावती हटवा (Delete Savings)"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Savings Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={savingsToDelete !== null}
        onClose={() => setSavingsToDelete(null)}
        onConfirm={() => {
          if (savingsToDelete) {
            deleteSavings(savingsToDelete.id);
            setSavingsToDelete(null);
          }
        }}
        title="बचत पावती हटवा (Delete Savings Record)"
        itemName={`${savingsToDelete?.memberName || ''} - पावती क्र. ${savingsToDelete?.receiptNumber || ''} (₹${savingsToDelete?.totalAmount || 0})`}
        itemType="बचत पावती"
        warningMessage="ही बचत पावती हटवल्यास सदस्याची व बचत गटाची एकूण जमा बचत आपोआप कमी केली जाईल."
      />
    </div>
  );
};
