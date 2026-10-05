'use client';

import React from 'react';
import { TrashIcon, AlertTriangleIcon, XIcon } from './icons';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string; // e.g. "बचत गट हटवा (Delete SHG)"
  itemName: string; // e.g. "सावित्रीबाई फुले महिला बचत गट"
  itemType?: string; // e.g. "बचत गट", "सदस्य", "कागदपत्र", "कर्ज नोंद"
  warningMessage?: string; // e.g. "या बचत गटाशी संबंधित सर्व सदस्य, बचत व कर्जाचा डेटा देखील काढला जाईल."
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'नोंद',
  warningMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 transform transition-all scale-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 shadow-inner">
              <TrashIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 leading-tight">
                हा डेटा हटवायचा आहे का?
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {title || 'नोंद कायमची हटवा (Delete Record)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="mt-5 space-y-3">
          <div className="p-3.5 bg-red-50/80 rounded-2xl border border-red-200/70">
            <div className="text-xs font-bold text-red-900 mb-1">
              निवडलेली {itemType}:
            </div>
            <div className="text-sm font-extrabold text-gray-900 truncate">
              {itemName}
            </div>
          </div>

          {warningMessage ? (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
              <AlertTriangleIcon className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>{warningMessage}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-600 leading-relaxed">
              ही कृती केल्यास ही नोंद सिस्टीममधून काढून टाकली जाईल. ही क्रिया परत करता येणार नाही.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-sm transition"
          >
            रद्द करा (Cancel)
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm shadow-md shadow-red-200 flex items-center gap-2 transition"
          >
            <TrashIcon className="w-4 h-4" />
            <span>होय, हटवा (Yes, Delete)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
