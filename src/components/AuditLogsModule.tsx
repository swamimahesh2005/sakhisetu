'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheckIcon, VolumeUpIcon } from './icons';

export const AuditLogsModule: React.FC = () => {
  const { auditLogs, speakText } = useApp();

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gray-100 text-gray-800">
              <ShieldCheckIcon className="w-6 h-6" />
            </span>
            सुरक्षा व ऑडिट ट्रेल (Security Audit Logs & Compliance)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            प्रणालीतील प्रत्येक आर्थिक व्यवहार, बदल, युझर लॉगिन, IP पत्ता आणि सुरक्षितता नोंदी
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          १००% सुरक्षित एन्क्रिप्टेड ऑडिट ट्रेल
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-extrabold text-base text-gray-900">
            सिस्टम क्रियाकलाप नोंदी (Activity History)
          </h3>
          <span className="text-xs text-gray-500 font-medium">{auditLogs.length} नोंदी</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-800 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3">वेळ (Timestamp)</th>
                <th className="p-3">क्रिया (Action)</th>
                <th className="p-3">युझर व भूमिका</th>
                <th className="p-3">तपशील (Activity Details)</th>
                <th className="p-3">IP पत्ता</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3">
                    <span className="bg-orange-50 text-orange-900 font-bold px-2 py-0.5 rounded-md text-[11px] border border-orange-200">
                      {log.actionMarathi}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-gray-900 whitespace-nowrap">
                    {log.performedBy} <span className="text-gray-400 text-[10px]">({log.role})</span>
                  </td>
                  <td className="p-3 text-gray-700 font-medium">{log.details}</td>
                  <td className="p-3 font-mono text-gray-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
