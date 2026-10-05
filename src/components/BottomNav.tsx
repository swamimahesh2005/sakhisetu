'use client';

import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  PiggyBankIcon,
  CalendarIcon,
  FileTextIcon,
  BanknoteIcon,
} from './icons';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'मुख्य (Home)', icon: HomeIcon },
    { id: 'shgs', label: 'माझे गट (SHGs)', icon: UsersIcon },
    { id: 'savings', label: 'बचत (Savings)', icon: PiggyBankIcon },
    { id: 'loans', label: 'कर्ज (Loans)', icon: BanknoteIcon },
    { id: 'meetings', label: 'सभा (Meetings)', icon: CalendarIcon },
    { id: 'reports', label: 'अहवाल (Reports)', icon: FileTextIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-2xl py-1.5 px-2 md:hidden">
      <div className="flex justify-around items-center">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                isActive
                  ? 'text-emerald-800 font-bold bg-emerald-50 scale-105'
                  : 'text-gray-500 hover:text-emerald-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
