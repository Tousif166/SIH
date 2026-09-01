import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' }
];

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === (language || 'en'));

  return (
    <div className="lang-switcher">
      <button
        className="lang-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch language"
      >
        <Globe size={16} />
        {!compact && <span>{currentLang?.flag} {currentLang?.label}</span>}
        {compact && <span>{currentLang?.flag}</span>}
      </button>
      {isOpen && (
        <div className="lang-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`lang-option ${lang.code === (language || 'en') ? 'active' : ''}`}
              onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
