'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/export-helpers';
import {
  UsersIcon,
  PiggyBankIcon,
  BanknoteIcon,
  CalendarIcon,
  AwardIcon,
  SparklesIcon,
  VolumeUpIcon,
  ArrowRightIcon,
  CameraIcon,
} from './icons';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenQuickSavings: () => void;
  onOpenNewMeeting: () => void;
  onOpenNewMember: () => void;
  onOpenNewSHG: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenQuickSavings,
  onOpenNewMeeting,
  onOpenNewMember,
  onOpenNewSHG,
}) => {
  const {
    currentUser,
    shgs,
    members,
    savings,
    loans,
    tasks,
    speakText,
  } = useApp();

  // Metrics
  const totalSavings =
    savings.reduce((acc, s) => acc + s.totalAmount, 0) +
    shgs.reduce((acc, s) => acc + s.totalSavings, 0);

  const totalActiveLoans = loans
    .filter(l => l.status === 'सक्रिय (Active)')
    .reduce((acc, l) => acc + l.remainingPrincipal, 0);

  const lakhpatiCount = members.filter(
    m => m.lakhpatiDidiStatus === 'साध्य (Achieved)' || m.monthlyIncome >= 8500
  ).length;

  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner with Audio Greeting */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-600/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2 border border-white/10">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>
                {currentUser.role === 'CRP'
                  ? 'समूह सखी कार्यक्षेत्र (CRP Area)'
                  : currentUser.role === 'BLOCK_MANAGER'
                    ? 'प्रखंड व्यवस्थापक नियंत्रण (Block Manager)'
                    : 'राज्य नियंत्रण कक्ष (Admin Hub)'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser.marathiName}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl font-medium leading-relaxed">
              {currentUser.role === 'CRP'
                ? 'आपल्याकडे खेड ATNUR  परिसरातील 43 महिला बचत गटांची जबाबदारी आहे. नियमित बचत संकलन व सभेचे काम वेळेवर पूर्ण करा.'
                : currentUser.role === 'BLOCK_MANAGER'
                  ? 'JALKOT  तालुक्यातील १८ गावे, १४२ बचत गट, १२ समूह सखी आणि बँक लिंकेज व्यवस्थापनाचा संपूर्ण आढावा येथे उपलब्ध आहे.'
                  : 'LATUR जिल्हा स्वयंसहाय्यता गट नेटवर्क, लखपती दीदी अभियान व शासकीय योजनांचे थेट नियंत्रण.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                speakText(
                  `नमस्ते ${currentUser.marathiName.split(' ')[0]} ताई! सखीसेतू ॲपमध्ये आपले स्वागत आहे. आज आपल्याकडे ${pendingTasks.length} महत्त्वाची कामे आहेत. आजची बचत नोंदवण्यासाठी आजची बचत बटण दाबा.`
                )
              }
              className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-2xl font-bold text-xs backdrop-blur-md flex items-center gap-2 transition border border-white/20 shadow-sm"
            >
              <VolumeUpIcon className="w-4 h-4 text-amber-300" />
              <span>माहिती ऐका (Listen)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Large High-Visibility Action Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-5 bg-emerald-600 rounded-full"></span>
            महत्त्वाच्या कृती (Quick Actions)
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
            मोठी बटणे (Easy Tap)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Action 1: Today's Savings */}
          <button
            onClick={onOpenQuickSavings}
            className="group p-4 sm:p-5 bg-white hover:bg-emerald-50/70 border-2 border-emerald-300 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <PiggyBankIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-gray-900 mt-2.5">
              आजची बचत
            </span>
            <span className="text-[10px] text-emerald-700 font-bold">(Today&apos;s Saving)</span>
          </button>

          {/* Action 2: New Meeting */}
          <button
            onClick={onOpenNewMeeting}
            className="group p-4 sm:p-5 bg-white hover:bg-amber-50/70 border-2 border-amber-300 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-gray-900 mt-2.5">
              मासिक सभा
            </span>
            <span className="text-[10px] text-amber-700 font-bold">(SHG Meeting)</span>
          </button>

          {/* Action 3: New Member Registration */}
          <button
            onClick={onOpenNewMember}
            className="group p-4 sm:p-5 bg-white hover:bg-blue-50/70 border-2 border-blue-300 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-gray-900 mt-2.5">
              महिला नोंदणी
            </span>
            <span className="text-[10px] text-blue-700 font-bold">(Add Member)</span>
          </button>

          {/* Action 4: Loan & EMI */}
          <button
            onClick={() => setActiveTab('loans')}
            className="group p-4 sm:p-5 bg-white hover:bg-purple-50/70 border-2 border-purple-300 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <BanknoteIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-gray-900 mt-2.5">
              कर्ज व हप्ते
            </span>
            <span className="text-[10px] text-purple-700 font-bold">(Loan & EMI)</span>
          </button>

          {/* Action 5: Field Visit GPS */}
          <button
            onClick={() => setActiveTab('fieldVisits')}
            className="group p-4 sm:p-5 bg-white hover:bg-rose-50/70 border-2 border-rose-300 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <CameraIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-gray-900 mt-2.5">
              क्षेत्रीय भेट GPS
            </span>
            <span className="text-[10px] text-rose-700 font-bold">(Field Visit)</span>
          </button>

          {/* Action 6: Govt Schemes */}
          <button
            onClick={() => setActiveTab('schemes')}
            className="group p-4 sm:p-5 bg-white hover:bg-teal-50/70 border-2 border-teal-300 rounded-3xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition">
              <AwardIcon className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-gray-900 mt-2.5">
              शासकीय योजना
            </span>
            <span className="text-[10px] text-teal-700 font-bold">(Govt Schemes)</span>
          </button>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: My SHGs */}
        <div
          onClick={() => setActiveTab('shgs')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-emerald-900">माझे बचत गट (SHGs)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">{shgs.length} गट</span>
            <span className="text-xs text-emerald-600 font-bold">१००% सक्रिय</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">एकूण {members.length} महिला सभासद</div>
        </div>

        {/* Metric 2: Total Savings */}
        <div
          onClick={() => setActiveTab('savings')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-emerald-900">एकूण बचत (Savings)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <PiggyBankIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">{formatINR(totalSavings)}</span>
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">नियमित मासिक बचत निधी</div>
        </div>

        {/* Metric 3: Active Loans */}
        <div
          onClick={() => setActiveTab('loans')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-purple-100 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-purple-900">सक्रिय कर्ज (Loans)</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <BanknoteIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-900">{formatINR(totalActiveLoans)}</span>
          </div>
          <div className="mt-1 text-xs text-purple-700 font-medium">९८.५% वेळेवर वसुली दर</div>
        </div>

        {/* Metric 4: Lakhpati Didi */}
        <div
          onClick={() => setActiveTab('livelihood')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-amber-900">लखपती दीदी (Lakhpati)</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <AwardIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">{lakhpatiCount} महिला</span>
            <span className="text-xs text-amber-700 font-bold">साध्य</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">वार्षिक उत्पन्न ₹१ लाखाहून अधिक</div>
        </div>
      </div>

      {/* Main Grid: SHGs Overview + Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SHGs Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-5 bg-emerald-600 rounded-full"></span>
              माझे स्वयंसहाय्यता गट (My SHGs Overview)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewSHG}
                className="text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1 rounded-xl flex items-center gap-1 transition"
              >
                <span>+ नवीन गट</span>
              </button>
              <button
                onClick={() => setActiveTab('shgs')}
                className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
              >
                <span>सर्व पहा (View All)</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shgs.slice(0, 4).map(shg => (
              <div
                key={shg.id}
                className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {shg.code}
                      </span>
                      <h4 className="font-black text-base text-gray-900 mt-1.5">{shg.marathiName}</h4>
                      <p className="text-xs text-gray-500">📍 {shg.villageName} | {shg.voClfName}</p>
                    </div>

                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-300">
                      {shg.grade}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-2xl">
                      <span className="text-gray-500 text-[10px] block font-bold">एकूण सदस्य</span>
                      <span className="font-black text-gray-900 text-sm">{shg.totalMembersCount || 12} महिला</span>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                      <span className="text-emerald-700 text-[10px] block font-bold">बचत निधी</span>
                      <span className="font-black text-emerald-900 text-sm">{formatINR(shg.totalSavings)}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-700 bg-amber-50/70 p-2.5 rounded-2xl border border-amber-200">
                    <span className="font-bold text-amber-950">बँक CCL मर्यादा:</span> {formatINR(shg.cclSanctionedLimit)} ({shg.bankName.split(' ')[0]})
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() =>
                      speakText(`${shg.marathiName}. एकूण बचत ${shg.totalSavings} रुपये. सभा दिवस ${shg.meetingDay}.`)
                    }
                    className="p-2 text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 rounded-xl"
                    title="माहिती ऐका"
                  >
                    <VolumeUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onOpenQuickSavings}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-bold text-xs shadow transition text-center"
                  >
                    बचत नोंदवा
                  </button>
                  <button
                    onClick={() => setActiveTab('shgs')}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 py-2 px-3 rounded-xl font-bold text-xs transition"
                  >
                    तपशील
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Tasks & Helpline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-5 bg-rose-600 rounded-full"></span>
              कार्ये व आठवण (Tasks)
            </h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              सर्व ({tasks.length})
            </button>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-rose-100 shadow-sm space-y-3">
            {pendingTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3"
              >
                <div className="p-1.5 bg-rose-600 text-white rounded-lg mt-0.5">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">{task.dueDate}</span>
                  </div>
                  <h5 className="font-bold text-xs text-gray-900 mt-1">{task.marathiTitle}</h5>
                </div>
              </div>
            ))}

            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs transition text-center"
            >
              + नवीन कार्य जोडा (Add Task)
            </button>
          </div>

          {/* Support Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-4 border border-emerald-200">
            <h4 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
              <span>📞</span> समूह सखी हेल्पलाइन (Helpline)
            </h4>
            <p className="text-xs text-emerald-900 mt-1">
              बँक लिंकेज, ठराव किंवा ॲप अडचणीसाठी तालुका व्यवस्थापकांशी संपर्क साधा:
            </p>
            <div className="mt-2 bg-white/80 p-2.5 rounded-2xl text-xs font-bold text-gray-800 flex justify-between">
              <span>राजेश शिंदे (हवेली):</span>
              <a href="tel:9881123456" className="text-emerald-700 hover:underline">
                ९८८११२३४५६
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
