'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BusinessEnterprise } from '@/types';
import { formatINR } from '@/lib/export-helpers';
import {
  AwardIcon,
  PlusIcon,
  CheckCircleIcon,
  XIcon,
  VolumeUpIcon,
  SparklesIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const LivelihoodModule: React.FC = () => {
  const { businesses, members, addBusiness, deleteBusiness, speakText } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [bizToDelete, setBizToDelete] = useState<BusinessEnterprise | null>(null);

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState<BusinessEnterprise['category']>('शेतीपूरक / पशुपालन');
  const [monthlyRevenue, setMonthlyRevenue] = useState(25000);
  const [monthlyNetProfit, setMonthlyNetProfit] = useState(14000);
  const [shgLoanAmountUsed, setShgLoanAmountUsed] = useState(30000);
  const [marketChannels, setMarketChannels] = useState('स्थानिक आठवडी बाजार व ग्राहक');

  const annualIncome = Number(monthlyNetProfit) * 12;
  const isLakhpatiDidi = annualIncome >= 100000;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === selectedMemberId);
    if (!member || !businessName.trim()) return;

    addBusiness({
      memberId: selectedMemberId,
      memberName: member.marathiName.split('(')[0],
      shgName: member.shgName,
      villageName: 'खेड शिवापूर',
      businessName,
      category,
      monthlyRevenue: Number(monthlyRevenue),
      monthlyNetProfit: Number(monthlyNetProfit),
      shgLoanAmountUsed: Number(shgLoanAmountUsed),
      marketChannels,
      annualIncome,
      isLakhpatiDidi
    });

    setShowAddModal(false);
    setBusinessName('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <AwardIcon className="w-6 h-6" />
            </span>
            महिला उपजीविका व लखपती दीदी अभियान (Livelihood & Enterprises)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            बचत गट महिलांचे सूक्ष्म उद्योग, शेतीपूरक व्यवसाय, वार्षिक नफा व लखपती दीदी ध्येय पूर्तता
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>+ नवीन उद्योग नोंदवा (Register Enterprise)</span>
        </button>
      </div>

      {/* Livelihood Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.map(b => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {b.category}
                  </span>
                  <h3 className="font-black text-base text-gray-900 mt-1.5">{b.businessName}</h3>
                  <p className="text-xs text-gray-500">
                    उद्योजिका: <span className="font-bold text-gray-900">{b.memberName}</span> ({b.shgName})
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="p-2 bg-amber-100 text-amber-800 rounded-2xl">
                    <SparklesIcon className="w-5 h-5" />
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 mt-0.5">लखपती दीदी</span>
                </div>
              </div>

              {/* Financial Performance */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                  <span className="text-emerald-700 text-[10px] block font-bold">मासिक निव्वळ नफा</span>
                  <span className="font-black text-emerald-950 text-base">{formatINR(b.monthlyNetProfit)}</span>
                </div>
                <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                  <span className="text-amber-800 text-[10px] block font-bold">वार्षिक उत्पन्न</span>
                  <span className="font-black text-amber-950 text-base">{formatINR(b.annualIncome)}</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">बचत गट भांडवल:</span>
                  <span className="font-bold text-gray-800">{formatINR(b.shgLoanAmountUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">बाजारपेठ:</span>
                  <span className="font-bold text-gray-800 truncate max-w-[170px]">{b.marketChannels}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700">✓ लखपती निकष पूर्ण</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    speakText(
                      `${b.memberName} यांचा ${b.businessName} व्यवसाय. मासिक नफा ${b.monthlyNetProfit} रुपये. वार्षिक उत्पन्न ${b.annualIncome} रुपये.`
                    )
                  }
                  className="p-2 text-gray-500 hover:text-amber-600 bg-gray-100 hover:bg-amber-50 rounded-xl transition"
                  title="माहिती ऐका"
                >
                  <VolumeUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBizToDelete(b)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-gray-100 rounded-xl transition"
                  title="व्यवसाय नोंद हटवा (Delete Business)"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Business Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-amber-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन महिला उद्योग व उपजीविका नोंद (Register Enterprise)
            </h3>

            <form onSubmit={handleAdd} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">१. महिला सदस्य निवडा *</label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.marathiName} ({m.shgName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">२. उद्योगाचे / व्यवसायाचे नाव *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सहेली शिवणकाम व बुटीक / जाधव डेअरी फार्म"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">३. उद्योग प्रवर्ग (Category)</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as BusinessEnterprise['category'])}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="शेतीपूरक / पशुपालन">शेतीपूरक / पशुपालन (शेळी, गाय, कुक्कुटपालन)</option>
                  <option value="हस्तकला व कापड (Textiles/Handicrafts)">हस्तकला व कापड (शिवणकाम, भरतकाम)</option>
                  <option value="खाद्यपदार्थ व प्रक्रिया (Food Processing)">खाद्यपदार्थ व प्रक्रिया (मसाले, पापड, लोणचे)</option>
                  <option value="किराणा व व्यापार (Retail)">किराणा, भाजीपाला व व्यापार</option>
                  <option value="सेवा व्यवसाय (Services)">सेवा व्यवसाय (ब्युटी पार्लर, झेरॉक्स, इ.)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">मासिक उलाढाल (₹ Revenue)</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={e => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">मासिक निव्वळ नफा (₹ Profit) *</label>
                  <input
                    type="number"
                    value={monthlyNetProfit}
                    onChange={e => setMonthlyNetProfit(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">वापरलेले बचत गट कर्ज (₹)</label>
                  <input
                    type="number"
                    value={shgLoanAmountUsed}
                    onChange={e => setShgLoanAmountUsed(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">विक्री मार्ग (Market Channel)</label>
                  <input
                    type="text"
                    value={marketChannels}
                    onChange={e => setMarketChannels(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-amber-950">अंदाजे वार्षिक उत्पन्न:</span>
                <span className="font-black text-base text-amber-900">{formatINR(annualIncome)}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>उद्योग जतन करा (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Business Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={bizToDelete !== null}
        onClose={() => setBizToDelete(null)}
        onConfirm={() => {
          if (bizToDelete) {
            deleteBusiness(bizToDelete.id);
            setBizToDelete(null);
          }
        }}
        title="उपजीविका उद्योग नोंद हटवा (Delete Enterprise)"
        itemName={`${bizToDelete?.memberName || ''} - ${bizToDelete?.businessName || ''}`}
        itemType="उपजीविका व्यवसाय"
        warningMessage="हा उद्योग रेकॉर्ड सिस्टीममधून काढून टाकला जाईल."
      />
    </div>
  );
};
