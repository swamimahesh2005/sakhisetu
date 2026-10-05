'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/export-helpers';
import { startSpeechRecognition } from '@/lib/voice-assistant';
import { MicIcon, VolumeUpIcon, XIcon, SparklesIcon } from './icons';

interface VoiceAssistantModalProps {
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ onClose }) => {
  const { shgs, members, loans, savings, meetings, speakText } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState<string>(
    'नमस्ते ताई! मी सखीसेतू व्हॉईस सहाय्यक आहे. बचत, कर्ज, सभा किंवा सदस्यांविषयी विचारा.'
  );

  const sampleQueries = [
    'सावित्रीबाई फुले बचत गटाची एकूण बचत सांगा',
    'आनंदी जाधव यांच्या कर्जाची माहिती द्या',
    'आज कोणती मासिक सभा नियोजित आहे?',
    'लखपती दीदी महिलांची नावे सांगा'
  ];

  const handleQuery = (queryText: string) => {
    setTranscript(queryText);
    const q = queryText.toLowerCase();

    let reply = '';

    if (q.includes('सावित्रीबाई') || q.includes('बचत')) {
      const shg = shgs.find(s => s.id === 'shg_savitribai');
      const total = shg ? shg.totalSavings : 184000;
      reply = `सावित्रीबाई फुले महिला बचत गटाची एकूण बचत ${total} रुपये आहे. या गटामध्ये १२ महिला सदस्य आहेत आणि दरमहा बचत २०० रुपये आहे.`;
    } else if (q.includes('आनंदी') || q.includes('जाधव') || q.includes('कर्ज')) {
      const mem = members.find(m => m.id === 'mem_1');
      reply = `आनंदी रमेश जाधव (अध्यक्षा) यांचे शेळीपालनासाठी २५,००० रुपये कर्ज शिल्लक आहे. त्यांची एकूण जमा बचत १६,८०० रुपये असून त्या लखपती दीदी आहेत.`;
    } else if (q.includes('सभा') || q.includes('बैठक')) {
      reply = `सावित्रीबाई फुले बचत गटाची मासिक सभा १० तारखेला दुपारी २:०० वाजता ग्रामपंचायत सभागृहात आयोजित आहे.`;
    } else if (q.includes('लखपती')) {
      const lakhpatis = members.filter(m => m.lakhpatiDidiStatus === 'साध्य (Achieved)').map(m => m.name).join(', ');
      reply = `आपल्या कार्यक्षेत्रात आनंदी जाधव, रुक्मिणी गायकवाड आणि शारदा मोरे यांनी लखपती दीदीचा ₹१ लाखाचा टप्पा गाठला आहे.`;
    } else {
      reply = `आपण विचारलेला प्रश्न: "${queryText}". एकूण बचत गट संख्या ४ असून सर्व गट सक्रिय आहेत.`;
    }

    setAssistantReply(reply);
    speakText(reply);
  };

  const handleStartMic = () => {
    if (isListening) return;

    setIsListening(true);
    setTranscript('ऐकत आहे... कृपया बोला...');

    const recognition = startSpeechRecognition(
      (text: string) => {
        setIsListening(false);
        handleQuery(text);
      },
      () => {
        setIsListening(false);
        setTranscript('आवाज ऐकू आला नाही. कृपया पुन्हा बोला किंवा खालील प्रश्नावर दाबा.');
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-gradient-to-b from-orange-500 via-amber-600 to-rose-700 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border-2 border-amber-300 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full text-xs font-bold text-amber-200">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>सखीसेतू मराठी व्हॉईस सहाय्यक (Marathi Voice AI)</span>
          </div>

          <h3 className="text-2xl font-black">मराठीत बोला किंवा विचारा</h3>
          <p className="text-xs text-amber-100 max-w-sm mx-auto">
            टायपिंग करण्याची गरज नाही. फक्त मायक्रोफोन बटण दाबून आपल्या भाषेत विचारा.
          </p>

          {/* Big Mic Button with Wave Animation */}
          <div className="py-6 flex justify-center">
            <button
              onClick={handleStartMic}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition transform hover:scale-105 active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white ring-8 ring-rose-300 animate-pulse'
                  : 'bg-white text-orange-700 hover:bg-amber-100 ring-4 ring-white/40'
              }`}
            >
              <MicIcon className="w-10 h-10" />
              <span className="text-[11px] font-black mt-1">
                {isListening ? 'ऐकत आहे...' : 'माईक दाबा'}
              </span>
            </button>
          </div>

          {/* Live Transcript / Status */}
          {transcript && (
            <div className="bg-black/30 p-3 rounded-2xl text-xs font-semibold text-amber-200">
              {transcript}
            </div>
          )}

          {/* Assistant Reply Card */}
          <div className="bg-white text-gray-900 rounded-2xl p-4 text-left shadow-lg border border-amber-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-orange-700">
              <span>🤖 सखीसेतू उत्तर:</span>
              <button
                onClick={() => speakText(assistantReply)}
                className="p-1 text-gray-400 hover:text-orange-600"
                title="पुन्हा ऐका"
              >
                <VolumeUpIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-gray-800 font-medium">{assistantReply}</p>
          </div>

          {/* Quick Marathi Query Prompts */}
          <div className="pt-2 text-left">
            <span className="text-xs font-bold text-amber-100 block mb-2">
              उदाहरणासाठी हे प्रश्न विचारा (Tap to Ask):
            </span>
            <div className="space-y-1.5">
              {sampleQueries.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuery(q)}
                  className="w-full text-left p-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white transition border border-white/20 flex items-center justify-between"
                >
                  <span>🗣️ {q}</span>
                  <span className="text-amber-300 text-[10px]">विचारा →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
