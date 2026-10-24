'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Meeting, AttendanceRecord } from '@/types';
import { formatINR } from '@/lib/export-helpers';
import { startSpeechRecognition } from '@/lib/voice-assistant';
import {
  CalendarIcon,
  PlusIcon,
  CheckCircleIcon,
  XIcon,
  MicIcon,
  VolumeUpIcon,
  PrinterIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const MeetingsModule: React.FC = () => {
  const { meetings, shgs, members, addMeeting, deleteMeeting, deleteAttendance, speakText } = useApp();

  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [activeMeetingDetail, setActiveMeetingDetail] = useState<Meeting | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [attendanceToDelete, setAttendanceToDelete] = useState<{ meetingId: string; memberId: string; memberName: string } | null>(null);

  // New Meeting Form
  const [selectedSHGId, setSelectedSHGId] = useState<string>(shgs[0]?.id || '');
  const [meetingDate, setMeetingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState<string>('दुपारी २:०० वाजता');
  const [venue, setVenue] = useState<string>('ग्रामपंचायत सभागृह');
  const [chairpersonName, setChairpersonName] = useState<string>('आनंदी रमेश जाधव (अध्यक्षा)');
  const [resolutionText, setResolutionText] = useState<string>(
    'आज बचत गटाची मासिक सभा शांततेत पार पडली. सर्व उपस्थित सदस्यांनी नियमित मासिक बचत जमा केली. नवीन कर्ज मागण्यांचा आढावा घेण्यात आला व पुढील महिन्याचे नियोजन ठरले.'
  );
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<{ stop: () => void } | null>(null);

  // Attendance state for new meeting
  const shgMembers = members.filter(m => m.shgId === selectedSHGId);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceRecord['status']; savings: number; loan: number }>>({});

  const handleOpenNewMeeting = () => {
    // Initialize attendance map
    const initialMap: Record<string, { status: AttendanceRecord['status']; savings: number; loan: number }> = {};
    shgMembers.forEach(m => {
      initialMap[m.id] = {
        status: 'उपस्थित (Present)',
        savings: 200,
        loan: m.activeLoanAmount > 0 ? 2000 : 0
      };
    });
    setAttendanceMap(initialMap);
    setShowNewMeetingModal(true);
  };

  const handleVoiceDictation = () => {
    if (isRecordingVoice) {
      if (recognitionInstance) recognitionInstance.stop();
      setIsRecordingVoice(false);
      return;
    }

    const instance = startSpeechRecognition(
      (transcript: string) => {
        setResolutionText(prev => prev + ' ' + transcript);
        setIsRecordingVoice(false);
      },
      () => {
        setIsRecordingVoice(false);
      }
    );

    if (instance) {
      setRecognitionInstance(instance);
      setIsRecordingVoice(true);
    }
  };

  const handleSubmitMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSHG = shgs.find(s => s.id === selectedSHGId);
    if (!targetSHG) return;

    const attendanceList: AttendanceRecord[] = shgMembers.map(m => {
      const data = attendanceMap[m.id] || { status: 'उपस्थित (Present)', savings: 200, loan: 0 };
      return {
        memberId: m.id,
        memberName: m.marathiName.split('(')[0],
        status: data.status,
        savingsPaid: data.savings,
        loanEmiPaid: data.loan,
        newLoanApplied: 0
      };
    });

    addMeeting({
      shgId: selectedSHGId,
      shgName: targetSHG.marathiName,
      meetingDate,
      meetingTime,
      venue,
      chairpersonName,
      agenda: ['मासिक बचत संकलन', 'कर्ज हप्ता वसुली', 'उपजीविका आढावा', 'बँक कामकाज'],
      meetingResolutionText: resolutionText,
      meetingPhoto: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=400&auto=format&fit=crop&q=80',
      attendanceList,
      crpName: 'सुमित्रा पवार (CRP)'
    });

    setShowNewMeetingModal(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-amber-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <CalendarIcon className="w-6 h-6" />
            </span>
            मासिक सभा व उपस्थिती नोंदवही (Meetings & Attendance)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            बचत गट मासिक सभा, उपस्थिती नोंद, ठराव लेखन, व्हॉईस डिक्टेशन व संकलन हिशोब
          </p>
        </div>

        <button
          onClick={handleOpenNewMeeting}
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>+ नवीन सभा सुरू करा (Start Meeting)</span>
        </button>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meetings.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-2xl text-center text-gray-400 border border-dashed border-gray-300">
            कोणतीही सभा नोंद आढळली नाही.
          </div>
        ) : (
          meetings.map(m => (
            <div
              key={m.id}
              className="bg-white rounded-3xl p-5 border border-amber-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      सभा दिनांक: {m.meetingDate}
                    </span>
                    <h3 className="font-black text-lg text-gray-900 mt-1.5">{m.shgName}</h3>
                    <p className="text-xs text-gray-500">
                      📍 {m.venue} | {m.meetingTime}
                    </p>
                  </div>

                  <span className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full">
                    {m.status}
                  </span>
                </div>

                {/* Key Meeting Tally */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100">
                    <span className="text-blue-700 text-[10px] block font-bold">उपस्थिती</span>
                    <span className="font-black text-blue-950 text-base">
                      {m.totalAttendance} / {m.totalMembers || 12}
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-700 text-[10px] block font-bold">बचत जमा</span>
                    <span className="font-black text-emerald-950 text-base">
                      {formatINR(m.totalSavingsCollected)}
                    </span>
                  </div>
                  <div className="bg-purple-50 p-2.5 rounded-2xl border border-purple-100">
                    <span className="text-purple-700 text-[10px] block font-bold">कर्ज हप्ता जमा</span>
                    <span className="font-black text-purple-950 text-base">
                      {formatINR(m.totalLoanCollected)}
                    </span>
                  </div>
                </div>

                {/* Resolution snippet */}
                <div className="mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-700">
                  <span className="font-bold text-gray-900 block mb-1">ठराव नोंद (Resolution):</span>
                  <p className="line-clamp-2 italic text-gray-600">&ldquo;{m.meetingResolutionText}&rdquo;</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() =>
                    speakText(
                      `${m.shgName} ची सभा. उपस्थिती ${m.totalAttendance} महिला. एकूण बचत जमा ${m.totalSavingsCollected} रुपये. कर्ज वसुली ${m.totalLoanCollected} रुपये.`
                    )
                  }
                  className="p-2 text-gray-500 hover:text-amber-600 bg-gray-100 hover:bg-amber-50 rounded-xl"
                  title="माहिती ऐका"
                >
                  <VolumeUpIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveMeetingDetail(m)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-xl font-bold text-xs shadow-md transition text-center"
                >
                  संपूर्ण सभा इतिवृत्त व उपस्थिती
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMeetingToDelete(m);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 bg-gray-100 rounded-xl transition"
                  title="सभा नोंद हटवा (Delete Meeting)"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Meeting Detail Modal */}
      {activeMeetingDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-amber-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveMeetingDetail(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-3">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                मासिक सभा इतिवृत्त (Meeting Minutes)
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-1">{activeMeetingDetail.shgName}</h3>
              <p className="text-xs text-gray-500">
                दिनांक: {activeMeetingDetail.meetingDate} | वेळ: {activeMeetingDetail.meetingTime} | ठिकाण: {activeMeetingDetail.venue}
              </p>
            </div>

            {/* Resolution Box */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
              <h4 className="font-black text-amber-950 text-sm">ठराव नोंद (Resolution Passed)</h4>
              <p className="text-gray-800 leading-relaxed">{activeMeetingDetail.meetingResolutionText}</p>
            </div>

            {/* Attendance Table */}
            <div className="mt-4">
              <h4 className="font-black text-sm text-gray-800 mb-2">
                सदस्य उपस्थिती व संकलन यादी (Attendance & Collection)
              </h4>
              <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-2.5">सदस्याचे नाव</th>
                      <th className="p-2.5">स्थिती</th>
                      <th className="p-2.5">जमा बचत</th>
                      <th className="p-2.5">कर्ज हप्ता</th>
                      <th className="p-2.5 text-right">कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeMeetingDetail.attendanceList.map((a, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-gray-900">{a.memberName}</td>
                        <td className="p-2.5">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            {a.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-extrabold text-emerald-800">₹{a.savingsPaid}</td>
                        <td className="p-2.5 font-extrabold text-purple-800">₹{a.loanEmiPaid}</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAttendanceToDelete({
                                meetingId: activeMeetingDetail.id,
                                memberId: a.memberId,
                                memberName: a.memberName
                              });
                            }}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="उपस्थिती नोंद काढा"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const target = activeMeetingDetail;
                  setActiveMeetingDetail(null);
                  setMeetingToDelete(target);
                }}
                className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition"
                title="सभा नोंद कायमची हटवा"
              >
                <TrashIcon className="w-4 h-4 text-red-600" />
                <span>सभा नोंद हटवा (Delete)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>ठराव प्रत प्रिंट (Print)</span>
                </button>
                <button
                  onClick={() => setActiveMeetingDetail(null)}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Start New Meeting Modal */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-amber-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowNewMeetingModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन मासिक सभा व उपस्थिती (Conduct Monthly Meeting)
            </h3>

            <form onSubmit={handleSubmitMeeting} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">बचत गट निवडा *</label>
                  <select
                    value={selectedSHGId}
                    onChange={e => setSelectedSHGId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    {shgs.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.marathiName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">सभा दिनांक *</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">सभेची वेळ (Time)</label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={e => setMeetingTime(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">सभेचे ठिकाण (Venue)</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={e => setVenue(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">सभेच्या अध्यक्षा (Chairperson)</label>
                  <input
                    type="text"
                    value={chairpersonName}
                    onChange={e => setChairpersonName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Members Attendance List */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-extrabold text-sm text-gray-800 mb-2">
                  सदस्य उपस्थिती व संकलन पत्रक (Attendance & Collections)
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {shgMembers.map(m => {
                    const current = attendanceMap[m.id] || { status: 'उपस्थित (Present)', savings: 200, loan: 0 };
                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <span className="font-black text-gray-900 text-sm">{m.marathiName.split('(')[0]}</span>
                          <span className="text-[11px] text-gray-500 block">{m.designation}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={current.status}
                            onChange={e => {
                              setAttendanceMap(prev => ({
                                ...prev,
                                [m.id]: { ...current, status: e.target.value as AttendanceRecord['status'] }
                              }));
                            }}
                            className="p-1.5 bg-white border border-gray-300 rounded-xl text-xs font-bold"
                          >
                            <option value="उपस्थित (Present)">उपस्थित (Present)</option>
                            <option value="रजेवर (On Leave)">रजेवर (Leave)</option>
                            <option value="अनुपस्थित (Absent)">अनुपस्थित (Absent)</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-[10px]">बचत ₹:</span>
                            <input
                              type="number"
                              value={current.savings}
                              onChange={e => {
                                setAttendanceMap(prev => ({
                                  ...prev,
                                  [m.id]: { ...current, savings: Number(e.target.value) }
                                }));
                              }}
                              className="w-16 p-1.5 bg-white border border-gray-300 rounded-xl font-bold text-emerald-800 text-xs"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-[10px]">कर्ज ₹:</span>
                            <input
                              type="number"
                              value={current.loan}
                              onChange={e => {
                                setAttendanceMap(prev => ({
                                  ...prev,
                                  [m.id]: { ...current, loan: Number(e.target.value) }
                                }));
                              }}
                              className="w-16 p-1.5 bg-white border border-gray-300 rounded-xl font-bold text-purple-800 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resolution Note with Speech Dictation */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">
                    सभेचा ठराव व इतिवृत्त नोंद (Meeting Resolution)
                  </label>
                  <button
                    type="button"
                    onClick={handleVoiceDictation}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isRecordingVoice
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    <MicIcon className="w-4 h-4 text-red-600" />
                    <span>{isRecordingVoice ? 'बोलणे थांबवा (Stop)' : 'बोलून लिहा (Marathi Voice Dictate)'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl leading-relaxed text-xs focus:ring-2 focus:ring-amber-400"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>सभा पूर्ण व जतन करा (Save Meeting)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Meeting Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={meetingToDelete !== null}
        onClose={() => setMeetingToDelete(null)}
        onConfirm={() => {
          if (meetingToDelete) {
            deleteMeeting(meetingToDelete.id);
            setMeetingToDelete(null);
          }
        }}
        title="मासिक सभा नोंद हटवा (Delete Meeting Record)"
        itemName={`${meetingToDelete?.shgName || ''} - दिनांक: ${meetingToDelete?.meetingDate || ''}`}
        itemType="मासिक सभा"
        warningMessage="ही सभा नोंद आणि त्यातील ठराव व हिशोब कायमचा काढून टाकला जाईल."
      />

      {/* Delete Attendance Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={attendanceToDelete !== null}
        onClose={() => setAttendanceToDelete(null)}
        onConfirm={() => {
          if (attendanceToDelete) {
            deleteAttendance(attendanceToDelete.meetingId, attendanceToDelete.memberId);
            setAttendanceToDelete(null);
          }
        }}
        title="उपस्थिती नोंद काढा (Remove Attendance)"
        itemName={attendanceToDelete?.memberName || ''}
        itemType="उपस्थिती नोंद"
        warningMessage="या सभेतील संबंधित सदस्याची उपस्थिती व संकलन नोंद काढली जाईल."
      />
    </div>
  );
};
