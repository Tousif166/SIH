import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Mic, MicOff, Globe } from 'lucide-react';
import { chatWithSahakarAI } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import './AiChatWidget.css';

const LANGUAGES = [
  { code: 'en-IN', label: 'English', short: 'EN' },
  { code: 'hi-IN', label: 'हिन्दी', short: 'HI' },
  { code: 'bn-IN', label: 'বাংলা', short: 'BN' },
];

const QUICK_PROMPTS = {
  customer: [
    'How do I book a service?',
    'AC filter kab saaf karein?',
    'আমার বিল কত হবে?',
    'Track my booking'
  ],
  worker: [
    'My weekly hour limit?',
    'Overtime bonus kaise milega?',
    'আমার বীমা কখন শুরু হবে?',
    'Apply for emergency leave'
  ],
  admin: ['Demand forecast today', 'Understaffed zones', 'Complaint status']
};

export default function AiChatWidget() {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'model',
      text: 'नमस्ते! 🙏 Hello! আমি Sahakar AI। আপনার সেবায় আছি! I\'m here to help in English, हिन्दी, or বাংলা.',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (open) { setUnread(0); messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }
  }, [open, messages]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang.code;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => setInput(prev => prev + ' ' + e.results[0][0].transcript);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now(), role: 'user', text: input.trim(), time: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const history = newMessages.map(m => ({ role: m.role, text: m.text }));
    const { text } = await chatWithSahakarAI(history, role || 'customer');
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'model', text, time: new Date() }]);
    setLoading(false);
    if (!open) setUnread(prev => prev + 1);
  };

  const handleQuickPrompt = (prompt) => { setInput(prompt); };

  return (
    <>
      {/* Floating Button */}
      <button
        className={`ai-chat-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        title="Sahakar AI Assistant"
      >
        {open ? <X size={22} /> : <Bot size={22} />}
        {!open && unread > 0 && <span className="ai-chat-badge">{unread}</span>}
      </button>

      {/* Chat Window */}
      <div className={`ai-chat-window ${open ? 'visible' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-avatar">
              <Bot size={18} />
              <span className="ai-online-dot" />
            </div>
            <div>
              <h4>Sahakar AI</h4>
              <p>Always online • 3 languages</p>
            </div>
          </div>
          {/* Language selector */}
          <div className="ai-lang-selector">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`ai-lang-btn ${selectedLang.code === lang.code ? 'active' : ''}`}
                onClick={() => setSelectedLang(lang)}
                title={lang.label}
              >
                {lang.short}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`ai-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.role === 'model' && (
                <div className="ai-msg-avatar"><Bot size={14} /></div>
              )}
              <div className="ai-msg-bubble">
                <p>{msg.text}</p>
                <span className="ai-msg-time">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {msg.role === 'user' && (
                <div className="ai-msg-avatar user"><User size={14} /></div>
              )}
            </div>
          ))}
          {loading && (
            <div className="ai-msg bot">
              <div className="ai-msg-avatar"><Bot size={14} /></div>
              <div className="ai-msg-bubble typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length < 3 && (
          <div className="ai-quick-prompts">
            {(QUICK_PROMPTS[role] || QUICK_PROMPTS.customer).map((p, i) => (
              <button key={i} className="ai-quick-btn" onClick={() => handleQuickPrompt(p)}>{p}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-chat-input-row">
          <button
            className={`ai-voice-btn ${isListening ? 'listening' : ''}`}
            onClick={isListening ? stopVoice : startVoice}
            title={`Voice input (${selectedLang.label})`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <input
            type="text"
            className="ai-input"
            placeholder={`Type in ${selectedLang.label}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="ai-send-btn" onClick={sendMessage} disabled={!input.trim() || loading}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
