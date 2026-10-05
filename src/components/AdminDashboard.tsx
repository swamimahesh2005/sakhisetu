'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, downloadCSV } from '@/lib/export-helpers';
import { BlockManagerProfile } from '@/types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  UsersIcon,
  PiggyBankIcon,
  ShieldCheckIcon,
  SearchIcon,
  DownloadIcon,
  SparklesIcon,
  VolumeUpIcon,
  MapPinIcon,
  TrashIcon,
  EyeIcon
} from './icons';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    districts,
    blocks,
    blockManagers,
    users,
    shgs,
    members,
    auditLogs,
    addBlockManager,
    updateBlockManager,
    toggleBlockManagerStatus,
    resetBlockManagerPassword,
    deleteBlockManager,
    speakText
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState<BlockManagerProfile | null>(null);
  const [deletingManager, setDeletingManager] = useState<BlockManagerProfile | null>(null);
  const [showResetSuccess, setShowResetSuccess] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    marathiName: '',
    mobile: '',
    email: '',
    username: '',
    password: '',
    districtId: 'dist_latur',
    districtName: 'लातूर जिल्हा (Latur)',
    blockId: 'jalkot',
    blockName: 'जळकोट (लातूर)',
    assignedArea: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE'
  });

  // Calculate System-Level Aggregates
  const totalDistricts = districts.length;
  const totalBlocks = blocks.length;
  const totalBlockManagers = blockManagers.length;
  const activeBlockManagers = blockManagers.filter(b => b.status === 'ACTIVE').length;
  const totalCRPs = users.filter(u => u.role === 'CRP').length;
  const totalSHGs = shgs.length;
  const totalMembers = members.length;
  const totalSystemSavings = shgs.reduce((acc, s) => acc + s.totalSavings, 0);

  // Filter Block Managers
  const filteredManagers = blockManagers.filter(bm => {
    const matchSearch =
      bm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.marathiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.managerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.mobile.includes(searchQuery) ||
      bm.blockName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDistrict = selectedDistrictFilter === 'ALL' || bm.districtId === selectedDistrictFilter;
    const matchStatus = selectedStatusFilter === 'ALL' || bm.status === selectedStatusFilter;

    return matchSearch && matchDistrict && matchStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.marathiName) {
      alert('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    await addBlockManager({
      name: formData.name,
      marathiName: formData.marathiName,
      mobile: formData.mobile,
      email: formData.email || `${formData.mobile}@sakhisetu.gov.in`,
      username: formData.username,
      password: formData.password || 'Block@12345',
      districtId: formData.districtId,
      districtName: formData.districtName,
      blockId: formData.blockId,
      blockName: formData.blockName,
      assignedArea: formData.assignedArea || `${formData.blockName} कार्यक्षेत्र`,
      status: formData.status
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      marathiName: '',
      mobile: '',
      email: '',
      username: '',
      password: '',
      districtId: 'dist_latur',
      districtName: 'लातूर जिल्हा (Latur)',
      blockId: 'jalkot',
      blockName: 'जळकोट (लातूर)',
      assignedArea: '',
      status: 'ACTIVE'
    });
  };

  const handleViewClick = (bm: BlockManagerProfile) => {
    setSelectedManager(bm);
    setShowViewModal(true);
  };

  const handleEditClick = (bm: BlockManagerProfile) => {
    setSelectedManager(bm);
    setFormData({
      name: bm.name,
      marathiName: bm.marathiName,
      mobile: bm.mobile,
      email: bm.email,
      username: '',
      password: '',
      districtId: bm.districtId,
      districtName: bm.districtName,
      blockId: bm.blockId,
      blockName: bm.blockName,
      assignedArea: bm.assignedArea,
      status: bm.status
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedManager) return;

    updateBlockManager(selectedManager.userId, {
      name: formData.name,
      marathiName: formData.marathiName,
      mobile: formData.mobile,
      email: formData.email,
      assignedArea: formData.assignedArea,
      districtId: formData.districtId,
      districtName: formData.districtName,
      blockId: formData.blockId,
      blockName: formData.blockName
    });

    setShowEditModal(false);
    setSelectedManager(null);
  };

  const handleResetPassword = async (userId: string, name: string) => {
    if (confirm(`तुम्हाला ${name} यांचा पासवर्ड 'Block@12345' वर रीसेट करायचा आहे का?`)) {
      await resetBlockManagerPassword(userId, 'Block@12345');
      setShowResetSuccess(name);
      setTimeout(() => setShowResetSuccess(null), 4000);
    }
  };

  const handleExportDirectory = () => {
    const headers = ['व्यवस्थापक आयडी', 'नाव', 'मराठी नाव', 'मोबाईल', 'ईमेल', 'जिल्हा', 'तालुका/ब्लॉक', 'कार्यक्षेत्र', 'CRP संख्या', 'बचत गट', 'स्थिती', 'शेवटचा लॉगिन'];
    const rows = blockManagers.map(bm => [
      bm.managerId,
      bm.name,
      bm.marathiName,
      bm.mobile,
      bm.email,
      bm.districtName,
      bm.blockName,
      bm.assignedArea,
      bm.assignedCrpCount,
      bm.assignedShgCount,
      bm.status,
      bm.lastLoginAt || 'उपलब्ध नाही'
    ]);
    downloadCSV(`Block_Managers_Directory.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner with State Level Greeting */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-200 mb-2 border border-white/10">
              <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
              <span>प्रशासकीय नियंत्रण कक्ष (State & District Admin Command Hub)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser.marathiName}
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl font-medium leading-relaxed">
              🏛️ महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (UMED) अंतर्गत सर्व जिल्हे, तालुके, प्रखंड व्यवस्थापक आणि समूह सखी नेटवर्कचे मध्यवर्ती व्यवस्थापन व नियंत्रण.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                speakText(
                  `नमस्ते ${currentUser.marathiName.split(' ')[0]} मॅडम. राज्य नियंत्रण कक्षामध्ये एकूण ${totalDistricts} जिल्हे, ${totalBlocks} तालुके आणि ${totalBlockManagers} प्रखंड व्यवस्थापक नोंदणीकृत आहेत. एकूण ${totalSHGs} बचत गट कार्यरत आहेत.`
                )
              }
              className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-2xl font-bold text-xs backdrop-blur-md flex items-center gap-2 transition border border-white/20 shadow-sm"
            >
              <VolumeUpIcon className="w-4 h-4 text-amber-300" />
              <span>प्रणाली आढावा ऐका (Listen)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Alert Popup Notification */}
      {showResetSuccess && (
        <div className="bg-emerald-500 text-white p-3.5 rounded-2xl font-bold text-xs shadow-lg flex items-center justify-between animate-in fade-in">
          <span>✓ {showResetSuccess} यांचा पासवर्ड यशस्वीरीत्या <strong>Block@12345</strong> वर रीसेट करण्यात आला आहे.</span>
          <button onClick={() => setShowResetSuccess(null)} className="text-white hover:text-emerald-100 font-black">✕</button>
        </div>
      )}

      {/* Admin 8 Key Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Districts */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">एकूण जिल्हे (Districts)</span>
          <div className="text-2xl font-black text-gray-900 mt-1">{totalDistricts}</div>
          <span className="text-[10px] text-emerald-700 font-bold">लातूर, पुणे, सोलापूर</span>
        </div>

        {/* Metric 2: Total Talukas/Blocks */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">तालुके / प्रखंड (Blocks)</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{totalBlocks}</div>
          <span className="text-[10px] text-emerald-700 font-bold">१००% सक्रिय कार्यक्षेत्र</span>
        </div>

        {/* Metric 3: Block Managers */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">प्रखंड व्यवस्थापक (BM)</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{totalBlockManagers}</div>
          <span className="text-[10px] text-blue-700 font-bold">({activeBlockManagers} सक्रिय)</span>
        </div>

        {/* Metric 4: Total CRPs */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">एकूण समूह सखी (CRPs)</span>
          <div className="text-2xl font-black text-purple-900 mt-1">{totalCRPs}</div>
          <span className="text-[10px] text-purple-700 font-bold">क्षेत्रीय कार्यदल</span>
        </div>

        {/* Metric 5: Total SHGs */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">एकूण बचत गट (SHGs)</span>
          <div className="text-2xl font-black text-amber-900 mt-1">{totalSHGs}</div>
          <span className="text-[10px] text-amber-700 font-bold">डिजिटल नोंदणीकृत</span>
        </div>

        {/* Metric 6: Total Members */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">महिला सभासद (Members)</span>
          <div className="text-2xl font-black text-teal-900 mt-1">{totalMembers}</div>
          <span className="text-[10px] text-teal-700 font-bold">लखपती दीदी अभियान</span>
        </div>

        {/* Metric 7: System Savings */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">एकूण बचत निधी (Savings)</span>
          <div className="text-xl font-black text-emerald-800 mt-1">{formatINR(totalSystemSavings)}</div>
          <span className="text-[10px] text-emerald-700 font-bold">पारदर्शक डिजिटल बँक खाती</span>
        </div>

        {/* Metric 8: System Health */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
          <span className="text-[11px] font-black uppercase text-gray-500 block">सुरक्षा व ऑडिट (System)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">१००% OK</div>
          <span className="text-[10px] text-gray-500 font-bold">२५६-बिट एन्क्रिप्टेड</span>
        </div>
      </div>

      {/* Admin -> District -> Block Hierarchy Visualization */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-sm sm:text-base font-black text-gray-900 mb-3 flex items-center gap-2">
          <MapPinIcon className="w-5 h-5 text-emerald-700" />
          <span>प्रशासकीय रचना व अधिकार स्तर (System Hierarchy Flow)</span>
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-800">
          <span className="bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-sm">
            🏛️ ADMIN (राज्य/जिल्हा नियंत्रण)
          </span>
          <span>➔</span>
          <span className="bg-blue-900 text-white px-3 py-1.5 rounded-xl shadow-sm">
            📍 DISTRICT (लातूर / पुणे / सोलापूर)
          </span>
          <span>➔</span>
          <span className="bg-emerald-800 text-white px-3 py-1.5 rounded-xl shadow-sm">
            🏢 BLOCK / TALUKA (जळकोट / हवेली / बारामती)
          </span>
          <span>➔</span>
          <span className="bg-teal-700 text-white px-3 py-1.5 rounded-xl shadow-sm">
            👨🏽‍💼 BLOCK MANAGER (तालुका व्यवस्थापक)
          </span>
          <span>➔</span>
          <span className="bg-purple-700 text-white px-3 py-1.5 rounded-xl shadow-sm">
            👩🏽‍💼 CRP (समूह सखी)
          </span>
          <span>➔</span>
          <span className="bg-amber-700 text-white px-3 py-1.5 rounded-xl shadow-sm">
            👥 SHG (बचत गट) & सभासद
          </span>
        </div>
      </div>

      {/* Block Manager Management Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-5 bg-blue-600 rounded-full"></span>
                प्रखंड व्यवस्थापक व्यवस्थापन (Block Manager Directory & Management)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                तालुका व्यवस्थापकांची नियुक्ती, अधिकार वाटप, पासवर्ड रीसेट आणि कार्यक्षेत्र संनियंत्रण
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportDirectory}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>CSV डिरेक्टरी</span>
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow transition"
              >
                <span>+ नवीन व्यवस्थापक जोडा (Add Manager)</span>
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="नाव, तालुका किंवा मोबाईल शोधा..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <select
                value={selectedDistrictFilter}
                onChange={e => setSelectedDistrictFilter(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">सर्व जिल्हे (All Districts)</option>
                <option value="dist_latur">लातूर जिल्हा (Latur)</option>
                <option value="dist_pune">पुणे जिल्हा (Pune)</option>
                <option value="dist_solapur">सोलापूर जिल्हा (Solapur)</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">सर्व स्थिती (All Status)</option>
                <option value="ACTIVE">🟢 सक्रिय (Active)</option>
                <option value="INACTIVE">⚪ निष्क्रिय (Inactive)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Block Managers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 text-gray-600 font-black border-b border-gray-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">व्यवस्थापक नाव (Name & ID)</th>
                <th className="py-3.5 px-3">संपर्क (Contact)</th>
                <th className="py-3.5 px-3">जिल्हा व तालुका (Block & District)</th>
                <th className="py-3.5 px-3">कार्यक्षेत्र (Assigned Area)</th>
                <th className="py-3.5 px-3 text-center">CRP संख्या</th>
                <th className="py-3.5 px-3 text-center">बचत गट</th>
                <th className="py-3.5 px-3 text-center">स्थिती (Status)</th>
                <th className="py-3.5 px-4 text-center">कृती (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredManagers.map((bm, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                        👨🏽‍💼
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-xs">{bm.marathiName}</div>
                        <div className="text-[10px] text-gray-500">{bm.name} ({bm.managerId})</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900">📱 {bm.mobile}</div>
                    <div className="text-[10px] text-gray-500">✉️ {bm.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-black text-emerald-900">{bm.blockName}</div>
                    <div className="text-[10px] text-gray-500">{bm.districtName}</div>
                  </td>
                  <td className="py-3 px-3 text-gray-700 text-[11px] max-w-xs">{bm.assignedArea}</td>
                  <td className="py-3 px-3 text-center font-black text-purple-900">{bm.assignedCrpCount}</td>
                  <td className="py-3 px-3 text-center font-black text-teal-900">{bm.assignedShgCount}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleBlockManagerStatus(bm.userId)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black transition cursor-pointer ${
                        bm.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="स्थिती बदलण्यासाठी क्लिक करा"
                    >
                      {bm.status === 'ACTIVE' ? '🟢 सक्रिय' : '⚪ निष्क्रिय'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleViewClick(bm)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="तपशील पहा"
                      >
                        <EyeIcon className="w-3.5 h-3.5 text-slate-600" />
                        <span>पहा</span>
                      </button>
                      <button
                        onClick={() => handleEditClick(bm)}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-bold transition"
                        title="माहिती संपादित करा"
                      >
                        संपादित
                      </button>
                      <button
                        onClick={() => handleResetPassword(bm.userId, bm.marathiName)}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition"
                        title="पासवर्ड Block@12345 वर रीसेट करा"
                      >
                        🔑 रीसेट
                      </button>
                      <button
                        onClick={() => setDeletingManager(bm)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="व्यवस्थापक हटवा"
                      >
                        <TrashIcon className="w-3.5 h-3.5 text-rose-600" />
                        <span>हटवा</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Block Manager Details Modal */}
      {showViewModal && selectedManager && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-200 animate-in fade-in">
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedManager(null);
              }}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center text-xl font-bold">
                👨🏽‍💼
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{selectedManager.marathiName}</h3>
                <span className="text-xs text-gray-500">{selectedManager.name} ({selectedManager.managerId})</span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">मोबाईल नंबर</span>
                  <span className="font-bold text-gray-900 text-sm">📱 {selectedManager.mobile}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">ईमेल</span>
                  <span className="font-bold text-gray-900">✉️ {selectedManager.email}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">जिल्हा (District)</span>
                  <span className="font-bold text-gray-900">{selectedManager.districtName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">तालुका / ब्लॉक</span>
                  <span className="font-bold text-emerald-900 font-black">{selectedManager.blockName}</span>
                </div>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100 space-y-2">
                <div>
                  <span className="text-emerald-800 block text-[10px] uppercase font-bold">नेमून दिलेले कार्यक्षेत्र</span>
                  <span className="font-bold text-emerald-950">{selectedManager.assignedArea}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-200/60">
                  <div>
                    <span className="text-emerald-800 text-[10px] block font-bold">नेमून दिलेले CRP:</span>
                    <span className="font-black text-purple-900 text-sm">{selectedManager.assignedCrpCount} समूह सखी</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-[10px] block font-bold">संलग्न बचत गट:</span>
                    <span className="font-black text-teal-900 text-sm">{selectedManager.assignedShgCount} बचत गट</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl text-gray-600">
                <span>नोंदणी दिनांक: <strong>{selectedManager.createdAt}</strong></span>
                <span>स्थिती: <strong className={selectedManager.status === 'ACTIVE' ? 'text-emerald-700' : 'text-gray-600'}>{selectedManager.status === 'ACTIVE' ? '🟢 सक्रिय' : '⚪ निष्क्रिय'}</strong></span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedManager);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition"
              >
                संपादित करा (Edit)
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedManager(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Block Manager Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2.5">
              नवीन प्रखंड व्यवस्थापक नोंदणी (Add Block Manager)
            </h3>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">मराठी नाव (Marathi Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. स्वामी महेश संग्राम"
                  value={formData.marathiName}
                  onChange={e => setFormData({ ...formData, marathiName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">इंग्रजी नाव (English Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Swami Mahesh"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                    placeholder="9881123456"
                    value={formData.mobile}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ईमेल</label>
                  <input
                    type="email"
                    placeholder="bm@sakhisetu.gov.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">लॉगिन युझरनेम (Username)</label>
                  <input
                    type="text"
                    placeholder="उदा. blockmanager002"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">लॉगिन पासवर्ड (Password)</label>
                  <input
                    type="text"
                    placeholder="डिफॉल्ट: Block@12345"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">जिल्हा (District)</label>
                  <select
                    value={formData.districtId}
                    onChange={e => {
                      const dist = districts.find(d => d.id === e.target.value);
                      setFormData({
                        ...formData,
                        districtId: e.target.value,
                        districtName: dist?.marathiName || 'लातूर जिल्हा'
                      });
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  >
                    <option value="dist_latur">लातूर जिल्हा (Latur)</option>
                    <option value="dist_pune">पुणे जिल्हा (Pune)</option>
                    <option value="dist_solapur">सोलापूर जिल्हा (Solapur)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">तालुका / ब्लॉक</label>
                  <input
                    type="text"
                    required
                    value={formData.blockName}
                    onChange={e => setFormData({ ...formData, blockName: e.target.value, blockId: e.target.value.toLowerCase().slice(0, 6) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">नेमून दिलेले कार्यक्षेत्र (Assigned Area)</label>
                <input
                  type="text"
                  placeholder="उदा. जळकोट तालुका संपूर्ण १८ गावे"
                  value={formData.assignedArea}
                  onChange={e => setFormData({ ...formData, assignedArea: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-[11px] font-bold">
                🔒 पासवर्ड आपोआप सुरक्षित (SHA-256 salted hash) स्वरूपात जतन केला जाईल.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-sm shadow transition mt-2"
              >
                व्यवस्थापक जतन करा (Save Block Manager)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Block Manager Modal */}
      {showEditModal && selectedManager && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-200 animate-in fade-in">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2.5">
              प्रखंड व्यवस्थापक माहिती संपादन (Edit Block Manager)
            </h3>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">मराठी नाव</label>
                <input
                  type="text"
                  required
                  value={formData.marathiName}
                  onChange={e => setFormData({ ...formData, marathiName: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">मोबाईल नंबर</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ईमेल</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">कार्यक्षेत्र</label>
                <input
                  type="text"
                  value={formData.assignedArea}
                  onChange={e => setFormData({ ...formData, assignedArea: e.target.value })}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingManager}
        onClose={() => setDeletingManager(null)}
        onConfirm={() => {
          if (deletingManager) {
            deleteBlockManager(deletingManager.userId);
            setDeletingManager(null);
          }
        }}
        title="प्रखंड व्यवस्थापक हटवा (Delete Block Manager)"
        itemName={deletingManager ? `${deletingManager.marathiName} (${deletingManager.blockName})` : ''}
        itemType="प्रखंड व्यवस्थापक नोंद"
        warningMessage="या व्यवस्थापकाचे सर्व लॉगिन अधिकार तात्काळ समाप्त केले जातील."
      />
    </div>
  );
};
