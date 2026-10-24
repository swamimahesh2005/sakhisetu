'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TrainingRecord } from '@/types';
import { AwardIcon, PlusIcon, XIcon, VolumeUpIcon, TrashIcon } from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const TrainingModule: React.FC = () => {
  const { trainings, addTraining, deleteTraining, speakText } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<TrainingRecord | null>(null);
  const [topic, setTopic] = useState('डिजिटल बँकिंग व QR कोड वापर प्रशिक्षण');
  const [category, setCategory] = useState<TrainingRecord['category']>('वित्तीय साक्षरता व डिजिटल बँकिंग');
  const [trainerName, setTrainerName] = useState('अजित काळे (बँक मित्र)');
  const [location, setLocation] = useState('ग्रामपंचायत कार्यालय');
  const [participantCount, setParticipantCount] = useState(25);
  const [totalHours, setTotalHours] = useState(4);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTraining({
      topic,
      marathiTopic: topic,
      category,
      date: new Date().toISOString().split('T')[0],
      trainerName,
      location,
      totalHours: Number(totalHours),
      participantCount: Number(participantCount),
      shgIds: ['shg_savitribai', 'shg_jijau'],
      certificateIssued: true
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-teal-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <AwardIcon className="w-6 h-6" />
            </span>
            प्रशिक्षण व क्षमता बांधणी नोंदवही (Training & Capacity Building)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            वित्तीय साक्षरता, शेळीपालन, शिवणकाम व नेतृत्व विकास प्रशिक्षण सत्रांच्या नोंदी
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>+ नवीन प्रशिक्षण नोंदवा (Add Training)</span>
        </button>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {trainings.map(t => (
          <div key={t.id} className="bg-white rounded-3xl p-5 border border-teal-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {t.category}
                  </span>
                  <h3 className="font-black text-base text-gray-900 mt-1.5">{t.marathiTopic}</h3>
                  <p className="text-xs text-gray-500">प्रशिक्षक: {t.trainerName}</p>
                </div>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  प्रमाणपत्र जारी
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="text-gray-500 text-[10px] block">तारीख</span>
                  <span className="font-bold text-gray-900">{t.date}</span>
                </div>
                <div className="bg-teal-50 p-2 rounded-xl">
                  <span className="text-teal-700 text-[10px] block">उपस्थित महिला</span>
                  <span className="font-bold text-teal-950">{t.participantCount} जणी</span>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <span className="text-gray-500 text-[10px] block">कालावधी</span>
                  <span className="font-bold text-gray-900">{t.totalHours} तास</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                📍 ठिकाण: {t.location}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800">सहभागी बचत गट: २ गट</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => speakText(`${t.marathiTopic}. प्रशिक्षक ${t.trainerName}. एकूण ${t.participantCount} महिला सहभागी.`)}
                  className="p-2 text-gray-500 hover:text-teal-600 bg-gray-100 hover:bg-teal-50 rounded-xl transition"
                  title="माहिती ऐका"
                >
                  <VolumeUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTrainingToDelete(t)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-gray-100 rounded-xl transition"
                  title="प्रशिक्षण सत्र हटवा (Delete Training)"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-teal-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन प्रशिक्षण सत्र नोंदणी (Register Training)
            </h3>

            <form onSubmit={handleAdd} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">प्रशिक्षणाचा विषय *</label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">प्रवर्ग (Category)</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TrainingRecord['category'])}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="वित्तीय साक्षरता व डिजिटल बँकिंग">वित्तीय साक्षरता व डिजिटल बँकिंग</option>
                  <option value="शेळीपालन व पशुधन व्यवस्थापन">शेळीपालन व पशुधन व्यवस्थापन</option>
                  <option value="शिवणकाम व अगरबत्ती उद्योग">शिवणकाम व अगरबत्ती उद्योग</option>
                  <option value="हिशोब नोंदवह्या व नेतृत्व">हिशोब नोंदवह्या व नेतृत्व</option>
                  <option value="सेंद्रिय शेती व खत निर्मिती">सेंद्रिय शेती व खत निर्मिती</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">प्रशिक्षकाचे नाव (Trainer)</label>
                  <input
                    type="text"
                    value={trainerName}
                    onChange={e => setTrainerName(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">उपस्थित महिला संख्या</label>
                  <input
                    type="number"
                    value={participantCount}
                    onChange={e => setParticipantCount(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-teal-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">प्रशिक्षण ठिकाण (Location)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">एकूण तास (Duration Hours)</label>
                  <input
                    type="number"
                    value={totalHours}
                    onChange={e => setTotalHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-extrabold shadow-md"
                >
                  प्रशिक्षण जतन करा (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Training Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={trainingToDelete !== null}
        onClose={() => setTrainingToDelete(null)}
        onConfirm={() => {
          if (trainingToDelete) {
            deleteTraining(trainingToDelete.id);
            setTrainingToDelete(null);
          }
        }}
        title="प्रशिक्षण सत्र नोंद हटवा (Delete Training)"
        itemName={`${trainingToDelete?.marathiTopic || ''} (${trainingToDelete?.date || ''})`}
        itemType="प्रशिक्षण सत्र"
        warningMessage="हे प्रशिक्षण सत्र आणि त्यातील उपस्थिती नोंद सिस्टीममधून काढून टाकली जाईल."
      />
    </div>
  );
};
