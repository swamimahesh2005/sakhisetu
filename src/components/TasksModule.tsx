'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarIcon, PlusIcon, CheckCircleIcon, XIcon, VolumeUpIcon, TrashIcon } from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { TaskReminder } from '@/types';

export const TasksModule: React.FC = () => {
  const { tasks, toggleTask, addTask, deleteTask, speakText } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskReminder | null>(null);
  const [marathiTitle, setMarathiTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'उच्च (High)' | 'मध्यम (Medium)' | 'सामान्य (Normal)'>('उच्च (High)');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marathiTitle.trim()) return;

    addTask({
      title: marathiTitle,
      marathiTitle,
      description,
      dueDate,
      priority,
      assignedRole: 'CRP',
      category: 'सभा (Meeting)'
    });

    setShowAddModal(false);
    setMarathiTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <CalendarIcon className="w-6 h-6" />
            </span>
            कार्ये व स्मरणपत्रे (Tasks & Reminders)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            मासिक सभा, बँक पाठपुरावा, कर्ज हप्ता आठवण आणि अहवाल सादर करण्याची नियोजित कामे
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>+ नवीन कार्य जोडा (Add Task)</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map(t => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl p-4 border transition flex items-center justify-between gap-3 shadow-sm ${
              t.completed ? 'border-gray-200 opacity-60 bg-gray-50' : 'border-rose-100 hover:border-rose-300'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => toggleTask(t.id)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border transition mt-0.5 ${
                  t.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-gray-300 hover:border-orange-500'
                }`}
              >
                {t.completed && <CheckCircleIcon className="w-4 h-4" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      t.priority.includes('उच्च')
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">मुदत: {t.dueDate}</span>
                </div>
                <h4 className={`font-bold text-sm text-gray-900 mt-1 ${t.completed ? 'line-through text-gray-400' : ''}`}>
                  {t.marathiTitle}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => speakText(`कार्य: ${t.marathiTitle}. मुदत तारीख ${t.dueDate}.`)}
                className="p-2 text-gray-400 hover:text-orange-600 rounded-xl transition"
                title="ऐका"
              >
                <VolumeUpIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTaskToDelete(t)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="कार्य हटवा (Delete Task)"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-rose-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन कार्य जोडा (Add New Task)
            </h3>

            <form onSubmit={handleAdd} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">कार्याचे नाव (Task Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. जिजाऊ बचत गट बँक पासबुक एन्ट्री करणे"
                  value={marathiTitle}
                  onChange={e => setMarathiTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">तपशील (Description)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">मुदत दिनांक (Due Date)</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">प्राधान्यता (Priority)</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="उच्च (High)">उच्च (High)</option>
                    <option value="मध्यम (Medium)">मध्यम (Medium)</option>
                    <option value="सामान्य (Normal)">सामान्य (Normal)</option>
                  </select>
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
                  className="px-6 py-2 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-xl font-extrabold shadow-md"
                >
                  कार्य जतन करा (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        title="कार्य हटवा (Delete Task)"
        itemName={`${taskToDelete?.marathiTitle || ''} (मुदत: ${taskToDelete?.dueDate || ''})`}
        itemType="कार्य / स्मरणपत्र"
        warningMessage="हे कार्य स्मरणपत्र सिस्टीममधून काढून टाकले जाईल."
      />
    </div>
  );
};
