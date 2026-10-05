'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Role } from '@/types';
import {
  BellIcon,
  MicIcon,
  VolumeUpIcon,
  SearchIcon,
  RefreshIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from './icons';

interface HeaderProps {
  onOpenVoiceAssistant: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenVoiceAssistant, activeTab, setActiveTab }) => {
  const {
    currentUser,
    switchRole,
    isOnline,
    toggleOnline,
    offlineQueueCount,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    speakText,
    globalSearch,
    setGlobalSearch
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-amber-700 via-orange-600 to-rose-700 text-white shadow-lg">
      {/* Top Bar for Role Switching & Offline Status */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between border-b border-white/20 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide uppercase bg-black/25 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            सखीसेतू (SakhiSetu)
          </span>
          <span className="hidden md:inline text-white/90">
            महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (UMED / MSRLM)
          </span>
        </div>

        {/* Role Quick Switcher & Offline Indicator */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {/* Offline Sync Button */}
          <button
            onClick={toggleOnline}
            className={`px-3 py-1 rounded-full font-medium transition flex items-center gap-1.5 shadow-sm ${
              isOnline
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-black animate-pulse'
            }`}
            title="ऑनलाइन / ऑफलाइन स्थिती बदला (Toggle Online/Offline)"
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white' : 'bg-red-800'}`}></span>
            {isOnline ? '🟢 ऑनलाइन (Online)' : `🟠 ऑफलाइन (${offlineQueueCount} साठवले)`}
          </button>

          {/* Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1.5 border border-white/30"
            >
              <span>{currentUser.avatar}</span>
              <span className="font-bold">
                {currentUser.role === 'CRP'
                  ? 'समूह सखी (CRP)'
                  : currentUser.role === 'BLOCK_MANAGER'
                  ? 'प्रखंड व्यवस्थापक (Block Mgr)'
                  : 'प्रशासक (Admin)'}
              </span>
              <span className="text-[10px]">▼</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 text-left animate-in fade-in zoom-in-95">
                <div className="p-2 border-b border-gray-100 mb-1 font-bold text-xs text-gray-500">
                  भूमिका निवडा (Select Role):
                </div>
                <button
                  onClick={() => {
                    switchRole('CRP');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                    currentUser.role === 'CRP' ? 'bg-orange-50 font-bold text-orange-800 border border-orange-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">👩🏽‍💼</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">समूह सखी (CRP - Field Worker)</div>
                    <div className="text-xs text-gray-500">सुमित्रा पवार (खेड शिवापूर गट)</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('BLOCK_MANAGER');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                    currentUser.role === 'BLOCK_MANAGER' ? 'bg-orange-50 font-bold text-orange-800 border border-orange-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">👨🏽‍💼</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">प्रखंड व्यवस्थापक (Block Manager)</div>
                    <div className="text-xs text-gray-500">राजेश शिंदे (हवेली तालुका)</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchRole('ADMIN');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition ${
                    currentUser.role === 'ADMIN' ? 'bg-orange-50 font-bold text-orange-800 border border-orange-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <div className="text-sm font-bold text-gray-900">राज्य/जिल्हा प्रशासक (Admin)</div>
                    <div className="text-xs text-gray-500">सुनिता देशमुख (पुणे जिल्हा)</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Greeting */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-white text-orange-700 flex items-center justify-center font-black text-2xl shadow-inner border-2 border-amber-300">
              स
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm">
                  सखीसेतू (SakhiSetu)
                </h1>
                <span className="bg-amber-300/30 text-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-300/40">
                  महिला बचत गट व्यवस्थापन
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                नमस्ते, {currentUser.marathiName.split(' ')[0]} ताई! 🙏
              </p>
            </div>
          </div>

          {/* Voice Assistant & Notifications in Mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenVoiceAssistant}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-md text-xs animate-bounce"
            >
              <MicIcon className="w-4 h-4 text-red-700" />
              <span>बोलून सांगा</span>
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white/20 rounded-xl hover:bg-white/30 text-white"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Search & Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="महिला, बचत गट किंवा गाव शोधा (Search)..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white text-gray-900 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-inner"
            />
          </div>

          {/* Desktop Voice Assistant Button */}
          <button
            onClick={onOpenVoiceAssistant}
            className="hidden md:flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-amber-950 px-4 py-2 rounded-xl font-bold text-sm shadow-md transition transform hover:scale-105"
          >
            <MicIcon className="w-5 h-5 text-red-700" />
            <span>मराठी व्हॉईस मदत (Voice Assistant)</span>
          </button>

          {/* Desktop Notification Button */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-white transition"
              title="सूचना (Notifications)"
            >
              <BellIcon className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-gray-900">सूचना केंद्र (Notifications)</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-orange-600 hover:underline font-semibold"
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
                          n.isRead ? 'opacity-70 hover:bg-gray-50' : 'bg-orange-50/70 hover:bg-orange-100/70 font-semibold'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs text-orange-900 font-bold">{n.title}</span>
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
