import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import './InitialLanguageModal.css';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', welcome: 'Welcome to Sahakar Seva' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', welcome: 'सहकार सेवा में आपका स्वागत है' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩', welcome: 'সহকার সেবায় স্বাগতম' }
];

export default function InitialLanguageModal() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [tempLang, setTempLang] = useState('en');

  useEffect(() => {
    // If no language is set, show the modal
    if (!language) {
      setIsOpen(true);
    }
  }, [language]);

  const handleConfirm = () => {
    setLanguage(tempLang);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="" hideClose>
      <div className="init-lang-modal">
        <Globe size={48} className="init-lang-icon" />
        <h2>{LANGUAGES.find(l => l.code === tempLang)?.welcome}</h2>
        <p className="text-muted mb-6">Please select your preferred language / कृपया अपनी पसंदीदा भाषा चुनें</p>
        
        <div className="init-lang-grid">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              className={`init-lang-btn ${tempLang === lang.code ? 'active' : ''}`}
              onClick={() => setTempLang(lang.code)}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-label">{lang.label}</span>
            </button>
          ))}
        </div>

        <Button variant="primary" size="lg" className="w-full mt-6" onClick={handleConfirm}>
          Continue / जारी रखें
        </Button>
      </div>
    </Modal>
  );
}
