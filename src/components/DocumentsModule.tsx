'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { DocumentItem } from '@/types';
import {
  FileTextIcon,
  PlusIcon,
  SearchIcon,
  CheckCircleIcon,
  XIcon,
  CameraIcon,
  VolumeUpIcon,
  PrinterIcon,
  RefreshIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const DocumentsModule: React.FC = () => {
  const { documents, members, shgs, addDocument, replaceDocument, verifyDocument, deleteDocument, speakText, globalSearch, setGlobalSearch } = useApp();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentItem | null>(null);
  const [selectedDocForReplace, setSelectedDocForReplace] = useState<DocumentItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null);

  const [filterDocType, setFilterDocType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State for new upload
  const [selectedEntityId, setSelectedEntityId] = useState<string>(members[0]?.id || '');
  const [docType, setDocType] = useState<DocumentItem['docType']>('आधार कार्ड (Aadhar Card)');
  const [customTitle, setCustomTitle] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // Replace form state
  const [replaceBase64, setReplaceBase64] = useState<string>('');
  const [replaceFileName, setReplaceFileName] = useState<string>('');
  const [replaceRemarks, setReplaceRemarks] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Filter documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.entityName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      d.docType.toLowerCase().includes(globalSearch.toLowerCase());

    const matchesType = filterDocType === 'ALL' || d.docType === filterDocType;
    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle local file selection with FileReader
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReplaceFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReplaceBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const member = members.find(m => m.id === selectedEntityId);
    const shg = shgs.find(s => s.id === selectedEntityId);
    const entityName = member ? member.marathiName.split('(')[0] : shg ? shg.marathiName : 'आनंदी जाधव';

    const defaultSampleUrl =
      docType.includes('आधार')
        ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
        : docType.includes('पासबुक')
        ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
        : docType.includes('पॅन')
        ? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80';

    const finalFileUrl = uploadedBase64 || defaultSampleUrl;
    const finalTitle = customTitle.trim() || `${entityName} - ${docType.split('(')[0]} प्रत`;

    addDocument({
      entityType: member ? 'MEMBER' : 'SHG',
      entityId: selectedEntityId,
      entityName,
      docType,
      title: finalTitle,
      fileUrl: finalFileUrl,
      remarks: remarks || 'डिजिटल पडताळणीसाठी अपलोड केले.'
    });

    setShowUploadModal(false);
    setUploadedBase64('');
    setUploadFileName('');
    setCustomTitle('');
    setRemarks('');
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForReplace) return;

    if (!replaceBase64) {
      alert('कृपया नवीन कागदपत्र फाईल निवडा');
      return;
    }

    replaceDocument(selectedDocForReplace.id, replaceBase64, undefined, replaceRemarks);
    setShowReplaceModal(false);
    setSelectedDocForReplace(null);
    setReplaceBase64('');
    setReplaceFileName('');
    setReplaceRemarks('');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
              <FileTextIcon className="w-6 h-6" />
            </span>
            कागदपत्रे व सुरक्षित दस्तऐवज भांडार (Documents & KYC Hub)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            महिला सभासद व बचत गटांचे आधार कार्ड, पॅन कार्ड, बँक पासबुक व ठराव प्रतींचे सुरक्षित संकलन व पडताळणी
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-4 h-4" />
          <span>+ नवीन कागदपत्र अपलोड करा (Upload Doc)</span>
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
              placeholder="सभासद नाव, शीर्षक किंवा प्रकार शोधा..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-gray-600 mb-1">कागदपत्र प्रकार (Document Type):</label>
          <select
            value={filterDocType}
            onChange={e => setFilterDocType(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व कागदपत्रे (All Types)</option>
            <option value="आधार कार्ड (Aadhar Card)">आधार कार्ड (Aadhaar Card)</option>
            <option value="बँक पासबुक (Passbook)">बँक पासबुक (Passbook)</option>
            <option value="पॅन कार्ड (PAN)">पॅन कार्ड (PAN Card)</option>
            <option value="बचत गट ठराव (SHG Resolution)">बचत गट ठराव (SHG Resolution)</option>
            <option value="रेशन कार्ड (Ration Card)">रेशन कार्ड (Ration Card)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-gray-600 mb-1">पडताळणी स्थिती (Verification Status):</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl font-bold"
          >
            <option value="ALL">सर्व स्थिती (All Status)</option>
            <option value="सत्यापित (Verified)">सत्यापित (Verified)</option>
            <option value="प्रलंबित (Pending)">प्रलंबित (Pending)</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-3xl text-center text-gray-400 border border-dashed border-gray-300">
            कोणतेही कागदपत्र आढळले नाही.
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5">
                  {/* Thumbnail with Click to Preview */}
                  <div
                    onClick={() => setSelectedDocForPreview(doc)}
                    className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 cursor-pointer group relative shadow-inner"
                  >
                    <img
                      src={doc.fileUrl}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                      👁️ पहा
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {doc.docType.split('(')[0]}
                    </span>
                    <h3 className="font-black text-sm text-gray-900 mt-1 truncate" title={doc.title}>
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-semibold mt-0.5">
                      👤 {doc.entityName}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 p-2.5 bg-gray-50 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between text-gray-500">
                    <span>अपलोड दिनांक:</span>
                    <span className="font-bold text-gray-800">{doc.uploadDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">पडताळणी स्थिती:</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        doc.status === 'सत्यापित (Verified)'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      ✓ {doc.status.split(' ')[0]}
                    </span>
                  </div>
                  {doc.remarks && (
                    <div className="pt-1 text-[11px] text-gray-600 italic border-t border-gray-200/60">
                      नोंद: {doc.remarks}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <button
                  onClick={() => speakText(`${doc.entityName} यांचे ${doc.docType} कागदपत्र सत्यापित आहे.`)}
                  className="p-2 text-gray-500 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 rounded-xl"
                  title="माहिती ऐका"
                >
                  <VolumeUpIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedDocForPreview(doc)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl font-black text-xs shadow-sm transition text-center"
                >
                  कागदपत्र पहा (Preview)
                </button>

                <button
                  onClick={() => {
                    setSelectedDocForReplace(doc);
                    setShowReplaceModal(true);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-xl font-bold text-xs transition flex items-center gap-1"
                  title="नवीन फाईलने बदला"
                >
                  <RefreshIcon className="w-3.5 h-3.5" />
                  <span>बदला</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocToDelete(doc);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 bg-gray-100 rounded-xl transition"
                  title="कागदपत्र हटवा (Delete Document)"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full Screen Document Preview Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-emerald-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedDocForPreview(null)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-3 pr-10">
              <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {selectedDocForPreview.docType}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1.5">
                {selectedDocForPreview.title}
              </h3>
              <p className="text-xs text-gray-500">
                सभासद / बचत गट: <strong className="text-gray-800">{selectedDocForPreview.entityName}</strong> | अपलोड: {selectedDocForPreview.uploadDate} ({selectedDocForPreview.uploadedBy})
              </p>
            </div>

            {/* Document Image View */}
            <div className="mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center max-h-[55vh]">
              <img
                src={selectedDocForPreview.fileUrl}
                alt={selectedDocForPreview.title}
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">स्थिती:</span>
                <span className="font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✓ {selectedDocForPreview.status}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const target = selectedDocForPreview;
                    setSelectedDocForPreview(null);
                    setDocToDelete(target);
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-xl font-black flex items-center gap-1.5 transition"
                  title="कागदपत्र हटवा"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                  <span>कागदपत्र हटवा (Delete)</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
                >
                  <PrinterIcon className="w-4 h-4" />
                  <span>प्रिंट (Print)</span>
                </button>
                <button
                  onClick={() => setSelectedDocForPreview(null)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-black"
                >
                  बंद करा (Close)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन कागदपत्र सुरक्षित अपलोड करा (Upload Document)
            </h3>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block font-black text-gray-800 mb-1">
                  १. सभासद किंवा बचत गट निवडा *
                </label>
                <select
                  value={selectedEntityId}
                  onChange={e => setSelectedEntityId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                >
                  <optgroup label="महिला सभासद">
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.marathiName} ({m.shgName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="बचत गट">
                    {shgs.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.marathiName}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">
                  २. कागदपत्र प्रकार (Document Type) *
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900"
                >
                  <option value="आधार कार्ड (Aadhar Card)">आधार कार्ड (Aadhaar Card)</option>
                  <option value="बँक पासबुक (Passbook)">बँक पासबुक (Bank Passbook)</option>
                  <option value="पॅन कार्ड (PAN)">पॅन कार्ड (PAN Card)</option>
                  <option value="बचत गट ठराव (SHG Resolution)">बचत गट ठराव नोंद (Resolution)</option>
                  <option value="रेशन कार्ड (Ration Card)">रेशन कार्ड (Ration Card)</option>
                  <option value="इतर (Other)">इतर प्रमाणपत्र</option>
                </select>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">
                  ३. कागदपत्राचे शीर्षक (Title Optional)
                </label>
                <input
                  type="text"
                  placeholder="उदा. आनंदी जाधव आधार कार्ड प्रत"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              {/* Real File Upload Input */}
              <div>
                <label className="block font-black text-gray-800 mb-1">
                  ४. फाईल / फोटो निवडा (Choose File or Camera) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 p-4 rounded-2xl text-center cursor-pointer transition space-y-1"
                >
                  <CameraIcon className="w-8 h-8 text-emerald-700 mx-auto" />
                  <p className="font-bold text-gray-800 text-xs">
                    {uploadFileName ? `निवडलेली फाईल: ${uploadFileName}` : 'कॅमेऱ्याने फोटो काढा किंवा फाईल निवडा'}
                  </p>
                  <span className="text-[10px] text-gray-500 block">
                    (JPG, PNG, PDF थेट डिव्हाइसवरून सुरक्षित अपलोड)
                  </span>
                </div>

                {/* Instant Real-Time Preview */}
                {uploadedBase64 && (
                  <div className="mt-2 p-2 bg-gray-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <img src={uploadedBase64} alt="Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="font-bold text-emerald-800 text-xs truncate">✓ फाईल तयार आहे ({uploadFileName})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl font-black shadow-md"
                >
                  सुरक्षित जतन करा (Save Document)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Document Modal */}
      {showReplaceModal && selectedDocForReplace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => setShowReplaceModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
              कागदपत्र नवीन फाईलने बदला (Replace Document)
            </h3>

            <form onSubmit={handleReplaceSubmit} className="mt-4 space-y-3.5">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="font-bold text-emerald-950 block">सध्याचे कागदपत्र:</span>
                <span className="font-black text-gray-900">{selectedDocForReplace.title}</span>
                <span className="text-gray-500 block text-[11px]">({selectedDocForReplace.entityName})</span>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">
                  नवीन फाईल / फोटो निवडा *
                </label>
                <input
                  type="file"
                  ref={replaceFileInputRef}
                  accept="image/*,.pdf"
                  onChange={handleReplaceFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => replaceFileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 bg-gray-50 hover:bg-emerald-50 p-4 rounded-2xl text-center cursor-pointer transition space-y-1"
                >
                  <CameraIcon className="w-7 h-7 text-emerald-700 mx-auto" />
                  <p className="font-bold text-gray-800 text-xs">
                    {replaceFileName ? `नवीन फाईल: ${replaceFileName}` : 'नवीन फोटो किंवा स्कॅन निवडा'}
                  </p>
                </div>

                {replaceBase64 && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <img src={replaceBase64} alt="New Preview" className="w-12 h-12 object-cover rounded-lg" />
                    <span className="font-bold text-emerald-800 text-xs truncate">✓ नवीन फाईल निवडली गेली आहे</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1">बदलण्याचे कारण / नोंद (Remarks)</label>
                <input
                  type="text"
                  placeholder="उदा. स्पष्ट नवीन प्रत अपलोड केली"
                  value={replaceRemarks}
                  onChange={e => setReplaceRemarks(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowReplaceModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md"
                >
                  फाईल अद्ययावत करा (Update File)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={docToDelete !== null}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => {
          if (docToDelete) {
            deleteDocument(docToDelete.id);
            setDocToDelete(null);
          }
        }}
        title="कागदपत्र कायमचे हटवा (Delete Document)"
        itemName={docToDelete?.title || ''}
        itemType="कागदपत्र"
        warningMessage="हे कागदपत्र कायमचे काढून टाकले जाईल. आवश्यक असल्यास आपण नवीन फाईल पुन्हा अपलोड करू शकता."
      />
    </div>
  );
};
