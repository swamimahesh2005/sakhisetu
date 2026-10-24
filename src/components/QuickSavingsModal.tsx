'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/export-helpers';
import {
  PiggyBankIcon,
  CheckCircleIcon,
  XIcon,
  VolumeUpIcon,
  PrinterIcon
} from './icons';

interface QuickSavingsModalProps {
  onClose: () => void;
}

export const QuickSavingsModal: React.FC<QuickSavingsModalProps> = ({ onClose }) => {
  const { shgs, members, recordSavings, isOnline, speakText } = useApp();

  const [selectedSHGId, setSelectedSHGId] = useState<string>(shgs[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [mandatoryAmount, setMandatoryAmount] = useState<number>(200);
  const [voluntaryAmount, setVoluntaryAmount] = useState<number>(0);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'रोख (Cash)' | 'UPI / ऑनलाईन (Online)'>('रोख (Cash)');
  const [notes, setNotes] = useState<string>('मासिक नियमित बचत ठेव');

  const [lastReceipt, setLastReceipt] = useState<{
    receiptNumber: string;
    memberName: string;
    shgName: string;
    amount: number;
    date: string;
  } | null>(null);

  const shgMembers = members.filter(m => m.shgId === selectedSHGId);
  const totalAmount = Number(mandatoryAmount || 0) + Number(voluntaryAmount || 0) + Number(penaltyAmount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert('कृपया महिला सदस्य निवडा');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    const shg = shgs.find(s => s.id === selectedSHGId);
    if (!member || !shg) return;

    recordSavings({
      shgId: selectedSHGId,
      memberId: selectedMemberId,
      memberName: member.marathiName.split('(')[0],
      date: new Date().toISOString().split('T')[0],
      mandatoryAmount: Number(mandatoryAmount),
      voluntaryAmount: Number(voluntaryAmount),
      penaltyAmount: Number(penaltyAmount),
      totalAmount,
      paymentMode,
      notes
    });

    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setLastReceipt({
      receiptNumber: receiptNum,
      memberName: member.marathiName.split('(')[0],
      shgName: shg.marathiName,
      amount: totalAmount,
      date: new Date().toLocaleDateString('mr-IN')
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-emerald-200 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
        >
          <XIcon className="w-5 h-5" />
        </button>

        {lastReceipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircleIcon className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-gray-900">
              बचत पावती यशस्वीरित्या तयार झाली!
            </h3>
            <p className="text-xs text-gray-500">
              {isOnline ? 'सर्व्हरवर सुरक्षित नोंद झाली' : 'ऑफलाइन जतन झाली (ऑनलाइन आल्यावर सिंक होईल)'}
            </p>

            {/* Receipt Box */}
            <div className="bg-emerald-50/80 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-left text-xs space-y-2 text-emerald-950">
              <div className="flex justify-between border-b border-emerald-200 pb-1.5 font-bold">
                <span>पावती क्र. {lastReceipt.receiptNumber}</span>
                <span>दिनांक: {lastReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span>बचत गट:</span>
                <span className="font-bold">{lastReceipt.shgName}</span>
              </div>
              <div className="flex justify-between">
                <span>महिला सदस्य:</span>
                <span className="font-extrabold text-sm">{lastReceipt.memberName}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-2 text-sm font-black">
                <span>एकूण जमा रक्कम:</span>
                <span className="text-emerald-800 text-base">{formatINR(lastReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  speakText(`${lastReceipt.memberName} यांची ${lastReceipt.amount} रुपये बचत पावती यशस्वीरित्या जमा झाली.`);
                }}
                className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
                title="पावती ऐका"
              >
                <VolumeUpIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl font-bold text-xs flex items-center gap-1.5"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>पावती प्रिंट</span>
              </button>
              <button
                onClick={() => {
                  setLastReceipt(null);
                  setSelectedMemberId('');
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md"
              >
                पुढील बचत नोंद (Next)
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <PiggyBankIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  आजची बचत नोंद (Record Today&apos;s Savings)
                </h3>
                <p className="text-xs text-gray-500">
                  सभेत त्वरित बचत पावती तयार करा (Quick 1-Tap Receipt)
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  १. बचत गट निवडा (Select SHG) *
                </label>
                <select
                  value={selectedSHGId}
                  onChange={e => {
                    setSelectedSHGId(e.target.value);
                    setSelectedMemberId('');
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400"
                >
                  {shgs.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.marathiName} ({s.villageName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  २. महिला सदस्य निवडा (Select Member) *
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="">-- महिला सदस्य निवडा --</option>
                  {shgMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.marathiName} (सध्याची बचत: ₹{m.totalSaved})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    नियमित मासिक बचत (₹) *
                  </label>
                  <input
                    type="number"
                    value={mandatoryAmount}
                    onChange={e => setMandatoryAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-sm text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ऐच्छिक ठेव (₹ Voluntary)
                  </label>
                  <input
                    type="number"
                    value={voluntaryAmount}
                    onChange={e => setVoluntaryAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    दंड / विलंब शुल्क (₹ Fine)
                  </label>
                  <input
                    type="number"
                    value={penaltyAmount}
                    onChange={e => setPenaltyAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">भरणा प्रकार (Payment Mode)</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as 'रोख (Cash)' | 'UPI / ऑनलाईन (Online)')}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="रोख (Cash)">रोख (Cash)</option>
                    <option value="UPI / ऑनलाईन (Online)">UPI / ऑनलाईन (Online)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">नोंद / शेरा (Notes)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-xs"
                />
              </div>

              {/* Total Calculation Bar */}
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs">एकूण पावती रक्कम (Total Amount):</span>
                <span className="text-xl font-black text-emerald-900">{formatINR(totalAmount)}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <PiggyBankIcon className="w-4 h-4" />
                  <span>पावती जतन करा (Save Receipt)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
