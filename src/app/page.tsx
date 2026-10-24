'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { LoginPage } from '@/components/LoginPage';
import { RegisterPage } from '@/components/RegisterPage';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { BlockManagerDashboard } from '@/components/BlockManagerDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { SHGModule } from '@/components/SHGModule';
import { MemberModule } from '@/components/MemberModule';
import { SavingsModule } from '@/components/SavingsModule';
import { LoansModule } from '@/components/LoansModule';
import { MeetingsModule } from '@/components/MeetingsModule';
import { FieldVisitsModule } from '@/components/FieldVisitsModule';
import { LivelihoodModule } from '@/components/LivelihoodModule';
import { GovtSchemesModule } from '@/components/GovtSchemesModule';
import { TrainingModule } from '@/components/TrainingModule';
import { TasksModule } from '@/components/TasksModule';
import { DocumentsModule } from '@/components/DocumentsModule';
import { ReportsModule } from '@/components/ReportsModule';
import { AuditLogsModule } from '@/components/AuditLogsModule';
import { VoiceAssistantModal } from '@/components/VoiceAssistantModal';
import { QuickSavingsModal } from '@/components/QuickSavingsModal';
import { User } from '@/types';
import {
  HomeIcon,
  UsersIcon,
  PiggyBankIcon,
  BanknoteIcon,
  CalendarIcon,
  AwardIcon,
  FileTextIcon,
  ShieldCheckIcon,
  CameraIcon
} from '@/components/icons';

