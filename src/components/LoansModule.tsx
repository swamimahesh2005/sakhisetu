'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LoanRecord } from '@/types';
import { formatINR } from '@/lib/export-helpers';
import {
  BanknoteIcon,
  PlusIcon,
  SearchIcon,
  CheckCircleIcon,
  XIcon,
  VolumeUpIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const LoansModule: React.FC = () => {
  const { loans, shgs, members, disburseLoan, repayLoan, deleteLoan, speakText, globalSearch, setGlobalSearch } = useApp();

  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'CLOSED' | 'ALL'>('ACTIVE');
  const [filterSHG, setFilterSHG] = useState<string>('ALL');
  const [loanToDelete, setLoanToDelete] = useState<LoanRecord | null>(null);

  // Modals
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [repayLoanTarget, setRepayLoanTarget] = useState<LoanRecord | null>(null);
  const [repayAmount, setRepayAmount] = useState<number>(2000);

  // Disbursement Form
  const [selectedSHGId, setSelectedSHGId] = useState<string>(shgs[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [loanType, setLoanType] = useState<'अंतर्गत कर्ज (Internal Loan)' | 'बँक CCL लिंकेज (Bank CCL Loan)'>('अंतर्गत कर्ज (Internal Loan)');
  const [principalAmount, setPrincipalAmount] = useState<number>(20000);
  const [interestRate, setInterestRate] = useState<number>(1.0);
  const [tenureMonths, setTenureMonths] = useState<number>(10);
  const [purpose, setPurpose] = useState<LoanRecord['purpose']>('शेळीपालन / पशुधन (Livestock)');

  const shgMembers = members.filter(m => m.shgId === selectedSHGId);

  // EMI approximate calculation
  const calculatedMonthlyEmi = Math.round(
    (principalAmount + principalAmount * (interestRate / 100) * tenureMonths) / tenureMonths
  );

  const filteredLoans = loans.filter(l => {
    const matchesSearch =
      l.memberName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      l.purpose.toLowerCase().includes(globalSearch.toLowerCase());

    const matchesSHG = filterSHG === 'ALL' || l.shgId === filterSHG;
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'ACTIVE' && l.status === 'सक्रिय (Active)') ||
      (activeTab === 'CLOSED' && l.status === 'पूर्ण परतफेड (Closed)');

    return matchesSearch && matchesSHG && matchesTab;
  });

  const handleDisburse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      alert('कृपया महिला सदस्य निवडा');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    const shg = shgs.find(s => s.id === selectedSHGId);
    if (!member || !shg) return;

    disburseLoan({
      shgId: selectedSHGId,
      memberId: selectedMemberId,
      memberName: member.marathiName.split('(')[0],
      loanType,
      principalAmount: Number(principalAmount),
      interestRateMonthlyPercent: Number(interestRate),
      tenureMonths: Number(tenureMonths),
      monthlyEmi: calculatedMonthlyEmi,
      purpose,
      disbursedDate: new Date().toISOString().split('T')[0],
      totalInterestExpected: Math.round(principalAmount * (interestRate / 100) * tenureMonths)
    });

    setShowDisburseModal(false);
    setSelectedMemberId('');
  };

  const handleRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayLoanTarget) return;

    repayLoan(repayLoanTarget.id, Number(repayAmount));
    setRepayLoanTarget(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-purple-50 text-purple-700">
              <BanknoteIcon className="w-6 h-6" />
            </span>
            कर्ज वाटप व परतफेड नोंदवही (Loans & Repayments)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            अंतर्गत कर्ज (Internal Loan) व बँक CCL लिंकेज कर्ज वाटप, मासिक हप्ता (EMI) व परतफेड ट्रॅकिंग
          </p>
        </div>

        <button
          onClick={() => setShowDisburseModal(true)}
          className="bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shadow-purple-900/20 flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>+ नवीन कर्ज वाटप (Disburse Loan)</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-5 rounded-3xl shadow-md border border-purple-800">
          <span className="text-xs uppercase font-black text-purple-200 block">सक्रिय कर्ज मुद्दल शिल्लक (Active Balance)</span>
          <span className="text-3xl font-black mt-1 block">
            {formatINR(loans.filter(l => l.status === 'सक्रिय (Active)').reduce((acc, l) => acc + l.remainingPrincipal, 0))}
          </span>
          <span className="text-xs text-purple-200 mt-1 block">
            {loans.filter(l => l.status === 'सक्रिय (Active)').length} सक्रिय कर्जे
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-500 block">एकूण जमा झालेली परतफेड (Total Repaid)</span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">
            {formatINR(loans.reduce((acc, l) => acc + l.totalPaid, 0))}
          </span>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">९८.५% वेळेवर वसुली दर</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-500 block">पूर्ण झालेली कर्जे (Closed Loans)</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {loans.filter(l => l.status === 'पूर्ण परतफेड (Closed)').length} कर्जे
          </span>
          <span className="text-xs text-gray-500 mt-1 block">शून्य थकीत</span>
        </div>
      </div>

      {/* Filter & Tab Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm text-xs">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition ${
              activeTab === 'ACTIVE' ? 'bg-white text-purple-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            सक्रिय (Active)
          </button>
          <button
            onClick={() => setActiveTab('CLOSED')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition ${
              activeTab === 'CLOSED' ? 'bg-white text-purple-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            पूर्ण परतफेड (Closed)
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-1.5 font-bold rounded-lg transition ${
              activeTab === 'ALL' ? 'bg-white text-purple-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            सर्व (All)
          </button>
        </div>

        <div>
          <select
            value={filterSHG}
            onChange={e => setFilterSHG(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व बचत गट (All SHGs)</option>
            {shgs.map(s => (
              <option key={s.id} value={s.id}>
                {s.marathiName}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="सदस्याचे नाव किंवा हेतू शोधा..."
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 font-medium"
          />
        </div>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLoans.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-3xl text-center text-gray-400 border border-dashed border-gray-300">
            कोणतीही कर्ज नोंद आढळली नाही.
          </div>
        ) : (
          filteredLoans.map(loan => {
            const progress = Math.min(100, Math.round((loan.totalPaid / (loan.principalAmount || 1)) * 100));
            return (
              <div
                key={loan.id}
                className="bg-white rounded-3xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {loan.loanType.split(' ')[0]}
                      </span>
                      <h3 className="font-black text-base text-gray-900 mt-1">{loan.memberName}</h3>
                      <p className="text-xs text-gray-500">उद्देश: {loan.purpose.split('(')[0]}</p>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        loan.status === 'सक्रिय (Active)'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {loan.status.split(' ')[0]}
                    </span>
                  </div>

                  {/* Financial Numbers */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                      <span className="text-purple-700 text-[10px] block font-bold">मंजूर मुद्दल</span>
                      <span className="font-black text-purple-950 text-base">{formatINR(loan.principalAmount)}</span>
                    </div>
                    <div className="bg-amber-50 p-2.5 rounded-2xl border border-amber-100">
                      <span className="text-amber-800 text-[10px] block font-bold">शिल्लक मुद्दल</span>
                      <span className="font-black text-amber-950 text-base">{formatINR(loan.remainingPrincipal)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                      <span>परतफेड प्रगती:</span>
                      <span className="font-bold text-emerald-700">{progress}% (जमा: {formatINR(loan.totalPaid)})</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-2xl space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">मासिक हप्ता (EMI):</span>
                      <span className="font-bold text-gray-800">₹{loan.monthlyEmi} / महिना</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">व्याज दर व मुदत:</span>
                      <span className="font-bold text-gray-800">{loan.interestRateMonthlyPercent}% दरमहा ({loan.tenureMonths} महिने)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">वाटप दिनांक:</span>
                      <span className="font-bold text-gray-800">{loan.disbursedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() =>
                      speakText(
                        `${loan.memberName} यांचे ${loan.principalAmount} रुपयांचे कर्ज. शिल्लक मुद्दल ${loan.remainingPrincipal} रुपये आहे. मासिक हप्ता ${loan.monthlyEmi} रुपये आहे.`
                      )
                    }
                    className="p-2 text-gray-500 hover:text-purple-700 bg-gray-100 hover:bg-purple-50 rounded-xl"
                    title="माहिती ऐका"
                  >
                    <VolumeUpIcon className="w-4 h-4" />
                  </button>

                  {loan.status === 'सक्रिय (Active)' ? (
                    <button
                      onClick={() => {
                        setRepayLoanTarget(loan);
                        setRepayAmount(loan.monthlyEmi || 2000);
                      }}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white py-2 px-3 rounded-xl font-black text-xs shadow-sm transition text-center"
                    >
                      हप्ता जमा करा (Repay EMI)
                    </button>
                  ) : (
                    <div className="flex-1 text-center py-2 text-xs font-black text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      ✓ कर्ज पूर्ण मिटले आहे
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLoanToDelete(loan);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 bg-gray-100 rounded-xl transition"
                    title="कर्ज नोंद हटवा (Delete Loan)"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Disburse Loan Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative border border-purple-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setShowDisburseModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन कर्ज वाटप नोंद (Disburse New Loan)
            </h3>

            <form onSubmit={handleDisburse} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-black text-gray-800 mb-1">१. बचत गट निवडा *</label>
                <select
                  value={selectedSHGId}
                  onChange={e => {
                    setSelectedSHGId(e.target.value);
                    setSelectedMemberId('');
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                >
                  {shgs.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.marathiName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">२. महिला सदस्य निवडा *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                >
                  <option value="">-- महिला सदस्य निवडा --</option>
                  {shgMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.marathiName} (सध्याचे कर्ज: ₹{m.activeLoanAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">कर्ज प्रकार</label>
                  <select
                    value={loanType}
                    onChange={e => setLoanType(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="अंतर्गत कर्ज (Internal Loan)">अंतर्गत कर्ज (Internal Loan)</option>
                    <option value="बँक CCL लिंकेज (Bank CCL Loan)">बँक CCL लिंकेज (Bank CCL)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">कर्ज हेतू (Purpose) *</label>
                  <select
                    value={purpose}
                    onChange={e => setPurpose(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="शेळीपालन / पशुधन (Livestock)">शेळीपालन / पशुधन</option>
                    <option value="शेती व खते (Agriculture)">शेती व खते</option>
                    <option value="शिवणकाम व्यवसाय (Tailoring)">शिवणकाम व्यवसाय</option>
                    <option value="दुकान / व्यवसाय (Micro Business)">दुकान / व्यवसाय</option>
                    <option value="मुलांचे शिक्षण (Education)">मुलांचे शिक्षण</option>
                    <option value="आरोग्य व उपचार (Medical)">आरोग्य व उपचार</option>
                    <option value="घरदुरुस्ती (Home Repair)">घरदुरुस्ती</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">मुद्दल रक्कम (₹) *</label>
                  <input
                    type="number"
                    value={principalAmount}
                    onChange={e => setPrincipalAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-purple-900"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">मासिक व्याजदर (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={e => setInterestRate(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">मुदत (महिने)</label>
                  <input
                    type="number"
                    value={tenureMonths}
                    onChange={e => setTenureMonths(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Calculated EMI preview */}
              <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-purple-950 font-bold block">अंदाजे मासिक हप्ता (Calculated EMI):</span>
                  <span className="text-[11px] text-purple-700">मुद्दल + व्याज समान हप्ता</span>
                </div>
                <span className="text-xl font-black text-purple-950">₹{calculatedMonthlyEmi} / महिना</span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <BanknoteIcon className="w-4 h-4" />
                  <span>कर्ज मंजूर व वितरित करा (Disburse)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repay EMI Modal */}
      {repayLoanTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setRepayLoanTarget(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              कर्ज हप्ता जमा करा (Repay Loan EMI)
            </h3>

            <form onSubmit={handleRepay} className="mt-4 space-y-3.5">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                <div className="font-black text-base">{repayLoanTarget.memberName}</div>
                <div className="text-xs">उद्देश: {repayLoanTarget.purpose}</div>
                <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold">
                  <span>सध्या शिल्लक मुद्दल:</span>
                  <span className="text-amber-900 text-sm font-black">{formatINR(repayLoanTarget.remainingPrincipal)}</span>
                </div>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">
                  हप्ता जमा रक्कम (₹ Payment Amount) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={repayLoanTarget.remainingPrincipal}
                  value={repayAmount}
                  onChange={e => setRepayAmount(Number(e.target.value))}
                  className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl font-black text-lg text-emerald-800"
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl text-gray-600 flex justify-between">
                <span>हप्ता जमा झाल्यावर नवीन शिल्लक:</span>
                <span className="font-black text-gray-900">
                  {formatINR(Math.max(0, repayLoanTarget.remainingPrincipal - repayAmount))}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setRepayLoanTarget(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-black shadow-md flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>हप्ता नोंदवा (Confirm Repayment)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Loan Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={loanToDelete !== null}
        onClose={() => setLoanToDelete(null)}
        onConfirm={() => {
          if (loanToDelete) {
            deleteLoan(loanToDelete.id);
            setLoanToDelete(null);
          }
        }}
        title="कर्ज खाते हटवा (Delete Loan Record)"
        itemName={`${loanToDelete?.memberName || ''} - ₹${loanToDelete?.principalAmount || 0} (${loanToDelete?.loanType || ''})`}
        itemType="कर्ज नोंद"
        warningMessage="ही कर्ज नोंद कायमची हटवली जाईल व सदस्याच्या सक्रिय कर्ज खात्यातून शिल्लक मुद्दल आपोआप वजा केली जाईल."
      />
    </div>
  );
};
