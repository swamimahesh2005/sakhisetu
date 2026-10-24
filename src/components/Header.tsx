'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BellIcon,
  MicIcon,
  SearchIcon,
} from './icons';

interface HeaderProps {
  onOpenVoiceAssistant: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoiceAssistant,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const {
    currentUser,
    isOnline,
    toggleOnline,
    offlineQueueCount,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    globalSearch,
    setGlobalSearch,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const roleTitleMarathi =
    currentUser.role === 'CRP'
      ? 'समूह सखी (CRP)'
      : currentUser.role === 'BLOCK_MANAGER'
      ? 'प्रखंड व्यवस्थापक (Block Manager)'
      : 'प्रशासक (Admin)';

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white shadow-md border-b border-emerald-600/40">
      {/* Top Bar for System & Status Info */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 flex items-center justify-between border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide uppercase bg-black/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            सखीसेतू (SakhiSetu)
          </span>
          <span className="hidden sm:inline text-emerald-100 text-[11px]">
            महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (UMED / MSRLM)
          </span>
        </div>

        {/* Status Indicators & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleOnline}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm ${
              isOnline
                ? 'bg-emerald-600 text-white border border-emerald-400/40'
                : 'bg-amber-500 text-black font-extrabold animate-pulse'
            }`}
            title="ऑनलाइन / ऑफलाइन स्थिती"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white' : 'bg-red-800'}`}></span>
            <span>{isOnline ? '🟢 ऑनलाइन' : `🟠 ऑफलाइन (${offlineQueueCount})`}</span>
          </button>

          {/* User Role Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full border border-white/20 text-xs font-bold text-white">
            <span>{currentUser.avatar || '👩🏽‍💼'}</span>
            <span>{roleTitleMarathi}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="bg-rose-600/90 hover:bg-rose-700 text-white px-2.5 py-0.5 rounded-full font-bold text-xs transition flex items-center gap-1 shadow-sm border border-white/20"
            title="लॉगआउट करा (Logout)"
          >
            <span>🚪</span>
            <span>लॉगआउट (Logout)</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Greeting */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
            title={`सध्याचा विभाग: ${activeTab}`}
          >
            <div className="w-11 h-11 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-200">
              स
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  सखीसेतू
                </h1>
                <span className="bg-emerald-600/60 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-400/30">
                  महिला बचत गट व्यवस्थापन
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                नमस्ते, {currentUser.marathiName.split(' ')[0]}! ({roleTitleMarathi})
              </p>
            </div>
          </div>

          {/* Mobile Actions: Voice & Notification */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenVoiceAssistant}
              className="bg-amber-400 text-amber-950 px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow"
            >
              <MicIcon className="w-4 h-4 text-emerald-950" />
              <span>मदत</span>
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white/15 rounded-xl text-white"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Controls: Search + Voice Assistant + Notifications */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-72">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="महिला, बचत गट किंवा गाव शोधा..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 rounded-xl text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner font-medium"
            />
          </div>

          {/* Voice Assistant */}
          <button
            onClick={onOpenVoiceAssistant}
            className="hidden md:flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 px-3.5 py-2 rounded-xl font-extrabold text-xs shadow-md transition transform hover:scale-105"
          >
            <MicIcon className="w-4 h-4 text-emerald-950" />
            <span>मराठी व्हॉईस मदत (Voice)</span>
          </button>

          {/* Notification Button */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-white transition"
              title="सूचना (Notifications)"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-emerald-100 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-xs text-gray-900">सूचना केंद्र (Notifications)</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-emerald-700 hover:underline font-semibold"
                    >
                      सर्व वाचले (Mark all read)
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 mt-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400">कोणतीही नवीन सूचना नाही</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2.5 rounded-xl cursor-pointer transition ${
                          n.isRead ? 'opacity-70 hover:bg-gray-50' : 'bg-emerald-50/70 hover:bg-emerald-100/70 font-semibold'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs text-emerald-950 font-bold">{n.title}</span>
                          <span className="text-[10px] text-gray-400">{n.createdAt}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{n.marathiMessage}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
