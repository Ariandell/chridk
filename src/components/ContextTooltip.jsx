import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const API_BASE_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://ws-1c5et31etynaozlt.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1';
const API_URL = `${API_BASE_URL}/chat/completions`;

const ContextTooltip = () => {
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    word: '',
    explanation: '',
    isLoading: false,
    error: null
  });
  
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleMouseUp = async (e) => {
      // Don't trigger if clicking inside the tooltip itself
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) {
        return;
      }
      
      // If clicking outside, close tooltip
      if (tooltipState.visible) {
        setTooltipState(prev => ({ ...prev, visible: false }));
        return;
      }

      // Ignore clicks on interactive elements like buttons, links, etc.
      if (e.target.closest('button, a, input, select, textarea, .btn')) {
        return;
      }

      // We only care about normal clicks without selection dragging
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        // If user highlighted text intentionally, let's not override TranslatorTooltip
        return;
      }

      // Use caretRangeFromPoint to find the word under the cursor
      let range;
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }

      if (!range || range.startContainer.nodeType !== Node.TEXT_NODE) return;

      const textNode = range.startContainer;
      const text = textNode.textContent;
      const offset = range.startOffset;

      // Find word boundaries
      let start = offset;
      let end = offset;

      // Regex for word characters (including Cyrillic)
      const isWordChar = (char) => /[\wА-ЩЬЮЯҐЄІЇа-щьюяґєії]/.test(char);

      if (!text[offset] || !isWordChar(text[offset])) return; // Didn't click on a word

      while (start > 0 && isWordChar(text[start - 1])) start--;
      while (end < text.length && isWordChar(text[end])) end++;

      const clickedWord = text.substring(start, end);
      if (clickedWord.length < 2) return; // Too short to explain

      // Get context (extract around 150 chars from the paragraph)
      const fullParagraph = textNode.parentElement.textContent || '';
      const paraIndex = fullParagraph.indexOf(clickedWord);
      let contextStr = fullParagraph;
      if (contextStr.length > 300) {
         const ctxStart = Math.max(0, paraIndex - 150);
         const ctxEnd = Math.min(contextStr.length, paraIndex + clickedWord.length + 150);
         contextStr = "..." + contextStr.substring(ctxStart, ctxEnd) + "...";
      }

      // Show tooltip in loading state
      const x = e.pageX;
      const y = e.pageY;
      
      setTooltipState({
        visible: true,
        x,
        y,
        word: clickedWord,
        explanation: '',
        isLoading: true,
        error: null
      });

      // Fetch explanation from DeepSeek
      try {
        const systemPrompt = `Ти розумний ІТ-помічник. Поясни термін або поняття "${clickedWord}" в заданому контексті. Відповідь має бути дуже короткою (1-2 речення), зрозумілою та українською мовою. Контекст:\n"${contextStr}"`;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-v4-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Що таке ${clickedWord}?` }
            ],
            temperature: 0.3
          })
        });

        if (!response.ok) throw new Error('API Error');
        
        const data = await response.json();
        const explanation = data.choices?.[0]?.message?.content || 'Не вдалося отримати пояснення.';
        
        setTooltipState(prev => ({
          ...prev,
          explanation,
          isLoading: false
        }));
      } catch (err) {
        setTooltipState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Помилка завантаження'
        }));
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [tooltipState.visible]);

  if (!tooltipState.visible) return null;

  return createPortal(
    <div 
      ref={tooltipRef}
      className="context-tooltip-overlay"
      style={{
        left: Math.min(tooltipState.x, window.innerWidth - 320),
        top: tooltipState.y + 15,
      }}
    >
      <div className="context-tooltip-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} /> <span>{tooltipState.word}</span>
        </span>
        <button 
          onClick={() => setTooltipState(prev => ({ ...prev, visible: false }))}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>
      <div className="context-tooltip-body">
        {tooltipState.isLoading ? (
          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>DeepSeek аналізує...</span>
        ) : tooltipState.error ? (
          <span style={{ color: 'var(--error)' }}>{tooltipState.error}</span>
        ) : (
          <ReactMarkdown>{tooltipState.explanation}</ReactMarkdown>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ContextTooltip;
