'use client';

// Marathi Speech Synthesis & Recognition Helper for Rural Users
export function speakMarathi(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported on this browser');
    return;
  }

  window.speechSynthesis.cancel(); // Stop previous speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'mr-IN'; // Marathi Indian Accent
  utterance.rate = 0.9; // Slightly slower for clarity
  utterance.pitch = 1.0;

  // Find Marathi or Hindi voice if available
  const voices = window.speechSynthesis.getVoices();
  const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.lang.startsWith('hi') || v.lang.includes('India'));
  if (mrVoice) {
    utterance.voice = mrVoice;
  }

  window.speechSynthesis.speak(utterance);
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  [index: number]: {
    [index: number]: SpeechRecognitionResultItem;
  };
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorLike {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export function startSpeechRecognition(
  onResult: (text: string) => void,
  onError?: (err: string) => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const win = window as unknown as WindowWithSpeech;
  const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('आपल्या ब्राउझरमध्ये व्हॉईस इनपुट सपोर्ट उपलब्ध नाही (Speech recognition is not supported in this browser). कृपया टाईप करा.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'mr-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEventLike) => {
    const transcript = event.results[0]?.[0]?.transcript;
    if (transcript) {
      onResult(transcript);
    }
  };

  recognition.onerror = (event: SpeechRecognitionErrorLike) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  try {
    recognition.start();
  } catch (err) {
    console.error('Failed to start speech recognition:', err);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore safely
      }
    }
  };
}