function MainApp() {
  const { currentUser, recordUserLogin, recordUserLogout, speakText } = useApp();
  const [authScreen, setAuthScreen] = useState<'LOGIN' | 'REGISTER' | 'DASHBOARD'>('LOGIN');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showQuickSavingsModal, setShowQuickSavingsModal] = useState<boolean>(false);

  const handleLoginSuccess = (user: User) => {
    recordUserLogin(user);
    setAuthScreen('DASHBOARD');
    setActiveTab('dashboard');
    speakText(`लॉगिन यशस्वी झाले. नमस्ते ${user.marathiName.split(' ')[0]}!`);
  };

  const handleRegisterSuccess = (user: User) => {
    recordUserLogin(user);
    setAuthScreen('DASHBOARD');
    setActiveTab('dashboard');
    speakText(`नोंदणी यशस्वी झाली. सखीसेतू मध्ये आपले स्वागत आहे!`);
  };

  const handleLogout = () => {
    recordUserLogout();
    setAuthScreen('LOGIN');
    setActiveTab('dashboard');
    speakText('आपण यशस्वीरित्या लॉगआउट झाला आहात.');
  };

  // 1. Login View (Strictly without role selection)
  if (authScreen === 'LOGIN') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={() => setAuthScreen('REGISTER')}
      />
    );
  }

  // 2. Separate Registration View
  if (authScreen === 'REGISTER') {
    return (
      <RegisterPage
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={() => setAuthScreen('LOGIN')}
      />
    );
  }

  // 3. Dynamic Navigation Items Tailored by Role
  const getNavItems = () => {
    if (currentUser.role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'प्रशासक नियंत्रण (Admin Hub)', icon: HomeIcon },
        { id: 'blockManagers', label: 'प्रखंड व्यवस्थापक (Block Managers)', icon: UsersIcon },
        { id: 'shgs', label: 'सर्व बचत गट (All SHGs)', icon: UsersIcon },
        { id: 'members', label: 'सर्व सभासद (All Members)', icon: UsersIcon },
        { id: 'reports', label: 'राज्य अहवाल (State Reports)', icon: FileTextIcon },
        { id: 'auditLogs', label: 'सुरक्षा व ऑडिट (Audit Logs)', icon: ShieldCheckIcon },
      ];
    }

    if (currentUser.role === 'BLOCK_MANAGER') {
      return [
        { id: 'dashboard', label: 'तालुका डॅशबोर्ड (Block Dashboard)', icon: HomeIcon },
        { id: 'crpPerformance', label: 'समूह सखी कामगिरी (CRP Supervision)', icon: UsersIcon },
        { id: 'shgs', label: 'तालुका बचत गट (Block SHGs)', icon: UsersIcon },
        { id: 'meetings', label: 'सभा व उपस्थिती (Meetings)', icon: CalendarIcon },
        { id: 'fieldVisits', label: 'क्षेत्रीय भेटी GPS (Field Visits)', icon: CameraIcon },
        { id: 'reports', label: 'तालुका अहवाल (Block Reports)', icon: FileTextIcon },
        { id: 'tasks', label: 'कार्ये व उद्दिष्टे (Tasks & Monitoring)', icon: CalendarIcon },
      ];
    }

    // Default CRP Navigation Items
    return [
      { id: 'dashboard', label: 'डॅशबोर्ड (Dashboard)', icon: HomeIcon },
      { id: 'shgs', label: 'माझे बचत गट (My SHGs)', icon: UsersIcon },
      { id: 'members', label: 'महिला सभासद (Members)', icon: UsersIcon },
      { id: 'savings', label: 'आजची बचत (Today\'s Savings)', icon: PiggyBankIcon },
      { id: 'loans', label: 'कर्ज व परतफेड (Loans & EMI)', icon: BanknoteIcon },
      { id: 'meetings', label: 'सभा व उपस्थिती (Meetings)', icon: CalendarIcon },
      { id: 'fieldVisits', label: 'क्षेत्रीय भेट GPS (Field Visits)', icon: CameraIcon },
      { id: 'livelihood', label: 'उपजीविका व लखपती (Livelihood)', icon: AwardIcon },
      { id: 'schemes', label: 'शासकीय योजना (Govt Schemes)', icon: AwardIcon },
      { id: 'training', label: 'प्रशिक्षण (Training)', icon: AwardIcon },
      { id: 'tasks', label: 'कार्ये व स्मरण (Tasks)', icon: CalendarIcon },
      { id: 'documents', label: 'कागदपत्रे (Documents)', icon: FileTextIcon },
      { id: 'reports', label: 'अहवाल व पासबुक (Reports)', icon: FileTextIcon },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-[#f8faf7] text-gray-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenVoiceAssistant={() => setShowVoiceModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-3xl p-3 border border-emerald-100 shadow-sm sticky top-28 space-y-1 max-h-[82vh] overflow-y-auto">
            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-900 border-b border-emerald-50 mb-1 flex items-center justify-between">
              <span>विभाग (Navigation)</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                {currentUser.role === 'CRP' ? 'समूह सखी' : currentUser.role === 'BLOCK_MANAGER' ? 'प्रखंड व्यवस्थापक' : 'प्रशासक'}
              </span>
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-left transition ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-md shadow-emerald-800/20'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Logout Button */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
              >
                <span>🚪</span>
                <span>लॉगआउट करा (Logout)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content View with Protected Role Boundaries */}
        <main className="flex-1 min-w-0">
          {/* 1. Dashboard Routing by Role */}
          {activeTab === 'dashboard' && (
            currentUser.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : currentUser.role === 'BLOCK_MANAGER' ? (
              <BlockManagerDashboard setActiveTab={setActiveTab} />
            ) : (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenQuickSavings={() => setShowQuickSavingsModal(true)}
                onOpenNewMeeting={() => setActiveTab('meetings')}
                onOpenNewMember={() => setActiveTab('members')}
                onOpenNewSHG={() => setActiveTab('shgs')}
              />
            )
          )}

          {/* Admin Specific Tabs */}
          {activeTab === 'blockManagers' && currentUser.role === 'ADMIN' && (
            <AdminDashboard />
          )}

          {/* Block Manager Specific Tabs */}
          {activeTab === 'crpPerformance' && currentUser.role === 'BLOCK_MANAGER' && (
            <BlockManagerDashboard setActiveTab={setActiveTab} />
          )}

          {/* Core Modules (Role-Filtered automatically in AppContext) */}
          {activeTab === 'shgs' && (
            <SHGModule
              onOpenNewMember={() => setActiveTab('members')}
              onOpenQuickSavings={() => setShowQuickSavingsModal(true)}
            />
          )}

          {activeTab === 'members' && (
            <MemberModule
              onOpenQuickSavings={() => setShowQuickSavingsModal(true)}
            />
          )}

          {activeTab === 'savings' && currentUser.role === 'CRP' && (
            <SavingsModule
              onOpenQuickSavings={() => setShowQuickSavingsModal(true)}
            />
          )}

          {activeTab === 'loans' && currentUser.role === 'CRP' && <LoansModule />}

          {activeTab === 'meetings' && <MeetingsModule />}

          {activeTab === 'fieldVisits' && <FieldVisitsModule />}

          {activeTab === 'livelihood' && currentUser.role === 'CRP' && <LivelihoodModule />}

          {activeTab === 'schemes' && currentUser.role === 'CRP' && <GovtSchemesModule />}

          {activeTab === 'training' && currentUser.role === 'CRP' && <TrainingModule />}

          {activeTab === 'tasks' && <TasksModule />}

          {activeTab === 'documents' && currentUser.role === 'CRP' && <DocumentsModule />}

          {activeTab === 'reports' && <ReportsModule />}

          {activeTab === 'auditLogs' && currentUser.role === 'ADMIN' && <AuditLogsModule />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Voice Assistant Modal */}
      {showVoiceModal && (
        <VoiceAssistantModal onClose={() => setShowVoiceModal(false)} />
      )}

      {/* Quick Savings Modal */}
      {showQuickSavingsModal && (
        <QuickSavingsModal onClose={() => setShowQuickSavingsModal(false)} />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
