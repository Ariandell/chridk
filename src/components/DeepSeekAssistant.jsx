import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const API_URL = 'https://ws-1c5et31etynaozlt.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions';

const DeepSeekAssistant = ({ currentQuestion, answers, germanExps, subjectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привіт! Я твій AI-помічник DeepSeek. Запитай мене щось про поточне завдання!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context
      const selectedOptionId = answers ? answers[currentQuestion.id] : null;
      const selectedOption = currentQuestion.options.find(o => o.id === selectedOptionId);
      const correctOption = currentQuestion.options.find(o => o.isCorrect);
      
      let contextStr = `Ось поточне питання з тесту (${subjectId}):\n`;
      contextStr += `Текст питання: ${currentQuestion.text}\n\n`;
      contextStr += `Варіанти:\n`;
      currentQuestion.options.forEach(o => {
        contextStr += `- ${o.id}: ${o.text}\n`;
      });
      contextStr += `\nПравильна відповідь: ${correctOption ? correctOption.id : 'Невідомо'}\n`;
      
      if (selectedOption) {
        contextStr += `Користувач обрав варіант: ${selectedOption.id}\n`;
      } else {
        contextStr += `Користувач ще не обрав варіант.\n`;
      }

      if (germanExps && germanExps[currentQuestion.id]) {
         contextStr += `Ось офіційні пояснення: ${JSON.stringify(germanExps[currentQuestion.id])}\n`;
      }

      const systemPrompt = `Ти розумний помічник-репетитор з ІТ. Відповідай коротко, стильно та по суті (українською мовою). Ось контекст поточного питання на екрані користувача:\n${contextStr}`;

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
            ...messages.filter(m => m.role !== 'assistant' || m.text !== 'Привіт! Я твій AI-помічник DeepSeek. Запитай мене щось про поточне завдання!').map(m => ({
              role: m.role,
              content: m.text
            })),
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      const modelReply = data.choices?.[0]?.message?.content || 'Вибач, я втратив зв\'язок з сервером.';

      setMessages(prev => [...prev, { role: 'assistant', text: modelReply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Помилка підключення до API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        className="btn btn-primary clip-diagonal"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex', padding: '0.5rem 1rem', gap: '0.5rem', background: 'var(--accent-secondary)', borderColor: 'var(--accent-secondary)' }}
      >
        <Sparkles size={18} /> <span className="deepseek-btn-text">DEEPSEEK</span>
      </button>

      {isOpen && createPortal(
        <div className="deepseek-window">
          <div className="deepseek-header" style={{
            background: 'var(--accent-primary)', color: 'white', padding: '1rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '2px solid var(--text-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900' }}>
              <Bot size={24} /> DEEPSEEK NAVIGATOR
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <div className="deepseek-messages" style={{
            flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem',
            background: 'var(--bg-primary)'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start', gap: '0.5rem'
              }}>
                <div className="clip-badge" style={{
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.role === 'user' ? 'var(--text-primary)' : 'var(--accent-primary)',
                  color: msg.role === 'user' ? 'var(--bg-primary)' : 'white', flexShrink: 0
                }}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className="clip-diagonal" style={{
                  background: msg.role === 'user' ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  padding: '0.75rem', border: '2px solid', borderColor: msg.role === 'user' ? 'var(--text-primary)' : 'var(--accent-primary)',
                  maxWidth: '80%', fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'pre-wrap'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                DeepSeek аналізує...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{
            display: 'flex', borderTop: '2px solid var(--border-color)', background: 'var(--bg-secondary)'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Запитати..."
              style={{
                flex: 1, padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)',
                fontFamily: 'Montserrat', fontWeight: '600', outline: 'none'
              }}
            />
            <button type="submit" disabled={isLoading || !input.trim()} style={{
              padding: '0 1rem', background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer',
              opacity: (isLoading || !input.trim()) ? 0.5 : 1
            }}>
              <Send size={24} />
            </button>
          </form>
        </div>,
        document.body
      )}
    </>
  );
};

export default DeepSeekAssistant;
