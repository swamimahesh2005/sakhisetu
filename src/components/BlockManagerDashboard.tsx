import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, downloadCSV } from '@/lib/export-helpers';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { CRPPerformanceSummary } from '@/types';
import {
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  SearchIcon,
  DownloadIcon,
  PrinterIcon,
  ShieldCheckIcon,
  VolumeUpIcon,
  SparklesIcon,
  TrashIcon,
  EyeIcon
} from './icons';

interface BlockManagerDashboardProps {
  setActiveTab?: (tab: string) => void;
}

export const BlockManagerDashboard: React.FC<BlockManagerDashboardProps> = ({ setActiveTab }) => {
  const {
    currentUser,
    getCRPPerformanceSummaries,
    filteredSHGs,
    filteredMembers,
    filteredMeetings,
    filteredTasks,
    addCRP,
    updateCRP,
    toggleCRPStatus,
    resetCRPPassword,
    deleteCRP,
    speakText
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillageFilter, setSelectedVillageFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedReportType, setSelectedReportType] = useState<'CRP_PERFORMANCE' | 'SHG_PROGRESS' | 'MEETINGS' | 'FIELD_VISITS' | 'PENDING_TASKS'>('CRP_PERFORMANCE');
  const [reportPeriod, setReportPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');

  // Modal States for CRP Management
  const [showAddCRPModal, setShowAddCRPModal] = useState(false);
  const [showViewCRPModal, setShowViewCRPModal] = useState(false);
  const [showEditCRPModal, setShowEditCRPModal] = useState(false);
  const [selectedCRP, setSelectedCRP] = useState<CRPPerformanceSummary | null>(null);
  const [deletingCRP, setDeletingCRP] = useState<CRPPerformanceSummary | null>(null);
  const [showResetSuccess, setShowResetSuccess] = useState<string | null>(null);

  // Form State for Adding CRP
  const [addFormData, setAddFormData] = useState({
    name: '',
    marathiName: '',
    mobile: '',
    email: '',
    username: '',
    password: '',
    villageName: 'अतनूर',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // Form State for Editing CRP
  const [editFormData, setEditFormData] = useState({
    name: '',
    marathiName: '',
    mobile: '',
    email: '',
    villageName: ''
  });

  // Compute live CRP performance summaries for this Block (Strict Access Control)
  const crpSummaries = getCRPPerformanceSummaries(currentUser.blockId || 'jalkot');

  // Filtered CRP table list (strictly within assigned CRPs)
  const filteredCRPs = crpSummaries.filter(crp => {
    const matchSearch =
      crp.crpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crp.crpMarathiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crp.crpId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crp.mobile.includes(searchQuery);

    const matchVillage = selectedVillageFilter === 'ALL' || crp.villageName.includes(selectedVillageFilter);
    const matchStatus =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'ACTIVE' && (crp.status === 'ACTIVE' || crp.status === 'RECENTLY_ACTIVE')) ||
      (selectedStatusFilter === 'INACTIVE' && crp.status === 'INACTIVE');

    return matchSearch && matchVillage && matchStatus;
  });

  // Block Level Metrics
  const totalCRPs = crpSummaries.length;
  const activeCRPs = crpSummaries.filter(c => c.status === 'ACTIVE' || c.status === 'RECENTLY_ACTIVE').length;
  const loggedInCRPs = crpSummaries.filter(c => c.isCurrentlyLoggedIn).length;
  const totalBlockSHGs = filteredSHGs.length;
  const totalBlockMembers = filteredMembers.length;
  const totalBlockSavings = filteredSHGs.reduce((acc, s) => acc + s.totalSavings, 0);
  const totalBlockLoanDisbursed = filteredSHGs.reduce((acc, s) => acc + s.cclSanctionedLimit, 0);
  const totalCompletedTasks = filteredTasks.filter(t => t.completed).length;
  const totalPendingTasks = filteredTasks.filter(t => !t.completed).length;

  const handleAddCRPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.marathiName || !addFormData.mobile) {
      alert('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    await addCRP({
      name: addFormData.name,
      marathiName: addFormData.marathiName,
      mobile: addFormData.mobile,
      email: addFormData.email || `${addFormData.mobile}@sakhisetu.gov.in`,
      username: addFormData.username,
      password: addFormData.password || 'Crp@12345',
      villageName: addFormData.villageName,
      status: addFormData.status
    });

    setShowAddCRPModal(false);
    setAddFormData({
      name: '',
      marathiName: '',
      mobile: '',
      email: '',
      username: '',
      password: '',
      villageName: 'अतनूर',
      status: 'ACTIVE'
    });
  };

  const handleViewCRPClick = (crp: CRPPerformanceSummary) => {
    setSelectedCRP(crp);
    setShowViewCRPModal(true);
  };

  const handleEditCRPClick = (crp: CRPPerformanceSummary) => {
    setSelectedCRP(crp);
    setEditFormData({
      name: crp.crpName,
      marathiName: crp.crpMarathiName,
      mobile: crp.mobile,
      email: crp.email || '',
      villageName: crp.villageName
    });
    setShowEditCRPModal(true);
  };

  const handleEditCRPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCRP || !selectedCRP.userId) return;

    updateCRP(selectedCRP.userId, {
      name: editFormData.name,
      marathiName: editFormData.marathiName,
      mobile: editFormData.mobile,
      email: editFormData.email
    });

    setShowEditCRPModal(false);
    setSelectedCRP(null);
  };

  const handleResetCRPPassword = async (userId: string, name: string) => {
    if (confirm(`तुम्हाला ${name} यांचा पासवर्ड 'Crp@12345' वर रीसेट करायचा आहे का?`)) {
      await resetCRPPassword(userId, 'Crp@12345');
      setShowResetSuccess(name);
      setTimeout(() => setShowResetSuccess(null), 4000);
    }
  };

  // Export reports to CSV
  const handleExportCSV = () => {
    if (selectedReportType === 'CRP_PERFORMANCE') {
      const headers = ['CRP आयडी', 'CRP नाव', 'मोबाईल', 'कार्यक्षेत्र गाव', 'बचत गट संख्या', 'एकूण सदस्य', 'पूर्ण कामे', 'प्रलंबित कामे', 'भेटी', 'सभा', 'सक्रियता'];
      const rows = crpSummaries.map(c => [
        c.crpId,
        c.crpName,
        c.mobile,
        c.villageName,
        c.assignedSHGsCount,
        c.totalMembersCount,
        c.tasksCompleted,
        c.tasksPending,
        c.fieldVisitsCompleted,
        c.meetingsCompleted,
        c.isCurrentlyLoggedIn ? 'ऑनलाइन लॉगिन' : c.status
      ]);
      downloadCSV(`CRP_Performance_Report_${currentUser.blockId || 'block'}.csv`, headers, rows);
    } else if (selectedReportType === 'SHG_PROGRESS') {
      const headers = ['बचत गट कोड', 'बचत गट नाव', 'गाव', 'श्रेणी', 'एकूण सदस्य', 'एकूण बचत (₹)', 'बँक CCL मर्यादा (₹)', 'स्थिती'];
      const rows = filteredSHGs.map(s => [
        s.code,
        s.name,
        s.villageName,
        s.grade,
        s.totalMembersCount,
        s.totalSavings,
        s.cclSanctionedLimit,
        s.status
      ]);
      downloadCSV(`SHG_Progress_Report_${currentUser.blockId || 'block'}.csv`, headers, rows);
    } else {
      const headers = ['सभा/भेट आयडी', 'तारीख', 'ठिकाण', 'उपस्थिती/उद्देश', 'नोंद'];
      const rows = filteredMeetings.map(m => [
        m.id,
        m.meetingDate,
        m.venue,
        `${m.totalAttendance} सदस्य`,
        m.status
      ]);
      downloadCSV(`Block_Meetings_Report_${currentUser.blockId || 'block'}.csv`, headers, rows);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner with Block Manager Context & Audio */}
      <div className="bg-gradient-to-br from-teal-900 via-emerald-800 to-teal-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-200 mb-2 border border-white/10">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>प्रखंड व्यवस्थापक डॅशबोर्ड (Block Manager Dashboard)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser.marathiName}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl font-medium leading-relaxed">
              📍 <strong>{currentUser.blockName || 'जळकोट तालुका'}</strong> अंतर्गत {totalCRPs} समूह सखी, {totalBlockSHGs} बचत गट आणि {totalBlockMembers} महिला सभासदांच्या प्रगतीचे थेट पर्यवेक्षण व संनियंत्रण.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                speakText(
                  `नमस्ते ${currentUser.marathiName.split(' ')[0]} सर. आपल्या कार्यक्षेत्रात एकूण ${totalCRPs} समूह सखी कार्यरत असून सध्या ${loggedInCRPs} सखी ऑनलाइन लॉगिन आहेत. आपल्या कार्यक्षेत्रात एकूण ${totalBlockSHGs} बचत गट कार्यरत आहेत.`
                )
              }
              className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-2xl font-bold text-xs backdrop-blur-md flex items-center gap-2 transition border border-white/20 shadow-sm"
            >
              <VolumeUpIcon className="w-4 h-4 text-amber-300" />
              <span>आढावा ऐका (Listen Summary)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Alert Popup Notification */}
      {showResetSuccess && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-between animate-in fade-in">
          <span>✓ {showResetSuccess} यांचा पासवर्ड यशस्वीरीत्या <strong>Crp@12345</strong> वर रीसेट करण्यात आला आहे.</span>
          <button onClick={() => setShowResetSuccess(null)} className="text-white hover:text-emerald-100 font-black">✕</button>
        </div>
      )}

      {/* Data Privacy & Strict Access Control Notice */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-2xl flex items-start gap-3 text-xs text-emerald-900 shadow-sm">
        <ShieldCheckIcon className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-black text-emerald-950">कडक अधिकार नियंत्रण सक्रिय (Strict Block Manager ➔ CRP Access Control Active):</span>
          <p className="text-[11px] text-emerald-800">
            आपल्याला केवळ आपल्या कार्यक्षेत्रात नियुक्त केलेल्या समूह सखींची माहिती, प्रगती अहवाल आणि पर्यवेक्षण करण्याचे अधिकार आहेत. इतर ब्लॉक व्यवस्थापकांचा डेटा पूर्णपणे गोपनीय व सुरक्षित आहे.
          </p>
        </div>
      </div>

      {/* 4 Primary Required Cards for Block Manager */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setActiveTab?.('crpPerformance')}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-emerald-900">नियुक्त समूह सखी (Assigned CRPs)</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">{totalCRPs}</span>
            <span className="text-xs text-emerald-700 font-bold">कार्यक्षेत्रातील</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500 font-medium">१००% थेट संनियंत्रण</div>
        </div>

        {/* Card 2: Currently Logged-in CRPs */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-teal-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-teal-900">सध्या लॉगिन असलेले CRP (Online)</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <SparklesIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-teal-900">{loggedInCRPs}</span>
            <span className="text-xs text-emerald-600 font-black animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              सक्रिय सत्र (Live)
            </span>
          </div>
          <div className="mt-1 text-[11px] text-teal-700 font-bold">रिअल-टाइम ऑनलाइन सखी</div>
        </div>

        {/* Card 3: Active CRPs */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-blue-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-blue-900">सक्रिय CRP (Active CRPs)</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <CalendarIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-950">{activeCRPs}</span>
            <span className="text-xs text-blue-700 font-bold">मासिक कार्यरत</span>
          </div>
          <div className="mt-1 text-[11px] text-blue-800 font-medium">नियमित कामे व सभा पूर्ण</div>
        </div>

        {/* Card 4: Inactive CRPs */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-black uppercase text-rose-900">निष्क्रिय CRP (Inactive CRPs)</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <UsersIcon className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-950">{Math.max(0, totalCRPs - activeCRPs)}</span>
            <span className="text-xs text-rose-600 font-bold">फॉलो-अप आवश्यक</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-700 font-medium">गेल्या १५ दिवसात गैरहजर</div>
        </div>
      </div>

      {/* Secondary Block Scale Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 text-xs">
          <span className="text-gray-500 block text-[10px] font-bold uppercase">तालुका बचत गट (SHGs)</span>
          <span className="font-black text-emerald-950 text-base">{totalBlockSHGs} गट</span>
          <span className="text-[10px] text-emerald-800 block mt-0.5">एकूण {totalBlockMembers} महिला</span>
        </div>

        <div className="bg-purple-50/70 p-3 rounded-2xl border border-purple-200 text-xs">
          <span className="text-gray-500 block text-[10px] font-bold uppercase">एकूण बचत निधी (Savings)</span>
          <span className="font-black text-purple-950 text-base">{formatINR(totalBlockSavings)}</span>
          <span className="text-[10px] text-purple-800 block mt-0.5">मासिक संकलन</span>
        </div>

        <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-xs">
          <span className="text-gray-500 block text-[10px] font-bold uppercase">बँक CCL लिंकेज मर्यादा</span>
          <span className="font-black text-amber-950 text-base">{formatINR(totalBlockLoanDisbursed)}</span>
          <span className="text-[10px] text-amber-800 block mt-0.5">मंजूर क्रेडिट लिमिट</span>
        </div>

        <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-200 text-xs">
          <span className="text-gray-500 block text-[10px] font-bold uppercase">कार्ये प्रगती (Tasks)</span>
          <span className="font-black text-blue-950 text-base">{totalCompletedTasks} पूर्ण / {totalPendingTasks} बाकी</span>
          <span className="text-[10px] text-blue-800 block mt-0.5">८८% वेळेवर पूर्तता</span>
        </div>
      </div>

      {/* Section A: CRP Performance & Supervision Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header & Search/Filters */}
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-5 bg-emerald-600 rounded-full"></span>
                तालुका समूह सखी संनियंत्रण यादी (All Assigned CRPs Information)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                नेमून दिलेल्या सर्व समूह सखींचे नाव, लॉगिन आयडी, गाव, ऑनलाइन स्थिती, कामाचा आढावा आणि बचत गट
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition border border-emerald-200"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Excel अहवाल</span>
              </button>

              <button
                onClick={() => setShowAddCRPModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow transition"
              >
                <span>+ नवीन समूह सखी जोडा (Add CRP)</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="CRP नाव, लॉगिन आयडी किंवा गाव शोधा..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Village Filter */}
            <div>
              <select
                value={selectedVillageFilter}
                onChange={e => setSelectedVillageFilter(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="ALL">सर्व गावे (All Villages)</option>
                <option value="अतनूर">अतनूर (Atnur)</option>
                <option value="खेड शिवापूर">खेड शिवापूर (Khed Shivapur)</option>
                <option value="कोंढणपूर">कोंढणपूर (Kondhanpur)</option>
                <option value="कल्याण">कल्याण (Kalyan)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              >
                <option value="ALL">सर्व स्थिती (All Status)</option>
                <option value="ACTIVE">🟢 सक्रिय / ऑनलाइन लॉगिन (Active)</option>
                <option value="INACTIVE">⚪ निष्क्रिय (Inactive)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table with Full CRP Actions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 text-gray-600 font-black border-b border-gray-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">समूह सखीचे नाव (CRP Name)</th>
                <th className="py-3.5 px-3">लॉगिन आयडी (CRP Login ID)</th>
                <th className="py-3.5 px-3">गाव (Village Name)</th>
                <th className="py-3.5 px-3 text-center">नेमून दिलेले गट</th>
                <th className="py-3.5 px-3 text-center">पूर्ण कामे</th>
                <th className="py-3.5 px-3 text-center">बाकी कामे</th>
                <th className="py-3.5 px-3">शेवटचा लॉगिन</th>
                <th className="py-3.5 px-3 text-center">स्थिती (Status)</th>
                <th className="py-3.5 px-4 text-center">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredCRPs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500 font-bold">
                    आपल्या कार्यक्षेत्रात कोणतीही समूह सखी आढळली नाही. (+ नवीन समूह सखी जोडा बटण वापरा)
                  </td>
                </tr>
              ) : (
                filteredCRPs.map((crp, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-sm">
                          👩🏽‍💼
                        </div>
                        <div>
                          <div className="font-black text-gray-900 text-xs">{crp.crpMarathiName}</div>
                          <div className="text-[10px] text-gray-500">📱 {crp.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-900 text-[11px] border border-gray-200">
                        {crp.crpId}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-800 font-bold">{crp.villageName}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-black text-emerald-900 text-sm bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                        {crp.assignedSHGsCount} गट
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">({crp.totalMembersCount} महिला)</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-900 px-2.5 py-1 rounded-lg font-black text-xs">
                        <span>✓</span>
                        <span>{crp.tasksCompleted + crp.fieldVisitsCompleted + crp.meetingsCompleted} पूर्ण</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {crp.tasksCompleted} कामे | {crp.meetingsCompleted} सभा | {crp.fieldVisitsCompleted} भेटी
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded-lg font-black text-xs inline-block ${crp.tasksPending > 0 ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-gray-100 text-gray-600'}`}>
                        {crp.tasksPending} बाकी
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-[11px]">
                      <div className="font-bold">{crp.lastLogin}</div>
                      <div className="text-[10px] text-gray-400">{crp.lastActivity}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => crp.userId && toggleCRPStatus(crp.userId)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                          crp.isCurrentlyLoggedIn
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm animate-pulse'
                            : crp.status === 'ACTIVE' || crp.status === 'RECENTLY_ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="स्थिती बदलण्यासाठी क्लिक करा"
                      >
                        {crp.isCurrentlyLoggedIn ? '🟢 ऑनलाइन' : crp.status === 'ACTIVE' || crp.status === 'RECENTLY_ACTIVE' ? '🟢 सक्रिय' : '⚪ निष्क्रिय'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => handleViewCRPClick(crp)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          title="तपशील पहा"
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-slate-600" />
                          <span>पहा</span>
                        </button>
                        <button
                          onClick={() => handleEditCRPClick(crp)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition"
                          title="माहिती संपादन"
                        >
                          संपादित
                        </button>
                        <button
                          onClick={() => crp.userId && handleResetCRPPassword(crp.userId, crp.crpMarathiName)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition"
                          title="पासवर्ड Crp@12345 वर रीसेट करा"
                        >
                          🔑 रीसेट
                        </button>
                        <button
                          onClick={() => setDeletingCRP(crp)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          title="समूह सखी हटवा"
                        >
                          <TrashIcon className="w-3.5 h-3.5 text-rose-600" />
                          <span>हटवा</span>
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

      {/* View CRP Details Modal */}
      {showViewCRPModal && selectedCRP && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-200 animate-in fade-in">
            <button
              onClick={() => {
                setShowViewCRPModal(false);
                setSelectedCRP(null);
              }}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-xl font-bold">
                👩🏽‍💼
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{selectedCRP.crpMarathiName}</h3>
                <span className="text-xs text-gray-500">{selectedCRP.crpName} ({selectedCRP.crpId})</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">मोबाईल नंबर</span>
                  <span className="font-bold text-gray-900 text-sm">📱 {selectedCRP.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">ईमेल</span>
                  <span className="font-bold text-gray-900">✉️ {selectedCRP.email || 'उपलब्ध नाही'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">जिल्हा व तालुका</span>
                  <span className="font-bold text-gray-900">{currentUser.districtName} - {currentUser.blockName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">कार्यक्षेत्र गाव</span>
                  <span className="font-bold text-emerald-900 font-black">{selectedCRP.villageName}</span>
                </div>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 block font-bold">बचत गट</span>
                    <span className="font-black text-emerald-950 text-sm">{selectedCRP.assignedSHGsCount} गट</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 block font-bold">महिला सदस्य</span>
                    <span className="font-black text-purple-950 text-sm">{selectedCRP.totalMembersCount}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-gray-500 block font-bold">पूर्ण कामे</span>
                    <span className="font-black text-blue-950 text-sm">{selectedCRP.tasksCompleted}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl text-gray-600">
                <span>शेवटचा लॉगिन: <strong>{selectedCRP.lastLogin}</strong></span>
                <span>स्थिती: <strong className={selectedCRP.status === 'ACTIVE' || selectedCRP.isCurrentlyLoggedIn ? 'text-emerald-700' : 'text-gray-600'}>{selectedCRP.isCurrentlyLoggedIn ? '🟢 ऑनलाइन' : selectedCRP.status === 'ACTIVE' ? '🟢 सक्रिय' : '⚪ निष्क्रिय'}</strong></span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowViewCRPModal(false);
                  handleEditCRPClick(selectedCRP);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition"
              >
                संपादित करा (Edit)
              </button>
              <button
                onClick={() => {
                  setShowViewCRPModal(false);
                  setSelectedCRP(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CRP Modal */}
      {showAddCRPModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddCRPModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2.5">
              नवीन समूह सखी नोंदणी (Add New CRP)
            </h3>

            <form onSubmit={handleAddCRPSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">मराठी नाव (Marathi Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. नागीण संग्राम मठदेवरू"
                  value={addFormData.marathiName}
                  onChange={e => setAddFormData({ ...addFormData, marathiName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">इंग्रजी नाव (English Full Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Nagin Mathdevaru"
                  value={addFormData.name}
                  onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="8806594798"
                    value={addFormData.mobile}
                    onChange={e => setAddFormData({ ...addFormData, mobile: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ईमेल</label>
                  <input
                    type="email"
                    placeholder="crp@sakhisetu.gov.in"
                    value={addFormData.email}
                    onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">लॉगिन युझरनेम (CRP ID)</label>
                  <input
                    type="text"
                    placeholder="उदा. crp005"
                    value={addFormData.username}
                    onChange={e => setAddFormData({ ...addFormData, username: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">लॉगिन पासवर्ड</label>
                  <input
                    type="text"
                    placeholder="डिफॉल्ट: Crp@12345"
                    value={addFormData.password}
                    onChange={e => setAddFormData({ ...addFormData, password: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">जिल्हा (Auto Assigned)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.districtName || 'लातूर जिल्हा (Latur)'}
                    className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">तालुका (Auto Assigned)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.blockName || 'जळकोट (लातूर)'}
                    className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">कार्यक्षेत्र गाव / वस्ती (Village / Area) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. अतनूर गाव कार्यक्षेत्र"
                  value={addFormData.villageName}
                  onChange={e => setAddFormData({ ...addFormData, villageName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-[11px] font-bold space-y-0.5">
                <div>🔒 <strong>सुरक्षा नियम:</strong> ही समूह सखी थेट आपल्याकडे (<strong>{currentUser.marathiName}</strong>) नियुक्त केली जाईल.</div>
                <div>🔑 पासवर्ड आपोआप सुरक्षित Salted SHA-256 मध्ये जतन होईल.</div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-sm shadow transition mt-2"
              >
                समूह सखी जतन करा (Save CRP)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit CRP Modal */}
      {showEditCRPModal && selectedCRP && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 animate-in fade-in">
            <button
              onClick={() => setShowEditCRPModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2.5">
              समूह सखी माहिती संपादन (Edit CRP Details)
            </h3>

            <form onSubmit={handleEditCRPSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">मराठी नाव</label>
                <input
                  type="text"
                  required
                  value={editFormData.marathiName}
                  onChange={e => setEditFormData({ ...editFormData, marathiName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">इंग्रजी नाव</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">मोबाईल नंबर</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={editFormData.mobile}
                  onChange={e => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ईमेल</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-black text-sm shadow transition mt-2"
              >
                बदल जतन करा (Save Changes)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete CRP Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingCRP}
        onClose={() => setDeletingCRP(null)}
        onConfirm={() => {
          if (deletingCRP && deletingCRP.userId) {
            deleteCRP(deletingCRP.userId);
            setDeletingCRP(null);
          }
        }}
        title="समूह सखी हटवा (Delete CRP)"
        itemName={deletingCRP ? `${deletingCRP.crpMarathiName} (${deletingCRP.villageName})` : ''}
        itemType="समूह सखी नोंद"
        warningMessage="या समूह सखीचे सर्व लॉगिन अधिकार तात्काळ समाप्त केले जातील."
      />

      {/* Section B: Reports Generation & Multi-format Export */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-orange-100 text-orange-700">
                <FileTextIcon className="w-5 h-5" />
              </span>
              तालुका अहवाल व सांख्यिकी केंद्र (Block Reports & Statistics)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              प्रगती अहवाल तयार करा, फिल्टर करा आणि PDF किंवा Excel स्वरूपात डाउनलोड करा
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <DownloadIcon className="w-4 h-4 text-emerald-700" />
              <span>Excel / CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow transition"
            >
              <PrinterIcon className="w-4 h-4" />
              <span>PDF अहवाल प्रिंट</span>
            </button>
          </div>
        </div>

        {/* Report Type Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSelectedReportType('CRP_PERFORMANCE')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReportType === 'CRP_PERFORMANCE'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            १. समूह सखी कामगिरी अहवाल (CRP Performance)
          </button>
          <button
            onClick={() => setSelectedReportType('SHG_PROGRESS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReportType === 'SHG_PROGRESS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            २. बचत गट प्रगती अहवाल (SHG Progress)
          </button>
          <button
            onClick={() => setSelectedReportType('MEETINGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReportType === 'MEETINGS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ३. मासिक सभा व ठराव अहवाल (Meetings)
          </button>
          <button
            onClick={() => setSelectedReportType('FIELD_VISITS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReportType === 'FIELD_VISITS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ४. क्षेत्रीय भेट अहवाल (Field Visits)
          </button>
          <button
            onClick={() => setSelectedReportType('PENDING_TASKS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              selectedReportType === 'PENDING_TASKS'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            ५. प्रलंबित कामे अहवाल (Pending Tasks)
          </button>
        </div>

        {/* Report Preview Box */}
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-black text-gray-900">
              📊 अहवाल पूर्वावलोकन: {selectedReportType === 'CRP_PERFORMANCE' ? 'समूह सखी कामगिरी' : selectedReportType === 'SHG_PROGRESS' ? 'बचत गट प्रगती' : 'तालुका मासिक आढावा'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-bold">कालावधी:</span>
              <select
                value={reportPeriod}
                onChange={e => setReportPeriod(e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
                className="py-1 px-2.5 bg-white border border-gray-300 rounded-lg text-xs font-bold"
              >
                <option value="DAILY">दैनिक (Daily)</option>
                <option value="WEEKLY">साप्ताहिक (Weekly)</option>
                <option value="MONTHLY">मासिक (Monthly)</option>
              </select>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-2">
            <div className="flex justify-between font-bold border-b border-gray-100 pb-2">
              <span>तालुका: <strong>{currentUser.blockName || 'जळकोट (लातूर)'}</strong></span>
              <span>तयार दिनांक: <strong>{new Date().toLocaleDateString('mr-IN')}</strong></span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <span className="text-[10px] text-gray-500 block">एकूण सखी</span>
                <span className="font-black text-emerald-900 text-sm">{totalCRPs}</span>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <span className="text-[10px] text-gray-500 block">सक्रिय गट</span>
                <span className="font-black text-blue-900 text-sm">{totalBlockSHGs}</span>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <span className="text-[10px] text-gray-500 block">एकूण बचत</span>
                <span className="font-black text-purple-900 text-sm">{formatINR(totalBlockSavings)}</span>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <span className="text-[10px] text-gray-500 block">कर्ज वाटप</span>
                <span className="font-black text-amber-900 text-sm">{formatINR(totalBlockLoanDisbursed)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
