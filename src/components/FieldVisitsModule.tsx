'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { FieldVisit } from '@/types';
import {
  MapPinIcon,
  PlusIcon,
  CheckCircleIcon,
  XIcon,
  VolumeUpIcon,
  TrashIcon
} from './icons';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const FieldVisitsModule: React.FC = () => {
  const { fieldVisits, villages, shgs, addFieldVisit, deleteFieldVisit, speakText } = useApp();

  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<FieldVisit | null>(null);

  // New Visit Form
  const [villageId, setVillageId] = useState<string>(villages[0]?.id || '');
  const [shgId, setShgId] = useState<string>(shgs[0]?.id || '');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState<FieldVisit['purpose']>('नियमित मासिक सभा तपासणी');
  const [gpsLat, setGpsLat] = useState<number>(18.3542);
  const [gpsLng, setGpsLng] = useState<number>(73.8475);
  const [locationAddress, setLocationAddress] = useState<string>('ग्रामपंचायत परिसर, खेड शिवापूर, ता. हवेली');
  const [observations, setObservations] = useState<string>('गटाची बैठक वेळेवर संपन्न झाली. सर्व नोंदवह्या व हिशोब व्यवस्थित आहेत.');
  const [actionItems, setActionItems] = useState<string>('पुढील आठवड्यात बँक लिंकेज नूतनीकरणाची पूर्तता करणे.');
  const [ratingGrade, setRatingGrade] = useState<FieldVisit['ratingGrade']>('उत्कृष्ट (Grade A)');
  const [isGettingGPS, setIsGettingGPS] = useState(false);

  const handleCaptureGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsGettingGPS(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsLat(Number(pos.coords.latitude.toFixed(4)));
          setGpsLng(Number(pos.coords.longitude.toFixed(4)));
          setIsGettingGPS(false);
          speakText('चालू जीपीएस लोकेशन यशस्वीरित्या नोंदवले गेले.');
        },
        err => {
          console.warn(err);
          setIsGettingGPS(false);
          alert('GPS परवानगी दिली नाही. डीफॉल्ट लोकेशन वापरले जात आहे.');
        }
      );
    }
  };

  const handleSubmitVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const village = villages.find(v => v.id === villageId);
    const shg = shgs.find(s => s.id === shgId);

    addFieldVisit({
      villageId,
      villageName: village ? village.marathiName : 'खेड शिवापूर',
      shgId,
      shgName: shg ? shg.marathiName : undefined,
      visitDate,
      purpose,
      gpsLat,
      gpsLng,
      locationAddress,
      photoUrl: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=400&auto=format&fit=crop&q=80',
      observations,
      actionItems,
      ratingGrade
    });

    setShowNewVisitModal(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <MapPinIcon className="w-6 h-6" />
            </span>
            क्षेत्रीय भेट व जीपीएस नोंद (Field Visits & GPS Log)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            समूह सखी व प्रखंड व्यवस्थापक यांच्या गाव भेटी, जिओ-टॅगिंग, फोटो आणि पाहणी अहवाल
          </p>
        </div>

        <button
          onClick={() => setShowNewVisitModal(true)}
          className="bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition"
        >
          <PlusIcon className="w-5 h-5" />
          <span>+ नवीन क्षेत्रीय भेट नोंदवा (Record Visit)</span>
        </button>
      </div>

      {/* Visits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {fieldVisits.map(v => (
          <div
            key={v.id}
            className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img src={v.photoUrl} alt="Field visit" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      भेट दिनांक: {v.visitDate}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md">
                      {v.ratingGrade.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-gray-900 mt-1">{v.purpose}</h3>
                  <p className="text-xs text-gray-500">
                    📍 {v.villageName} {v.shgName ? `• ${v.shgName}` : ''}
                  </p>
                </div>
              </div>

              {/* GPS Coordinates Badge */}
              <div className="mt-4 p-2.5 bg-gray-50 rounded-2xl text-xs text-gray-600 flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono text-[11px] text-gray-800">
                  <MapPinIcon className="w-3.5 h-3.5 text-rose-600" />
                  GPS: {v.gpsLat}, {v.gpsLng}
                </span>
                <span className="text-gray-500 text-[10px]">{v.locationAddress}</span>
              </div>

              {/* Observations */}
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                  <span className="font-bold text-rose-950 block">पाहणी नोंदी (Observations):</span>
                  <p className="text-gray-700 mt-0.5">{v.observations}</p>
                </div>

                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block">पुढील कृती (Action Items):</span>
                  <p className="text-gray-700 mt-0.5">{v.actionItems}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">भेट अधिकारी: {v.crpName}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => speakText(`${v.villageName} येथील क्षेत्रीय भेट. पाहणी: ${v.observations}`)}
                  className="p-2 text-gray-500 hover:text-rose-600 bg-gray-100 hover:bg-rose-50 rounded-xl transition"
                  title="माहिती ऐका"
                >
                  <VolumeUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setVisitToDelete(v)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-gray-100 rounded-xl transition"
                  title="क्षेत्रीय भेट हटवा (Delete Field Visit)"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Field Visit Modal */}
      {showNewVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-rose-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowNewVisitModal(false)}
              className="absolute right-5 top-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              <XIcon className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-gray-900 border-b border-gray-100 pb-3">
              नवीन क्षेत्रीय भेट व GPS नोंद (Record Field Visit)
            </h3>

            <form onSubmit={handleSubmitVisit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">गाव निवडा (Village) *</label>
                  <select
                    value={villageId}
                    onChange={e => setVillageId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold"
                  >
                    {villages.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.marathiName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">बचत गट (SHG Optional)</label>
                  <select
                    value={shgId}
                    onChange={e => setShgId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="">-- कोणताही विशिष्ट गट नाही --</option>
                    {shgs.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.marathiName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">भेटीचा उद्देश (Purpose) *</label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value as FieldVisit['purpose'])}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="नियमित मासिक सभा तपासणी">नियमित मासिक सभा तपासणी</option>
                  <option value="बँक लिंकेज मार्गदर्शन">बँक लिंकेज मार्गदर्शन</option>
                  <option value="नोंदवह्या व हिशोब तपासणी">नोंदवह्या व हिशोब तपासणी</option>
                  <option value="उपजीविका पाहणी (Livelihood Visit)">उपजीविका पाहणी (Livelihood Visit)</option>
                  <option value="लखपती दीदी सर्वेक्षण">लखपती दीदी सर्वेक्षण</option>
                  <option value="वाद निवारण">वाद निवारण</option>
                </select>
              </div>

              {/* GPS Capture Box */}
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-950 text-xs">GPS स्थान व जिओ-टॅगिंग (Geo Tagging)</span>
                  <button
                    type="button"
                    onClick={handleCaptureGPS}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <MapPinIcon className="w-3.5 h-3.5" />
                    <span>{isGettingGPS ? 'GPS शोधत आहे...' : 'चालू स्थान घ्या (Live GPS)'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono text-gray-700 bg-white p-2 rounded-xl border border-rose-100 flex justify-between">
                  <span>Lat: {gpsLat}</span>
                  <span>Lng: {gpsLng}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">पाहणी नोंदी व निरीक्षण (Observations) *</label>
                <textarea
                  rows={2}
                  required
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">भेट दिनांक (Visit Date)</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={e => setVisitDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">गट गुणवत्ता श्रेणी (Grade)</label>
                  <select
                    value={ratingGrade}
                    onChange={e => setRatingGrade(e.target.value as FieldVisit['ratingGrade'])}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="उत्कृष्ट (Grade A)">उत्कृष्ट (Grade A)</option>
                    <option value="मध्यम (Grade B)">मध्यम (Grade B)</option>
                    <option value="सुधारणा हवी (Grade C)">सुधारणा हवी (Grade C)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">भेटीचे ठिकाण / पत्ता (Location Address)</label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={e => setLocationAddress(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">पुढील कृती योजना (Action Items)</label>
                <input
                  type="text"
                  value={actionItems}
                  onChange={e => setActionItems(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewVisitModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white rounded-xl font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>भेट जतन करा (Save Visit)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Field Visit Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={visitToDelete !== null}
        onClose={() => setVisitToDelete(null)}
        onConfirm={() => {
          if (visitToDelete) {
            deleteFieldVisit(visitToDelete.id);
            setVisitToDelete(null);
          }
        }}
        title="क्षेत्रीय भेट नोंद हटवा (Delete Field Visit)"
        itemName={`${visitToDelete?.villageName || ''} - ${visitToDelete?.purpose || ''} (दिनांक: ${visitToDelete?.visitDate || ''})`}
        itemType="क्षेत्रीय भेट नोंद"
        warningMessage="ही GPS क्षेत्रीय भेट नोंद सिस्टीममधून काढून टाकली जाईल."
      />
    </div>
  );
};
