'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  AwardIcon,
  PlusIcon,
  XIcon,
  VolumeUpIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { MemberSchemeApplication } from '@/types';

export const GovtSchemesModule: React.FC = () => {
  const { govtSchemes, schemeApplications, members, applyForScheme, deleteSchemeApplication, speakText } = useApp();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(govtSchemes[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || '');
  const [appToDelete, setAppToDelete] = useState<MemberSchemeApplication | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const scheme = govtSchemes.find(s => s.id === selectedSchemeId);
    const member = members.find(m => m.id === selectedMemberId);
    if (!scheme || !member) return;

    applyForScheme({
      schemeId: selectedSchemeId,
      schemeName: scheme.nameMarathi,
      memberId: selectedMemberId,
      memberName: member.marathiName.split('(')[0],
      shgName: member.shgName,
      appliedDate: new Date().toISOString().split('T')[0],
      benefitAmount: 25000
    });

    setShowApplyModal(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <AwardIcon className="w-6 h-6" />
            </span>
            शासकीय योजना व थेट लाभ (Government Schemes & Tracking)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            उमेद MSRLM, लखपती दीदी, विमा व शासकीय योजनांचे अर्ज आणि मंजुरी ट्रॅकिंग
          </p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>+ नवीन योजना अर्ज दाखल करा (Apply)</span>
        </button>
      </div>

      {/* Available Schemes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {govtSchemes.map(s => (
          <div key={s.id} className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {s.code}
              </span>
              <h3 className="font-black text-base text-gray-900 mt-2">{s.nameMarathi}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{s.department}</p>

              <div className="mt-3 bg-blue-50/70 p-3 rounded-2xl border border-blue-100 text-xs">
                <span className="font-bold text-blue-950 block">योजनेचा लाभ:</span>
                <span className="font-bold text-emerald-800">{s.maxBenefit}</span>
              </div>

              <div className="mt-3 text-xs text-gray-600">
                <span className="font-bold text-gray-800 block mb-1">प्रमुख फायदे:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-600">
                  {s.keyBenefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600">
                मंजूर: <span className="text-emerald-700 font-extrabold">{s.sanctionedCount} अर्ज</span>
              </span>
              <button
                onClick={() => speakText(`${s.nameMarathi}. ${s.maxBenefit}.`)}
                className="p-2 text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 rounded-xl"
                title="माहिती ऐका"
              >
                <VolumeUpIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Applied Applications Tracker Table */}
      <div className="bg-white rounded-3xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-gray-900">
            दाखल केलेले योजना अर्ज (Submitted Scheme Applications)
          </h3>
          <span className="text-xs text-gray-500 font-medium">{schemeApplications.length} अर्ज</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-blue-50 text-blue-950 font-bold border-b border-blue-100">
              <tr>
                <th className="p-3">अर्ज ट्रॅकिंग क्र.</th>
                <th className="p-3">महिला सभासद</th>
                <th className="p-3">योजनेचे नाव</th>
                <th className="p-3">अर्ज दिनांक</th>
                <th className="p-3">लाभ रक्कम (₹)</th>
                <th className="p-3">स्थिती</th>
                <th className="p-3 text-right">कृती</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schemeApplications.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold text-gray-900">{app.trackingNumber}</td>
                  <td className="p-3 font-bold text-gray-900">{app.memberName} ({app.shgName})</td>
                  <td className="p-3 text-gray-800">{app.schemeName.split('(')[0]}</td>
                  <td className="p-3 text-gray-500">{app.appliedDate}</td>
                  <td className="p-3 font-bold text-emerald-800">₹{app.benefitAmount}</td>
                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md text-[10px]">
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setAppToDelete(app)}
                      className="p-1.5 bg-gray-100 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition"
                      title="योजना अर्ज हटवा (Delete Application)"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-blue-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
              शासकीय योजना अर्ज नोंदणी (Scheme Application)
            </h3>

            <form onSubmit={handleApply} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">१. योजना निवडा *</label>
                <select
                  value={selectedSchemeId}
                  onChange={e => setSelectedSchemeId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  {govtSchemes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameMarathi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">२. महिला सभासद निवडा *</label>
                <select
                  value={selectedMemberId}
                  onChange={e => setSelectedMemberId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.marathiName} ({m.shgName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-extrabold shadow-md"
                >
                  अर्ज दाखल करा (Submit Application)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Scheme Application Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={appToDelete !== null}
        onClose={() => setAppToDelete(null)}
        onConfirm={() => {
          if (appToDelete) {
            deleteSchemeApplication(appToDelete.id);
            setAppToDelete(null);
          }
        }}
        title="योजना अर्ज हटवा (Delete Scheme Application)"
        itemName={`${appToDelete?.memberName || ''} - ${appToDelete?.schemeName || ''} (ट्रॅकिंग क्र. ${appToDelete?.trackingNumber || ''})`}
        itemType="योजना अर्ज"
        warningMessage="हा शासकीय योजना अर्ज सिस्टीममधून काढून टाकला जाईल."
      />
    </div>
  );
};
