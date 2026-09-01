import { Mic } from 'lucide-react';
import './Input.css';

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  showMic = false,
  onMicClick,
  disabled = false,
  required = false,
  id,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <span className="input-icon-left">
            <Icon size={18} />
          </span>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`input-field ${Icon ? 'has-icon-left' : ''} ${showMic ? 'has-icon-right' : ''}`}
          {...props}
        />
        {showMic && (
          <button
            type="button"
            className="input-mic-btn"
            onClick={onMicClick}
            title="Voice input"
            aria-label="Speak to type"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

export function TextArea({
  label,
  placeholder,
  value,
  onChange,
  error,
  showMic = false,
  onMicClick,
  rows = 4,
  required = false,
  id,
  className = '',
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`input-group ${error ? 'input-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        <textarea
          id={inputId}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          required={required}
          className="input-field textarea-field"
          {...props}
        />
        {showMic && (
          <button
            type="button"
            className="input-mic-btn textarea-mic"
            onClick={onMicClick}
            title="Voice input"
            aria-label="Speak to type"
          >
            <Mic size={18} />
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
