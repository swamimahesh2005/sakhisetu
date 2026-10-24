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
      const shg = shgs.find(s => s.id === 'shg_savitribai') || shgs[0];
      const total = shg ? formatINR(shg.totalSavings) : '१,८४,००० रुपये';
      const recentSavingsTotal = savings.reduce((acc, s) => acc + s.totalAmount, 0);
      reply = `${shg?.marathiName || 'बचत गट'}ची एकूण बचत ${total} आहे. सिस्टीममध्ये आतापर्यंत एकूण ${formatINR(recentSavingsTotal)} रुपयांच्या बचत पावत्या जमा आहेत.`;
    } else if (q.includes('आनंदी') || q.includes('जाधव') || q.includes('कर्ज')) {
      const mem = members.find(m => m.marathiName.includes('आनंदी') || m.name.includes('Anandi')) || members[0];
      const memLoans = loans.filter(l => l.memberId === mem?.id);
      const loanSum = memLoans.reduce((acc, l) => acc + l.remainingPrincipal, 0);
      reply = `${mem?.marathiName || 'आनंदी जाधव'} यांचे शिल्लक कर्ज ${formatINR(loanSum || mem?.activeLoanAmount || 25000)} आहे. त्यांची एकूण जमा बचत ${formatINR(mem?.totalSaved || 16800)} असून त्या लखपती दीदी आहेत.`;
    } else if (q.includes('सभा') || q.includes('बैठक')) {
      const nextMeeting = meetings[0];
      reply = nextMeeting
        ? `${nextMeeting.shgName}ची मासिक सभा ${nextMeeting.meetingDate} रोजी ${nextMeeting.meetingTime} वाजता ${nextMeeting.venue} येथे नियोजित आहे.`
        : `सावित्रीबाई फुले बचत गटाची मासिक सभा १० तारखेला दुपारी २:०० वाजता ग्रामपंचायत सभागृहात आयोजित आहे.`;
    } else if (q.includes('लखपती')) {
      const lakhpatis = members
        .filter(m => m.lakhpatiDidiStatus === 'साध्य (Achieved)')
        .map(m => m.marathiName.split('(')[0].trim())
        .join(', ');
      reply = lakhpatis
        ? `आपल्या कार्यक्षेत्रात ${lakhpatis} यांनी लखपती दीदीचा ₹१ लाखाचा टप्पा गाठला आहे.`
        : `आपल्या कार्यक्षेत्रात ४८ महिला लखपती दीदी बनण्याच्या प्रक्रियेत आहेत.`;
    } else {
      reply = `आपण विचारलेला प्रश्न: "${queryText}". एकूण बचत गट संख्या ${shgs.length} असून सर्व गट सक्रिय आहेत.`;
    }

    setAssistantReply(reply);
    speakText(reply);
  };

  const handleStartMic = () => {
    if (isListening) return;

    setIsListening(true);
    setTranscript('ऐकत आहे... कृपया बोला...');

    const activeRec = startSpeechRecognition(
      (text: string) => {
        setIsListening(false);
        handleQuery(text);
      },
      () => {
        setIsListening(false);
        setTranscript('आवाज ऐकू आला नाही. कृपया पुन्हा बोला किंवा खालील प्रश्नावर दाबा.');
      }
    );

    if (!activeRec) {
      setIsListening(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-gradient-to-b from-orange-500 via-amber-600 to-rose-700 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border-2 border-amber-300 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            <SparklesIcon className="w-4 h-4 text-amber-200" />
            <span>ग्रामीण महिला AI व्हॉईस सहाय्यक</span>
          </div>
          <h3 className="text-2xl font-black">सखी व्हॉईस असिस्टंट</h3>
          <p className="text-xs text-orange-100">
            मराठीत बोला आणि बचत, कर्ज, सभा व योजनांची माहिती क्षणात ऐका.
          </p>
        </div>

        {/* Big Mic Button */}
        <div className="flex flex-col items-center justify-center my-6">
          <button
            onClick={handleStartMic}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl border-4 transition transform hover:scale-105 active:scale-95 ${
              isListening
                ? 'bg-rose-600 border-white animate-pulse'
                : 'bg-white text-orange-600 border-amber-200 hover:bg-amber-50'
            }`}
          >
            <MicIcon className={`w-10 h-10 ${isListening ? 'text-white' : 'text-orange-600'}`} />
          </button>
          <span className="text-xs font-black mt-2 tracking-wide uppercase">
            {isListening ? '🎙️ ऐकत आहे... (Listening)' : 'येथे दाबून बोला (Tap & Speak)'}
          </span>
        </div>

        {/* Live Transcript / Reply Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-3">
          {transcript && (
            <div className="text-xs border-b border-white/15 pb-2">
              <span className="text-amber-200 font-bold block text-[10px] uppercase">आपण बोललेले:</span>
              <p className="font-bold text-white mt-0.5">{transcript}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-amber-200">
              <span>सखीचे उत्तर (AI Reply):</span>
              <button
                onClick={() => speakText(assistantReply)}
                className="flex items-center gap-1 hover:text-white transition"
              >
                <VolumeUpIcon className="w-3.5 h-3.5" />
                <span>पुन्हा ऐका</span>
              </button>
            </div>
            <p className="text-sm font-semibold mt-1 leading-relaxed text-amber-50">
              {assistantReply}
            </p>
          </div>
        </div>

        {/* Suggested Queries */}
        <div className="mt-5 space-y-2">
          <span className="text-[11px] font-bold text-amber-100 uppercase tracking-wide block">
            किंवा या प्रश्नांवर क्लिक करा (Quick Questions):
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuery(q)}
                className="text-left text-xs bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl border border-white/15 transition font-medium flex items-center justify-between group"
              >
                <span>&ldquo;{q}&rdquo;</span>
                <span className="opacity-0 group-hover:opacity-100 transition text-amber-300">➔</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
