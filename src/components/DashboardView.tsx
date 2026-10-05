'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, toMarathiDigits } from '@/lib/export-helpers';
import {
  UsersIcon,
  PiggyBankIcon,
  BanknoteIcon,
  CalendarIcon,
  MapPinIcon,
  AwardIcon,
  SparklesIcon,
  VolumeUpIcon,
  ArrowRightIcon,
  PlusIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CameraIcon
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
  onOpenNewSHG
}) => {
  const {
    currentUser,
    shgs,
    members,
    savings,
    loans,
    meetings,
    fieldVisits,
    tasks,
    businesses,
    govtSchemes,
    speakText
  } = useApp();

  // Summary Metrics calculations
  const totalSavings = savings.reduce((acc, s) => acc + s.totalAmount, 0) + shgs.reduce((acc, s) => acc + s.totalSavings, 0);
  const totalActiveLoans = loans.filter(l => l.status === 'सक्रिय (Active)').reduce((acc, l) => acc + l.remainingPrincipal, 0);
  const lakhpatiCount = members.filter(m => m.lakhpatiDidiStatus === 'साध्य (Achieved)' || m.monthlyIncome >= 8500).length;
  const pendingTasks = tasks.filter(t => !t.completed);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner with Audio Greeting */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-200 mb-2">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{currentUser.role === 'CRP' ? 'समूह सखी कार्यक्षेत्र' : currentUser.role === 'BLOCK_MANAGER' ? 'प्रखंड व्यवस्थापन डॅशबोर्ड' : 'राज्य नियंत्रण कक्ष'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser.marathiName}
            </h2>
            <p className="text-sm text-amber-100 mt-1 max-w-xl">
              {currentUser.role === 'CRP'
                ? 'आपल्याकडे खेड शिवापूर, कोंढणपूर व परिसरातील ४ महिला बचत गटांची जबाबदारी आहे. आजची बचत व सभेची कामे वेळेवर पूर्ण करा.'
                : currentUser.role === 'BLOCK_MANAGER'
                ? 'हवेली तालुक्यातील १८ गावे, १४२ बचत गट आणि १२ समूह सखींचे नियंत्रण व प्रगती अहवाल येथे उपलब्ध आहे.'
                : 'संपूर्ण पुणे जिल्हा स्वयंसहाय्यता गट नेटवर्क, बँक लिंकेज व लखपती दीदी अभियानाचे थेट नियंत्रण.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                speakText(
                  `नमस्ते ${currentUser.marathiName.split(' ')[0]} ताई! सखीसेतू ॲपमध्ये आपले स्वागत आहे. आज आपल्याकडे ${tasks.filter(t => !t.completed).length} महत्त्वाची कामे आहेत. आजची बचत नोंदवण्यासाठी आजची बचत बटण दाबा.`
                )
              }
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-2xl font-bold text-sm backdrop-blur-md flex items-center gap-2 transition border border-white/30 shadow-md"
            >
              <VolumeUpIcon className="w-5 h-5 text-amber-200" />
              <span>माहिती ऐका (Listen)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 High-Visibility Rural Friendly Big Action Buttons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-orange-600 rounded-full"></span>
            महत्त्वाच्या कृती (Quick Actions)
          </h3>
          <span className="text-xs font-semibold text-orange-700">मोठे बटणे (Easy Tap)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Action 1: Today's Savings */}
          <button
            onClick={onOpenQuickSavings}
            className="group p-4 sm:p-5 bg-gradient-to-b from-emerald-50 to-emerald-100/70 hover:from-emerald-100 hover:to-emerald-200 border-2 border-emerald-300 rounded-2xl flex flex-col items-center text-center shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <PiggyBankIcon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-emerald-950 mt-2.5">
              आजची बचत
            </span>
            <span className="text-[11px] text-emerald-800 font-medium">(Today&apos;s Savings)</span>
          </button>

          {/* Action 2: New Meeting */}
          <button
            onClick={onOpenNewMeeting}
            className="group p-4 sm:p-5 bg-gradient-to-b from-amber-50 to-amber-100/70 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-300 rounded-2xl flex flex-col items-center text-center shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-amber-950 mt-2.5">
              मासिक सभा
            </span>
            <span className="text-[11px] text-amber-800 font-medium">(SHG Meeting)</span>
          </button>

          {/* Action 3: New Member Registration */}
          <button
            onClick={onOpenNewMember}
            className="group p-4 sm:p-5 bg-gradient-to-b from-blue-50 to-blue-100/70 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-300 rounded-2xl flex flex-col items-center text-center shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <UsersIcon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-blue-950 mt-2.5">
              महिला नोंदणी
            </span>
            <span className="text-[11px] text-blue-800 font-medium">(Add Member)</span>
          </button>

          {/* Action 4: Loan & EMI */}
          <button
            onClick={() => setActiveTab('loans')}
            className="group p-4 sm:p-5 bg-gradient-to-b from-purple-50 to-purple-100/70 hover:from-purple-100 hover:to-purple-200 border-2 border-purple-300 rounded-2xl flex flex-col items-center text-center shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <BanknoteIcon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-purple-950 mt-2.5">
              कर्ज व परतफेड
            </span>
            <span className="text-[11px] text-purple-800 font-medium">(Loan & EMI)</span>
          </button>

          {/* Action 5: Field Visit GPS */}
          <button
            onClick={() => setActiveTab('fieldVisits')}
            className="group p-4 sm:p-5 bg-gradient-to-b from-rose-50 to-rose-100/70 hover:from-rose-100 hover:to-rose-200 border-2 border-rose-300 rounded-2xl flex flex-col items-center text-center shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <CameraIcon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-rose-950 mt-2.5">
              क्षेत्रीय भेट GPS
            </span>
            <span className="text-[11px] text-rose-800 font-medium">(Field Visit)</span>
          </button>

          {/* Action 6: Lakhpati Didi */}
          <button
            onClick={() => setActiveTab('livelihood')}
            className="group p-4 sm:p-5 bg-gradient-to-b from-orange-50 to-orange-100/70 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-300 rounded-2xl flex flex-col items-center text-center shadow-md transition transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <AwardIcon className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-sm sm:text-base text-orange-950 mt-2.5">
              लखपती दीदी
            </span>
            <span className="text-[11px] text-orange-800 font-medium">(Livelihood)</span>
          </button>
        </div>
      </div>

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: My SHGs */}
        <div
          onClick={() => setActiveTab('shgs')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-100 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-800">माझे बचत गट (SHGs)</span>
            <span className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">{shgs.length} गट</span>
            <span className="text-xs text-emerald-600 font-bold">१००% सक्रिय</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <span>एकूण {members.length} महिला सदस्य</span>
          </div>
        </div>

        {/* Metric 2: Total Savings */}
        <div
          onClick={() => setActiveTab('savings')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">एकूण बचत (Savings)</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <PiggyBankIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">{formatINR(totalSavings)}</span>
          </div>
          <div className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1">
            <span>नियमित बचत + ऐच्छिक ठेव</span>
          </div>
        </div>

        {/* Metric 3: Active Loans */}
        <div
          onClick={() => setActiveTab('loans')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-100 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">सक्रिय कर्ज (Loans)</span>
            <span className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <BanknoteIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-900">{formatINR(totalActiveLoans)}</span>
          </div>
          <div className="mt-1 text-xs text-purple-700 font-medium flex items-center gap-1">
            <span>९८% वेळेवर परतफेड (Recovery)</span>
          </div>
        </div>

        {/* Metric 4: Lakhpati Didi */}
        <div
          onClick={() => setActiveTab('livelihood')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-md hover:shadow-lg transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">लखपती दीदी (Lakhpati)</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <AwardIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">{lakhpatiCount} महिला</span>
            <span className="text-xs text-amber-700 font-bold">साध्य</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <span>वार्षिक उत्पन्न ₹१ लाखाहून अधिक</span>
          </div>
        </div>
      </div>

      {/* Main Grid: My SHG Overview + Tasks/Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: SHG Quick Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-orange-600 rounded-full"></span>
              माझे स्वयंसहाय्यता गट (My SHGs Overview)
            </h3>
            <button
              onClick={() => setActiveTab('shgs')}
              className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1"
            >
              <span>सर्व पहा (View All)</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shgs.slice(0, 4).map(shg => (
              <div
                key={shg.id}
                className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {shg.code}
                      </span>
                      <h4 className="font-extrabold text-base text-gray-900 mt-1">{shg.marathiName}</h4>
                      <p className="text-xs text-gray-500">📍 {shg.villageName} | ग्रेड {shg.grade}</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center border border-emerald-300">
                      {shg.grade}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                    <div className="bg-gray-50 p-2 rounded-xl">
                      <span className="text-gray-500 text-[11px] block">एकूण सदस्य</span>
                      <span className="font-bold text-gray-900 text-sm">{shg.totalMembersCount || 12} महिला</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl">
                      <span className="text-emerald-700 text-[11px] block">बचत निधी</span>
                      <span className="font-bold text-emerald-900 text-sm">{formatINR(shg.totalSavings)}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-600 bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                    <span className="font-semibold text-amber-900">बँक CCL मर्यादा:</span> {formatINR(shg.cclSanctionedLimit)} ({shg.bankName.split(' ')[0]})
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      speakText(`${shg.marathiName}. एकूण बचत ${shg.totalSavings} रुपये. सभा दिवस ${shg.meetingDay}.`);
                    }}
                    className="p-2 text-gray-500 hover:text-orange-600 bg-gray-100 hover:bg-orange-50 rounded-xl"
                    title="माहिती ऐका"
                  >
                    <VolumeUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onOpenQuickSavings}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-xl font-bold text-xs shadow transition text-center"
                  >
                    बचत नोंदवा
                  </button>
                  <button
                    onClick={() => setActiveTab('shgs')}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-900 py-1.5 px-3 rounded-xl font-bold text-xs transition"
                  >
                    तपशील
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Tasks & Reminders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-6 bg-rose-600 rounded-full"></span>
              कार्ये व आठवण (Tasks)
            </h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-orange-700 hover:text-orange-900"
            >
              सर्व ({tasks.length})
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm space-y-3">
            {pendingTasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 hover:bg-orange-100/50 transition flex items-start gap-3"
              >
                <div className="p-1.5 bg-rose-500 text-white rounded-lg mt-0.5">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">मुदत: {task.dueDate}</span>
                  </div>
                  <h5 className="font-bold text-xs text-gray-900 mt-1">{task.marathiTitle}</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
                </div>
              </div>
            ))}

            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition text-center"
            >
              + नवीन कार्य जोडा (Add New Task)
            </button>
          </div>

          {/* Emergency / Support Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
            <h4 className="font-extrabold text-sm text-orange-950 flex items-center gap-1.5">
              <span>📞</span> समूह सखी हेल्पलाइन (Helpline)
            </h4>
            <p className="text-xs text-orange-900 mt-1">
              बँक लिंकेज, ठराव किंवा ॲप अडचणीसाठी तालुका व्यवस्थापक यांच्याशी संपर्क साधा:
            </p>
            <div className="mt-2 flex items-center justify-between bg-white/80 p-2 rounded-xl text-xs font-bold text-gray-800">
              <span>राजेश शिंदे (हवेली):</span>
              <a href="tel:9881123456" className="text-orange-700 hover:underline">
                ९८८११२३४५६
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
