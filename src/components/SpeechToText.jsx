import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Globe, CheckCircle } from 'lucide-react';
import './SpeechToText.css';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', flag: '🇮🇳' },
  { code: 'hi-IN', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn-IN', label: 'বাংলা', flag: '🇮🇳' },
];

export default function SpeechToText({ onTranscript, placeholder = 'Click mic to describe your problem...', className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [interimText, setInterimText] = useState('');
  const [supported, setSupported] = useState(true);
  const [success, setSuccess] = useState(false);
  const recognitionRef = useRef(null);
  const [showLangs, setShowLangs] = useState(false);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSupported(false);
    }
  }, []);

  const startListening = () => {
    if (!supported) {
      alert('Voice input is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    try {
      // Stop previous instance if any
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang.code;
      recognition.continuous = false; // Prevents duplicate events accumulation
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimText(interim);

        if (final.trim()) {
          onTranscript(final.trim());
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2000);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('STT Start Error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimText('');
  };

  return (
    <div className={`stt-container ${className}`}>
      <div className="stt-toolbar">
        {/* Language Selector */}
        <div className="stt-lang-wrap">
          <button 
            type="button" 
            className="stt-lang-trigger" 
            onClick={() => setShowLangs(!showLangs)}
            title="Select Speech Language"
          >
            <Globe size={14} />
            <span>{selectedLang.flag} {selectedLang.label}</span>
          </button>
          {showLangs && (
            <div className="stt-lang-dropdown">
              {LANGUAGES.map(lang => (
                <button
                  type="button"
                  key={lang.code}
                  className={`stt-lang-option ${selectedLang.code === lang.code ? 'active' : ''}`}
                  onClick={() => { setSelectedLang(lang); setShowLangs(false); }}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mic Button */}
        <button
          type="button"
          className={`stt-mic-btn ${isListening ? 'listening' : ''} ${!supported ? 'disabled' : ''}`}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? 'Stop recording' : `Speak in ${selectedLang.label}`}
        >
          <div className={`stt-mic-ring ${isListening ? 'active' : ''}`} />
          {success ? <CheckCircle size={20} /> : isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      {/* Soundwave animation when listening */}
      {isListening && (
        <div className="stt-listening-indicator">
          <div className="stt-waves">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="stt-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span className="stt-listening-text">
            Listening in {selectedLang.label}...
            {interimText && <em className="stt-interim"> "{interimText}"</em>}
          </span>
        </div>
      )}

      {!supported && (
        <p className="stt-unsupported">⚠️ Voice input requires Google Chrome or Edge. Please type instead.</p>
      )}
    </div>
  );
}

