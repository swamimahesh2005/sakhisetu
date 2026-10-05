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

export function startSpeechRecognition(
  onResult: (text: string) => void,
  onError?: (err: any) => void
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('आपल्या ब्राउझरमध्ये व्हॉईस इनपुट सपोर्ट उपलब्ध नाही (Speech recognition is not supported in this browser). कृपया टाईप करा.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'mr-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  try {
    recognition.start();
  } catch (e) {
    console.error(e);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  };
}
