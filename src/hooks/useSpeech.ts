import { useState, useCallback, useEffect } from 'react';

// Extend window object for speech recognition
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Listen to speech synthesis state changes
    const synth = window.speechSynthesis;
    if (!synth) return;

    const interval = setInterval(() => {
      setIsSpeaking(synth.speaking);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const startListening = useCallback(
    (onResult: (_text: string) => void, onError?: (_err: unknown) => void) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        onError?.(new Error('Speech recognition not supported in this browser.'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Default to English/Pidgin processing (en-NG)
      recognition.lang = 'en-NG';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResult(text);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        onError?.(event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch (e) {
        onError?.(e);
        setIsListening(false);
      }
    },
    []
  );

  const speak = useCallback((text: string, languageCode: string = 'en') => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map internal languages to TTS voices
    // Nigerian browser TTS support is mixed, so we fallback to generic english voices 
    // if native voices aren't found for yo, ig, ha.
    const langMap: Record<string, string> = {
      en: 'en-US',
      pidgin: 'en-NG',
      yo: 'yo-NG',
      ig: 'ig-NG',
      ha: 'ha-NG'
    };
    
    utterance.lang = langMap[languageCode] || 'en-US';
    
    // Try to find a matching voice, otherwise let the browser pick
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.startsWith(utterance.lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    isSpeaking,
    startListening,
    speak,
    stopSpeaking
  };
}
