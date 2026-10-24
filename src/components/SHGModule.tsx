'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SHG } from '@/types';
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

interface SHGModuleProps {
  onOpenNewMember: () => void;
  onOpenQuickSavings: () => void;
}

export const SHGModule: React.FC<SHGModuleProps> = ({ onOpenNewMember, onOpenQuickSavings }) => {
  const { shgs, members, villages, addSHG, deleteSHG, speakText, globalSearch, setGlobalSearch } = useApp();

  const [filterVillage, setFilterVillage] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeSHGDetail, setActiveSHGDetail] = useState<SHG | null>(null);
  const [shgToDelete, setShgToDelete] = useState<SHG | null>(null);

  // Form State for creating new SHG
  const [newName, setNewName] = useState('');
  const [newVillageId, setNewVillageId] = useState(villages[0]?.id || 'vlg_khed_shivapur');
  const [newFormationDate, setNewFormationDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMeetingDay, setNewMeetingDay] = useState('प्रत्येक महिन्याची १० तारीख');
  const [newMeetingFrequency, setNewMeetingFrequency] = useState<'मासिक (Monthly)' | 'पाक्षिक (Fortnightly)' | 'साप्ताहिक (Weekly)'>('मासिक (Monthly)');
  const [newBankName, setNewBankName] = useState('बँक ऑफ महाराष्ट्र (Bank of Maharashtra)');
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newIfsc, setNewIfsc] = useState('MAHB0000452');
  const [newBranch, setNewBranch] = useState('खेड शिवापूर शाखा');
  const [newCclLimit, setNewCclLimit] = useState(300000);
  const [newCompulsorySaving, setNewCompulsorySaving] = useState(200);
  const [newVoName, setNewVoName] = useState('जिजाऊ ग्रामसंघ (VO)');

  // Filter SHGs
  const filteredSHGs = shgs.filter(shg => {
    const matchesSearch =
      shg.marathiName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      shg.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      shg.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
      shg.villageName.toLowerCase().includes(globalSearch.toLowerCase());

    const matchesVillage = filterVillage === 'ALL' || shg.villageId === filterVillage;
    const matchesGrade = filterGrade === 'ALL' || shg.grade === filterGrade;

    return matchesSearch && matchesVillage && matchesGrade;
  });

  const handleCreateSHG = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('कृपया बचत गटाचे नाव टाका');
      return;
    }

    const selectedVillage = villages.find(v => v.id === newVillageId);

    addSHG({
      name: newName,
      marathiName: newName,
      villageId: newVillageId,
      villageName: selectedVillage ? selectedVillage.marathiName : 'खेड शिवापूर',
      blockId: selectedVillage ? selectedVillage.blockId : 'blk_haveli',
      formationDate: newFormationDate,
      meetingDay: newMeetingDay,
      meetingFrequency: newMeetingFrequency,
      crpId: 'usr_crp_1',
      crpName: 'सुमित्रा संभाजी पवार',
      voClfName: newVoName,
      grade: 'A',
      bankName: newBankName,
      bankAccountNo: newAccountNo || '60' + Math.floor(100000000 + Math.random() * 900000000),
      bankIfsc: newIfsc,
      bankBranch: newBranch,
      cclSanctionedLimit: Number(newCclLimit),
      cclOutstandingBalance: 0,
      monthlyCompulsorySavingPerMember: Number(newCompulsorySaving),
      status: 'सक्रिय (Active)'
    });

    setShowCreateModal(false);
    setNewName('');
    setNewAccountNo('');
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
            माझे बचत गट (My Self-Help Groups)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            नोंदणीकृत महिला स्वयंसहाय्यता बचत गट, बँक लिंकेज, ग्रेडिंग व तपशील
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>+ नवीन बचत गट नोंदणी (Create SHG)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-3xl border border-emerald-100 shadow-sm text-xs">
        <div>
          <label className="block font-bold text-gray-600 mb-1">शोध (Search):</label>
          <div className="relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="गटाचे नाव किंवा कोड शोधा..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-600 mb-1">गाव निवडा (Filter by Village):</label>
          <select
            value={filterVillage}
            onChange={e => setFilterVillage(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व गावे (All Villages)</option>
            {villages.map(v => (
              <option key={v.id} value={v.id}>
                {v.marathiName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-600 mb-1">ग्रेडिंग (Filter by Grade):</label>
          <select
            value={filterGrade}
            onChange={e => setFilterGrade(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व ग्रेड्स (All Grades A/B/C)</option>
            <option value="A">Grade A (उत्कृष्ट)</option>
            <option value="B">Grade B (मध्यम)</option>
            <option value="C">Grade C (सुधारणा हवी)</option>
          </select>
        </div>
      </div>

      {/* SHG Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSHGs.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-3xl text-center text-gray-400 border border-dashed border-gray-300">
            कोणताही बचत गट आढळला नाही.
          </div>
        ) : (
          filteredSHGs.map(shg => {
            const shgMembers = members.filter(m => m.shgId === shg.id);
            return (
              <div
                key={shg.id}
                className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {shg.code}
                      </span>
                      <h3 className="font-black text-base text-gray-900 mt-1.5">{shg.marathiName}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📍 {shg.villageName} • {shg.voClfName}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <span
                        className={`w-9 h-9 rounded-2xl font-black text-sm flex items-center justify-center border shadow-sm ${
                          shg.grade === 'A'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : shg.grade === 'B'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {shg.grade}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 mt-0.5">ग्रेड</span>
                    </div>
                  </div>

                  {/* Quick Numbers */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="bg-gray-50 p-2.5 rounded-2xl">
                      <span className="text-gray-500 text-[10px] block font-bold">महिला सदस्य</span>
                      <span className="text-gray-900 font-black text-sm">{shgMembers.length || shg.totalMembersCount || 10} महिला</span>
                    </div>
                    <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                      <span className="text-emerald-700 text-[10px] block font-bold">एकूण बचत</span>
                      <span className="text-emerald-950 font-black text-sm">{formatINR(shg.totalSavings)}</span>
                    </div>
                  </div>

                  {/* Bank & Meeting */}
                  <div className="mt-3 space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
                    <div className="flex justify-between">
                      <span className="text-gray-500">बँक:</span>
                      <span className="font-bold text-gray-800">{shg.bankName.split('(')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">खाते क्र.:</span>
                      <span className="font-mono font-bold text-gray-800">{shg.bankAccountNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">मासिक बचत:</span>
                      <span className="font-bold text-emerald-700">₹{shg.monthlyCompulsorySavingPerMember} / सदस्य</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">सभा दिवस:</span>
                      <span className="font-bold text-gray-800">{shg.meetingDay}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      speakText(`${shg.marathiName}. एकूण सदस्य ${shgMembers.length || 10}. एकूण बचत ${shg.totalSavings} रुपये.`);
                    }}
                    className="p-2 text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 rounded-xl"
                    title="माहिती ऐका"
                  >
                    <VolumeUpIcon className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveSHGDetail(shg)}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition text-center"
                  >
                    गट तपशील व सदस्य
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
                      setShgToDelete(shg);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 bg-gray-100 rounded-xl transition"
                    title="बचत गट हटवा (Delete SHG)"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SHG Detail Modal */}
      {activeSHGDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setActiveSHGDetail(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl">
                {activeSHGDetail.grade}
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {activeSHGDetail.code}
                </span>
                <h3 className="text-xl font-black text-gray-900">{activeSHGDetail.marathiName}</h3>
                <p className="text-xs text-gray-500">
                  📍 {activeSHGDetail.villageName} | स्थापना: {activeSHGDetail.formationDate}
                </p>
              </div>
            </div>

            {/* Bank Linkage */}
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-500 font-bold block">बँक व शाखा</span>
                <span className="font-black text-gray-900 text-sm">{activeSHGDetail.bankName}</span>
                <span className="text-gray-500 block">शाखा: {activeSHGDetail.bankBranch}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">बँक खाते क्रमांक</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{activeSHGDetail.bankAccountNo}</span>
                <span className="text-gray-500 block">IFSC: {activeSHGDetail.bankIfsc}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">मंजूर CCL बँक कर्ज</span>
                <span className="font-black text-amber-900 text-sm">{formatINR(activeSHGDetail.cclSanctionedLimit)}</span>
                <span className="text-emerald-700 font-bold block">शिल्लक: {formatINR(activeSHGDetail.cclOutstandingBalance)}</span>
              </div>
            </div>

            {/* Members in SHG */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-black text-sm text-gray-900">
                  या गटातील महिला सदस्य (Members in this SHG)
                </h4>
                <button
                  onClick={() => {
                    setActiveSHGDetail(null);
                    onOpenNewMember();
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>नवीन सदस्य जोडा</span>
                </button>
              </div>

              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden">
                {members.filter(m => m.shgId === activeSHGDetail.id).map(m => (
                  <div key={m.id} className="p-3 bg-white hover:bg-gray-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 text-sm">{m.marathiName}</div>
                        <div className="text-gray-500">
                          पद: <span className="font-bold text-emerald-700">{m.designation}</span> | मो.: {m.mobile}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-emerald-800">बचत: {formatINR(m.totalSaved)}</div>
                      <div className="text-purple-700 font-semibold">कर्ज: {formatINR(m.activeLoanAmount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const target = activeSHGDetail;
                  setActiveSHGDetail(null);
                  setShgToDelete(target);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition"
                title="बचत गट कायमचा हटवा"
              >
                <TrashIcon className="w-4 h-4 text-red-600" />
                <span>बचत गट हटवा (Delete SHG)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>गट नोंदवही प्रिंट</span>
                </button>
                <button
                  onClick={() => setActiveSHGDetail(null)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl text-xs font-black"
                >
                  बंद करा (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New SHG Modal */}
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
              नवीन महिला स्वयंसहाय्यता बचत गट नोंदणी (Create SHG)
            </h3>

            <form onSubmit={handleCreateSHG} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-black text-gray-800 mb-1">
                  बचत गटाचे नाव (SHG Name in Marathi) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राजमाता अहिल्याबाई होळकर महिला बचत गट"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">गाव (Village) *</label>
                  <select
                    value={newVillageId}
                    onChange={e => setNewVillageId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.marathiName} ({v.gramPanchayat})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">स्थापना दिनांक (Formation Date) *</label>
                  <input
                    type="date"
                    value={newFormationDate}
                    onChange={e => setNewFormationDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-gray-800 mb-1">मासिक सभा दिवस (Meeting Day) *</label>
                  <input
                    type="text"
                    value={newMeetingDay}
                    onChange={e => setNewMeetingDay(e.target.value)}
                    placeholder="उदा. प्रत्येक महिन्याची १० तारीख"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-gray-800 mb-1">मासिक अनिवार्य बचत दर (₹) *</label>
                  <input
                    type="number"
                    value={newCompulsorySaving}
                    onChange={e => setNewCompulsorySaving(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-emerald-800"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-black text-sm text-gray-800 mb-2">बँक खाते व लिंकेज तपशील (Bank Linkage)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-gray-800 mb-1">बँकेचे नाव (Bank Name)</label>
                    <input
                      type="text"
                      value={newBankName}
                      onChange={e => setNewBankName(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-800 mb-1">बँक खाते क्रमांक (Account No)</label>
                    <input
                      type="text"
                      placeholder="उदा. 60198425112"
                      value={newAccountNo}
                      onChange={e => setNewAccountNo(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block font-black text-gray-800 mb-1">IFSC कोड</label>
                    <input
                      type="text"
                      value={newIfsc}
                      onChange={e => setNewIfsc(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-800 mb-1">शाखा नाव (Branch)</label>
                    <input
                      type="text"
                      value={newBranch}
                      onChange={e => setNewBranch(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-black text-gray-800 mb-1">मंजूर CCL कर्ज (₹)</label>
                    <input
                      type="number"
                      value={newCclLimit}
                      onChange={e => setNewCclLimit(Number(e.target.value))}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-amber-900 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block font-black text-gray-800 mb-1">सभा वारंवारता (Frequency)</label>
                    <select
                      value={newMeetingFrequency}
                      onChange={e => setNewMeetingFrequency(e.target.value as 'मासिक (Monthly)' | 'पाक्षिक (Fortnightly)' | 'साप्ताहिक (Weekly)')}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold"
                    >
                      <option value="मासिक (Monthly)">मासिक (Monthly)</option>
                      <option value="पाक्षिक (Fortnightly)">पाक्षिक (Fortnightly)</option>
                      <option value="साप्ताहिक (Weekly)">साप्ताहिक (Weekly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-black text-gray-800 mb-1">ग्रामसंघ नाव (VO/CLF Name)</label>
                    <input
                      type="text"
                      value={newVoName}
                      onChange={e => setNewVoName(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs"
                    />
                  </div>
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
                  नोंदणी जतन करा (Save SHG)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={shgToDelete !== null}
        onClose={() => setShgToDelete(null)}
        onConfirm={() => {
          if (shgToDelete) {
            deleteSHG(shgToDelete.id);
            setShgToDelete(null);
          }
        }}
        title="बचत गट कायमचा हटवा (Delete SHG)"
        itemName={shgToDelete?.marathiName || ''}
        itemType="बचत गट"
        warningMessage="या बचत गटाशी संबंधित सर्व महिला सदस्य, मासिक बचत, कर्ज नोंदी व दस्तऐवज सुरक्षितपणे सिस्टीममधून काढून टाकले जातील."
      />
    </div>
  );
};
