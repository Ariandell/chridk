import { useState, useEffect, useRef } from 'react';
import { Loader2, Languages, X } from 'lucide-react';

const TranslatorTooltip = ({ context, onClose }) => {
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!context || !context.text) return;

    const translateText = async () => {
      setLoading(true);
      setError('');
      setTranslation('');

      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: context.text
          })
        });

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        setTranslation(data.translation || 'Переклад не знайдено');
      } catch (err) {
        setError('Помилка перекладу. Спробуйте ще раз.');
      } finally {
        setLoading(false);
      }
    };

    translateText();
  }, [context?.text]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Use a slight delay so the current click doesn't immediately close it
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!context) return null;

  // Position logic: try to center above the selection
  const style = {
    position: 'absolute',
    left: `${context.x}px`,
    top: `${context.y - 10}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: 1000,
    background: 'var(--bg-secondary)',
    border: '3px solid var(--accent-primary)',
    padding: '12px 16px',
    boxShadow: '8px 8px 0px rgba(0,0,0,1)',
    clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)',
    maxWidth: '300px',
    minWidth: '200px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    animation: 'slideUp 0.2s ease-out'
  };

  return (
    <div ref={tooltipRef} style={style} className="translator-tooltip">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
          <Languages size={14} />
          <span>Переклад</span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
        >
          <X size={14} />
        </button>
      </div>
      
      <div style={{ fontSize: '0.95rem', lineHeight: '1.4', color: 'var(--text-primary)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            <Loader2 size={16} className="animate-spin" />
            Перекладаю...
          </div>
        ) : error ? (
          <span style={{ color: '#ef4444' }}>{error}</span>
        ) : (
          translation
        )}
      </div>
    </div>
  );
};

export default TranslatorTooltip;
