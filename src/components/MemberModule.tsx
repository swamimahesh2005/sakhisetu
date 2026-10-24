'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Member, Designation, Education, CasteCategory, MaritalStatus } from '@/types';
import { formatINR } from '@/lib/export-helpers';
import {
  UsersIcon,
  PlusIcon,
  SearchIcon,
  VolumeUpIcon,
  XIcon,
  PrinterIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface MemberModuleProps {
  onOpenQuickSavings: () => void;
}

export const MemberModule: React.FC<MemberModuleProps> = ({ onOpenQuickSavings }) => {
  const { members, shgs, addMember, deleteMember, deleteFamilyMember, speakText, globalSearch, setGlobalSearch } = useApp();

  const [filterSHG, setFilterSHG] = useState<string>('ALL');
  const [filterLakhpati, setFilterLakhpati] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMemberDetail, setActiveMemberDetail] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [familyMemberToDelete, setFamilyMemberToDelete] = useState<{ memberId: string; index: number; name: string } | null>(null);

  // Form states for creating new member
  const [name, setName] = useState('');
  const [shgId, setShgId] = useState(shgs[0]?.id || 'shg_savitribai');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState(32);
  const [dob, setDob] = useState('1992-05-15');
  const [designation, setDesignation] = useState<Designation>('सदस्य (Member)');
  const [education, setEducation] = useState<Education>('माध्यमिक (Secondary)');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('विवाहित (Married)');
  const [casteCategory, setCasteCategory] = useState<CasteCategory>('इतर मागासवर्गीय (OBC)');
  const [address, setAddress] = useState('खेड शिवापूर, ता. हवेली');
  const [husbandOrFatherName, setHusbandOrFatherName] = useState('');
  const [familyMembersCount, setFamilyMembersCount] = useState(4);
  const [annualFamilyIncome, setAnnualFamilyIncome] = useState(132000);
  const [isBPL, setIsBPL] = useState(false);
  const [primaryOccupation, setPrimaryOccupation] = useState('शेळीपालन व शेती (Goat & Farming)');
  const [monthlyIncome, setMonthlyIncome] = useState(12000);
  const [landHoldingAcres, setLandHoldingAcres] = useState(1);
  const [livestockCount, setLivestockCount] = useState(4);
  const [bankName, setBankName] = useState('बँक ऑफ महाराष्ट्र');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('MAHB0000452');
  const [branchName, setBranchName] = useState('खेड शिवापूर');

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.marathiName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.mobile.includes(globalSearch) ||
      m.primaryOccupation.toLowerCase().includes(globalSearch.toLowerCase()) ||
      m.shgName.toLowerCase().includes(globalSearch.toLowerCase());

    const matchesSHG = filterSHG === 'ALL' || m.shgId === filterSHG;
    const matchesLakhpati =
      filterLakhpati === 'ALL' ||
      (filterLakhpati === 'ACHIEVED' && m.lakhpatiDidiStatus === 'साध्य (Achieved)') ||
      (filterLakhpati === 'IN_PROGRESS' && m.lakhpatiDidiStatus !== 'साध्य (Achieved)');

    return matchesSearch && matchesSHG && matchesLakhpati;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('कृपया महिलेचे नाव टाका');
      return;
    }

    const targetSHG = shgs.find(s => s.id === shgId);
    const maskedAadhar = `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`;

    addMember({
      shgId,
      shgName: targetSHG ? targetSHG.marathiName : 'सावित्रीबाई फुले महिला बचत गट',
      name,
      marathiName: `${name} (${designation.split(' ')[0]})`,
      mobile: mobile || '98' + Math.floor(10000000 + Math.random() * 90000000),
      age: Number(age),
      dob,
      aadharMasked: maskedAadhar,
      designation,
      education,
      maritalStatus,
      casteCategory,
      address,
      villageId: targetSHG ? targetSHG.villageId : 'vlg_khed_shivapur',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      husbandOrFatherName,
      familyMembersCount: Number(familyMembersCount),
      annualFamilyIncome: Number(annualFamilyIncome),
      isBPL,
      primaryOccupation,
      monthlyIncome: Number(monthlyIncome),
      landHoldingAcres: Number(landHoldingAcres),
      livestockCount: Number(livestockCount),
      bankName,
      accountNo: accountNo || '60' + Math.floor(100000000 + Math.random() * 900000000),
      ifscCode,
      branchName,
      lakhpatiDidiStatus: monthlyIncome >= 8500 ? 'साध्य (Achieved)' : 'प्रगतीपथावर (In-Progress)',
      status: 'सक्रिय (Active)'
    });

    setShowCreateModal(false);
    setName('');
    setMobile('');
    setHusbandOrFatherName('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
              <UsersIcon className="w-6 h-6" />
            </span>
            महिला सभासद व कुटुंब माहिती (Members & Family Profiles)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            महिला सभासदांची वैयक्तिक माहिती, कुटुंब, उपजीविका व्यवसाय, बँक खाते व लखपती दीदी स्थिती
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickSavings}
            className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 transition"
            title="त्वरित बचत नोंदवा"
          >
            <span>💰</span>
            <span>बचत नोंदवा</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>+ नवीन महिला नोंदणी (Add Member)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-gray-600 mb-1">शोध (Search):</label>
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="नाव, मोबाईल किंवा व्यवसाय शोधा..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-600 mb-1">बचत गट निवडा (Filter by SHG):</label>
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

        <div>
          <label className="block font-bold text-gray-600 mb-1">लखपती दीदी स्थिती (Lakhpati Status):</label>
          <select
            value={filterLakhpati}
            onChange={e => setFilterLakhpati(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व स्थिती (All Status)</option>
            <option value="ACHIEVED">साध्य (Achieved - ₹१ लाख+ वार्षिक)</option>
            <option value="IN_PROGRESS">प्रगतीपथावर (In-Progress)</option>
          </select>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-3xl text-center text-gray-400 border border-dashed border-gray-300">
            कोणतीही महिला सभासद आढळली नाही.
          </div>
        ) : (
          filteredMembers.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-emerald-50 flex-shrink-0 border-2 border-emerald-200 shadow-inner">
                    <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {m.designation.split(' ')[0]}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          m.lakhpatiDidiStatus === 'साध्य (Achieved)'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {m.lakhpatiDidiStatus === 'साध्य (Achieved)' ? '🌟 लखपती दीदी' : 'प्रगतीपथावर'}
                      </span>
                    </div>

                    <h3 className="font-black text-base text-gray-900 mt-1 truncate">{m.marathiName.split('(')[0]}</h3>
                    <p className="text-xs text-gray-500 truncate">{m.shgName}</p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">जमा बचत</span>
                    <span className="font-black text-emerald-950 text-sm">{formatINR(m.totalSaved)}</span>
                  </div>
                  <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                    <span className="text-purple-700 text-[10px] block font-bold">सक्रिय कर्ज</span>
                    <span className="font-black text-purple-950 text-sm">{formatINR(m.activeLoanAmount)}</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
                  <div className="flex justify-between">
                    <span className="text-gray-500">व्यवसाय:</span>
                    <span className="font-bold text-gray-800 truncate max-w-[170px]">{m.primaryOccupation.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">मोबाईल:</span>
                    <span className="font-mono font-bold text-gray-800">{m.mobile}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">आधार:</span>
                    <span className="font-mono font-bold text-gray-800">{m.aadharMasked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">मासिक उत्पन्न:</span>
                    <span className="font-bold text-emerald-700">₹{m.monthlyIncome} / महिना</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() =>
                    speakText(
                      `${m.marathiName.split('(')[0]}. बचत गट: ${m.shgName}. जमा बचत: ${m.totalSaved} रुपये. सक्रिय कर्ज: ${m.activeLoanAmount} रुपये.`
                    )
                  }
                  className="p-2 text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 rounded-xl"
                  title="माहिती ऐका"
                >
                  <VolumeUpIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveMemberDetail(m)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition text-center"
                >
                  संपूर्ण प्रोफाईल (Profile)
                </button>

                <button
                  onClick={onOpenQuickSavings}
                  className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 py-2 px-3 rounded-xl font-black text-xs transition"
                >
                  बचत नोंद
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMemberToDelete(m);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 bg-gray-100 rounded-xl transition"
                  title="सदस्य नोंद हटवा (Delete Member)"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Full Detail Modal */}
      {activeMemberDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setActiveMemberDetail(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-emerald-50 border-2 border-emerald-300 flex-shrink-0">
                <img src={activeMemberDetail.photoUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {activeMemberDetail.designation}
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">{activeMemberDetail.marathiName}</h3>
                <p className="text-xs text-gray-500">
                  बचत गट: <strong className="text-emerald-800">{activeMemberDetail.shgName}</strong>
                </p>
              </div>
            </div>

            {/* Profile Sections */}
            <div className="mt-4 space-y-4">
              {/* Personal & Family Info */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-black text-sm text-gray-900">१. वैयक्तिक व कौटुंबिक माहिती (Family Details)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block">पती / वडिलांचे नाव:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.husbandOrFatherName || 'रमेश जाधव'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">वय व जन्मतारीख:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.age} वर्षे ({activeMemberDetail.dob})</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">शिक्षण:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.education}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">प्रवर्ग / जात:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.casteCategory}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">कुटुंब सदस्य संख्या:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.familyMembersCount} व्यक्ती</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">वार्षिक कुटुंब उत्पन्न:</span>
                    <span className="font-black text-emerald-800">{formatINR(activeMemberDetail.annualFamilyIncome)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block">पत्ता:</span>
                    <span className="font-medium text-gray-900">{activeMemberDetail.address}</span>
                  </div>
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-bold block mb-1.5">कुटुंबातील सदस्यांची यादी (Family Members):</span>
                  {(!activeMemberDetail.familyMembers || activeMemberDetail.familyMembers.length === 0) ? (
                    <div className="text-gray-400 italic text-[11px]">कुटुंब सदस्यांची नोंद उपलब्ध नाही.</div>
                  ) : (
                    <div className="space-y-1.5">
                      {activeMemberDetail.familyMembers.map((fm, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-200 text-xs">
                          <div>
                            <span className="font-bold text-gray-900">{fm.marathiName}</span>
                            <span className="text-gray-500 ml-2">({fm.relationship}, {fm.age} वर्षे, {fm.occupation})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFamilyMemberToDelete({
                                memberId: activeMemberDetail.id,
                                index: idx,
                                name: fm.marathiName
                              });
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="कुटुंब सदस्य हटवा"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Occupation & Livelihood */}
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
                <h4 className="font-black text-sm text-amber-950">२. उपजीविका व व्यवसाय तपशील (Occupation / Livelihood)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block">मुख्य व्यवसाय:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.primaryOccupation}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">मासिक उत्पन्न:</span>
                    <span className="font-black text-emerald-800">{formatINR(activeMemberDetail.monthlyIncome)} / महिना</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">शेतजमीन धारणा:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.landHoldingAcres} एकर</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">पशुधन संख्या (शेळी/गाय):</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.livestockCount} जनावरे</span>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <h4 className="font-black text-sm text-emerald-950">३. बँक खाते माहिती (Bank Details)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block">बँकेचे नाव:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.bankName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">शाखा:</span>
                    <span className="font-bold text-gray-900">{activeMemberDetail.branchName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">खाते क्रमांक:</span>
                    <span className="font-mono font-bold text-gray-900">{activeMemberDetail.accountNo}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">IFSC कोड:</span>
                    <span className="font-mono font-bold text-gray-900">{activeMemberDetail.ifscCode}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const target = activeMemberDetail;
                  setActiveMemberDetail(null);
                  setMemberToDelete(target);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition"
                title="सदस्य नोंद कायमची हटवा"
              >
                <TrashIcon className="w-4 h-4 text-red-600" />
                <span>सदस्य नोंद हटवा (Delete Member)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>प्रोफाईल प्रिंट (Print)</span>
                </button>
                <button
                  onClick={() => setActiveMemberDetail(null)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-black"
                >
                  बंद करा (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Member Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन महिला सभासद नोंदणी (Add Member)
            </h3>

            <form onSubmit={handleCreateMember} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">महिलेचे पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. आनंदी रमेश जाधव"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">बचत गट निवडा *</label>
                  <select
                    value={shgId}
                    onChange={e => setShgId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    {shgs.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.marathiName} ({s.villageName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">मोबाईल क्रमांक *</label>
                  <input
                    type="tel"
                    required
                    placeholder="९८२२xxxxxx"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">वय (Age)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">पद (Designation)</label>
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value as Designation)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  >
                    <option value="सदस्य (Member)">सदस्य (Member)</option>
                    <option value="अध्यक्षा (President)">अध्यक्षा (President)</option>
                    <option value="सचिव (Secretary)">सचिव (Secretary)</option>
                    <option value="खजिनदार (Treasurer)">खजिनदार (Treasurer)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">पती / वडिलांचे नाव</label>
                  <input
                    type="text"
                    placeholder="उदा. रमेश पांडुरंग जाधव"
                    value={husbandOrFatherName}
                    onChange={e => setHusbandOrFatherName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">शिक्षण (Education)</label>
                  <select
                    value={education}
                    onChange={e => setEducation(e.target.value as Education)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    <option value="प्राथमिक (Primary)">प्राथमिक (Primary)</option>
                    <option value="माध्यमिक (Secondary)">माध्यमिक (Secondary)</option>
                    <option value="उच्च माध्यमिक (Higher Sec)">उच्च माध्यमिक (Higher Sec)</option>
                    <option value="पदवीधर (Graduate)">पदवीधर (Graduate)</option>
                    <option value="निरक्षर (Illiterate)">निरक्षर (Illiterate)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">मुख्य व्यवसाय / उपजीविका</label>
                  <input
                    type="text"
                    value={primaryOccupation}
                    onChange={e => setPrimaryOccupation(e.target.value)}
                    placeholder="उदा. शेळीपालन, शिवणकाम, शेती"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">मासिक उत्पन्न (₹)</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={e => setMonthlyIncome(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">जन्म तारीख (DOB)</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">वैवाहिक स्थिती</label>
                  <select
                    value={maritalStatus}
                    onChange={e => setMaritalStatus(e.target.value as MaritalStatus)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium"
                  >
                    <option value="विवाहित (Married)">विवाहित (Married)</option>
                    <option value="विधवा (Widow)">विधवा (Widow)</option>
                    <option value="परित्यक्ता (Divorced/Deserted)">परित्यक्ता</option>
                    <option value="अविवाहित (Unmarried)">अविवाहित (Unmarried)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">सामाजिक प्रवर्ग (Caste)</label>
                  <select
                    value={casteCategory}
                    onChange={e => setCasteCategory(e.target.value as CasteCategory)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium"
                  >
                    <option value="इतर मागासवर्गीय (OBC)">इतर मागासवर्गीय (OBC)</option>
                    <option value="अनुसूचित जाती (SC)">अनुसूचित जाती (SC)</option>
                    <option value="अनुसूचित जमाती (ST)">अनुसूचित जमाती (ST)</option>
                    <option value="खुला प्रवर्ग (General)">खुला प्रवर्ग (General)</option>
                    <option value="अल्पसंख्याक (Minority)">अल्पसंख्याक (Minority)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">रहिवासी पत्ता (Address)</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">कुटुंब सदस्य संख्या</label>
                  <input
                    type="number"
                    value={familyMembersCount}
                    onChange={e => setFamilyMembersCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">वार्षिक कौटुंबिक उत्पन्न (₹)</label>
                  <input
                    type="number"
                    value={annualFamilyIncome}
                    onChange={e => setAnnualFamilyIncome(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-emerald-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bplCheck"
                    checked={isBPL}
                    onChange={e => setIsBPL(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="bplCheck" className="text-xs font-bold text-gray-800 cursor-pointer">दारिद्र्यरेषेखालील (BPL)</label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">शेतजमीन (एकर)</label>
                  <input
                    type="number"
                    value={landHoldingAcres}
                    onChange={e => setLandHoldingAcres(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">पशुधन संख्या</label>
                  <input
                    type="number"
                    value={livestockCount}
                    onChange={e => setLivestockCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">बँकेचे नाव</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">शाखा नाव</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">खाते क्रमांक</label>
                  <input
                    type="text"
                    placeholder="उदा. 60199201948"
                    value={accountNo}
                    onChange={e => setAccountNo(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">IFSC कोड</label>
                  <input
                    type="text"
                    placeholder="MAHB0000452"
                    value={ifscCode}
                    onChange={e => setIfscCode(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl font-black shadow-md hover:from-emerald-700 hover:to-teal-800"
                >
                  नोंदणी जतन करा (Save Member)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={memberToDelete !== null}
        onClose={() => setMemberToDelete(null)}
        onConfirm={() => {
          if (memberToDelete) {
            deleteMember(memberToDelete.id);
            setMemberToDelete(null);
          }
        }}
        title="सदस्य नोंद कायमची हटवा (Delete Member)"
        itemName={memberToDelete?.marathiName || ''}
        itemType="महिला सदस्य"
        warningMessage="या सदस्याशी संबंधित बचत व कर्जाच्या नोंदी सिस्टीममधून काढून टाकल्या जातील व बचत गटातील सदस्य संख्या आपोआप कमी केली जाईल."
      />

      {/* Delete Family Member Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={familyMemberToDelete !== null}
        onClose={() => setFamilyMemberToDelete(null)}
        onConfirm={() => {
          if (familyMemberToDelete) {
            deleteFamilyMember(familyMemberToDelete.memberId, familyMemberToDelete.index);
            setFamilyMemberToDelete(null);
          }
        }}
        title="कुटुंब सदस्य हटवा (Delete Family Member)"
        itemName={familyMemberToDelete?.name || ''}
        itemType="कुटुंब सदस्य"
        warningMessage="या कुटुंब सदस्याची नोंद महिलेच्या कौटुंबिक प्रोफाईलमधून काढून टाकली जाईल."
      />
    </div>
  );
};
