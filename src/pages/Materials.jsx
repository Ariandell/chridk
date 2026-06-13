import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, AlertCircle, ArrowRight, CheckCircle2, XCircle, Menu, X, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

import topicsData from '../data/topics.json';
import materialsData from '../data/materials.json';
import topicsOldData from '../data/topics_old.json';
import materialsOldData from '../data/materials_old.json';
import { getMaterialProgress, saveMaterialProgress } from '../utils/history';
import DeepSeekAssistant from '../components/DeepSeekAssistant';

const preprocessLatex = (text) => {
  if (!text) return "";
  return text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$').replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
};

const Materials = () => {
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState({});
  const [selectedSubject, setSelectedSubject] = useState('efvv_it');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  
  // Interactive Block States
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (window.innerWidth <= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const scrollRef = useRef(null);

  useEffect(() => {
    let combinedTopics = [...(Array.isArray(topicsData) ? topicsData : [])];
    const matMap = {};

    if (Array.isArray(materialsData)) {
      materialsData.forEach(mat => {
        // Fallback for old content format
        if (mat.blocks) {
          matMap[mat.id] = mat.blocks;
        } else if (mat.content) {
          matMap[mat.id] = [{ title: mat.title, content: mat.content, tests: [] }];
        }
      });
    }

    if (Array.isArray(topicsOldData) && Array.isArray(materialsOldData)) {
      const oldItTopics = topicsOldData.filter(t => t.subjectId === 'efvv_it' || !t.subjectId);
      
      oldItTopics.forEach(oldTopic => {
        const oldMat = materialsOldData.find(m => m.id === oldTopic.id);
        if (oldMat && oldMat.blocks && oldMat.blocks.length > 0) {
          const newId = `old_${oldTopic.id}`;
          
          combinedTopics.push({
            ...oldTopic,
            id: newId,
            title: `(Дод.) ${oldTopic.title}`,
            description: `⚠️ Це додатковий матеріал із попередньої версії курсу. Деякі питання можуть не повністю збігатися з новою деталізованою програмою ЄФВВ.\n\n${oldTopic.description}`
          });
          
          matMap[newId] = oldMat.blocks;
        }
      });
    }

    setTopics(combinedTopics);
    setMaterials(matMap);
  }, []);

  useEffect(() => {
    if (topics.length > 0) {
      const filtered = topics.filter(t => (t.subjectId || 'efvv_it') === selectedSubject);
      if (filtered.length > 0) {
        // If the currently selected topic is not in the filtered list, switch to the first available
        if (!filtered.find(t => t.id === selectedTopicId)) {
          const firstId = filtered[0].id;
          setSelectedTopicId(firstId);
          const progress = getMaterialProgress();
          setCurrentBlockIndex(progress[firstId] || 0);
          setTestAnswers({});
          setShowResults(false);
          setRetryCount(0);
          setShowHints(false);
        }
      } else {
        setSelectedTopicId(null);
      }
    }
  }, [selectedSubject, topics, selectedTopicId]);



  const handleTopicSelect = (id) => {
    setSelectedTopicId(id);
    const progress = getMaterialProgress();
    setCurrentBlockIndex(progress[id] || 0);
    setTestAnswers({});
    setShowResults(false);
    setRetryCount(0);
    setShowHints(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNextBlock = () => {
    const nextIndex = currentBlockIndex + 1;
    setCurrentBlockIndex(nextIndex);
    saveMaterialProgress(selectedTopicId, nextIndex);
    setTestAnswers({});
    setShowResults(false);
    setRetryCount(0);
    setShowHints(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setTestAnswers({});
    setShowResults(false);
  };

  const handleOptionSelect = (testIndex, optionId) => {
    if (showResults) return;
    setTestAnswers(prev => ({ ...prev, [testIndex]: optionId }));
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const blocks = selectedTopicId ? materials[selectedTopicId] : null;
  const currentBlock = blocks ? blocks[currentBlockIndex] : null;

  // Check if all tests in current block are answered
  const allTestsAnswered = currentBlock && currentBlock.tests && currentBlock.tests.length > 0 
    ? currentBlock.tests.every((_, idx) => testAnswers[idx])
    : true;

  // Calculate score for current block
  let correctCount = 0;
  const testCount = currentBlock?.tests?.length || 0;
  if (showResults && currentBlock && currentBlock.tests) {
    currentBlock.tests.forEach((test, idx) => {
      if (testAnswers[idx] === test.answer) correctCount++;
    });
  }

  const passThreshold = testCount; // 100% required
  const isPassed = testCount === 0 || correctCount >= passThreshold;
  const shouldRevealAnswers = showResults && (isPassed || showHints);

  const filteredTopics = topics.filter(t => (t.subjectId || 'efvv_it') === selectedSubject);

  return (
    <div className="container materials-layout" style={{ display: 'flex', gap: '2rem', marginTop: '2rem', height: 'calc(100vh - 120px)', position: 'relative' }}>
      
      {/* Mobile Toggle Button */}
      <button 
        className="btn btn-primary clip-diagonal mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        style={{
          position: 'absolute',
          top: '-1rem',
          left: '0',
          zIndex: 100,
          display: window.innerWidth > 768 ? 'none' : 'flex'
        }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        <span style={{ marginLeft: '0.5rem' }}>Теми</span>
      </button>

      {/* Sidebar */}
      <div className={`glass-panel materials-sidebar ${isSidebarOpen ? 'open' : 'closed'}`} style={{ 
        width: isSidebarOpen ? (window.innerWidth > 768 ? '300px' : '100%') : '0', 
        opacity: isSidebarOpen ? 1 : 0,
        pointerEvents: isSidebarOpen ? 'auto' : 'none',
        flexShrink: 0, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem', 
        padding: isSidebarOpen ? '1.5rem' : '0',
        transition: 'all 0.3s ease',
        position: window.innerWidth > 768 ? 'relative' : 'absolute',
        zIndex: 90,
        height: window.innerWidth > 768 ? 'auto' : 'calc(100% - 3rem)',
        top: window.innerWidth > 768 ? '0' : '3rem',
        left: 0,
        background: 'var(--bg-secondary)',
        borderWidth: isSidebarOpen ? '3px' : '0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, color: 'var(--accent-primary)', fontSize: '1.5rem', textTransform: 'uppercase' }}>
            <BookOpen size={24} /> Теми
          </h2>
          {window.innerWidth > 768 && (
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Subject Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            className={`btn ${selectedSubject === 'efvv_it' ? 'btn-primary' : 'btn-secondary'} clip-sharp`} 
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
            onClick={() => setSelectedSubject('efvv_it')}
          >
            ІТ (ЄФВВ)
          </button>
          <button 
            className={`btn ${selectedSubject === 'tznk' ? 'btn-primary' : 'btn-secondary'} clip-sharp`} 
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
            onClick={() => setSelectedSubject('tznk')}
          >
            Логіка (ТЗНК)
          </button>
        </div>
        
        {filteredTopics.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Теми ще не згенеровані для цього предмета.
          </div>
        ) : (
          filteredTopics.map(topic => (
            <button
              key={topic.id}
              className={`btn ${selectedTopicId === topic.id ? 'btn-primary' : 'btn-secondary'} clip-diagonal`}
              style={{
                textAlign: 'left',
                padding: '0.8rem 1rem',
                fontSize: '1rem',
                justifyContent: 'flex-start',
                whiteSpace: 'normal',
                height: 'auto',
                lineHeight: '1.4',
                flexShrink: 0
              }}
              onClick={() => handleTopicSelect(topic.id)}
            >
              <div style={{ fontWeight: 'bold' }}>{topic.title}</div>
            </button>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel materials-content" ref={scrollRef} style={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        padding: window.innerWidth > 768 ? '2.5rem' : '1.5rem',
        paddingTop: window.innerWidth > 768 ? '2.5rem' : '3.5rem',
        position: 'relative',
        display: window.innerWidth <= 768 && isSidebarOpen ? 'none' : 'block'
      }}>
        
        {/* Desktop Open Sidebar Button (if closed) */}
        {window.innerWidth > 768 && !isSidebarOpen && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsSidebarOpen(true)}
            style={{ position: 'absolute', top: '1rem', left: '1rem', padding: '0.5rem', zIndex: 10 }}
            title="Відкрити теми"
          >
            <Menu size={24} />
          </button>
        )}

        {!selectedTopicId ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <BookOpen size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Виберіть тему ліворуч, щоб почати навчання</h3>
          </div>
        ) : !blocks || blocks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <AlertCircle size={64} style={{ marginBottom: '1rem', opacity: 0.5, color: '#f39c12' }} />
            <h3>Матеріали для цієї теми ще генеруються...</h3>
            <p style={{ marginTop: '0.5rem' }}>Скрипт generate_materials.cjs ще не обробив цю тему.</p>
          </div>
        ) : (
          <div className="markdown-body animate-fade-in" key={`${selectedTopicId}-${currentBlockIndex}`} style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              {blocks.map((_, idx) => (
                <div key={idx} style={{ 
                  height: '6px', flexGrow: 1, 
                  background: idx < currentBlockIndex ? 'var(--success)' : idx === currentBlockIndex ? 'var(--accent-primary)' : 'var(--border-color)',
                  borderRadius: '3px'
                }} />
              ))}
            </div>

            <h1 style={{ color: 'var(--accent-primary)', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              {currentBlock.title}
            </h1>
            
            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
              {preprocessLatex(currentBlock.content)}
            </ReactMarkdown>

            <DeepSeekAssistant 
              contextText={currentBlock.content} 
              subjectId={selectedSubject} 
            />

            {/* Block Tests */}
            {currentBlock.tests && currentBlock.tests.length > 0 && (
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '3px dashed var(--border-color)' }}>
                <h2 style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={24} /> Перевірка знань
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                  Закріпіть щойно прочитаний матеріал перед тим, як рухатись далі.
                </p>

                {currentBlock.tests.map((test, idx) => (
                  <div key={idx} className="explanation-panel" style={{ marginBottom: '1.5rem', borderColor: showResults && testAnswers[idx] === test.answer ? 'var(--success)' : showResults && testAnswers[idx] !== test.answer ? 'var(--error)' : 'var(--border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                      <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                        {preprocessLatex(`${idx + 1}. ${test.question}`)}
                      </ReactMarkdown>
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {test.options.map(opt => {
                        const isSelected = testAnswers[idx] === opt.id;
                        let btnClass = "btn btn-secondary";
                        
                        if (shouldRevealAnswers) {
                          if (opt.id === test.answer) btnClass += " correct";
                          else if (isSelected) btnClass += " wrong";
                        } else if (isSelected) {
                          btnClass += " selected";
                        }

                        return (
                          <button 
                            key={opt.id}
                            className={btnClass}
                            style={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', height: 'auto', textTransform: 'none' }}
                            onClick={() => handleOptionSelect(idx, opt.id)}
                            disabled={showResults}
                          >
                            <span style={{ fontWeight: 'bold', marginRight: '0.5rem', color: showResults && opt.id === test.answer ? '#fff' : 'inherit' }}>{opt.id}:</span> 
                            <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]} components={{p: React.Fragment}}>
                              {preprocessLatex(opt.text)}
                            </ReactMarkdown>
                          </button>
                        );
                      })}
                    </div>

                    {shouldRevealAnswers && (
                      <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderLeft: `4px solid ${testAnswers[idx] === test.answer ? 'var(--success)' : 'var(--error)'}` }}>
                        <strong style={{ color: testAnswers[idx] === test.answer ? 'var(--success)' : 'var(--error)' }}>
                          {testAnswers[idx] === test.answer ? '✅ Правильно!' : `❌ Неправильно. Правильна відповідь: ${test.answer}`}
                        </strong>
                        <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                          <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                            {preprocessLatex(test.explanation)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {!showResults ? (
                  <button 
                    className="btn btn-primary clip-diagonal" 
                    style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                    onClick={checkAnswers}
                    disabled={!allTestsAnswered}
                  >
                    Перевірити відповіді
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <div style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontWeight: 'bold', color: isPassed ? 'var(--success)' : 'var(--error)' }}>
                      Ви відповіли правильно на {correctCount} з {testCount} питань.
                      {!isPassed && <div style={{ fontSize: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Для переходу далі потрібно відповісти правильно на всі питання (100%).</div>}
                    </div>
                    
                    {!isPassed ? (
                      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary clip-diagonal" onClick={handleRetry} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                          Спробувати ще раз <RefreshCw style={{ marginLeft: '0.5rem' }} size={18} />
                        </button>
                        {retryCount >= 2 && !showHints && (
                          <button className="btn btn-secondary clip-diagonal" onClick={() => setShowHints(true)} style={{ fontSize: '1.2rem', padding: '1rem 2rem', opacity: 0.8, borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}>
                            Показати підказки
                          </button>
                        )}
                      </div>
                    ) : currentBlockIndex < blocks.length - 1 ? (
                      <button className="btn btn-primary clip-diagonal" onClick={handleNextBlock} style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                        Наступний блок <ArrowRight style={{ marginLeft: '0.5rem' }} />
                      </button>
                    ) : (
                      <div style={{ padding: '2rem', background: 'var(--success-bg)', border: '2px solid var(--success)', color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                        🎉 Тему повністю пройдено! Оберіть наступну тему зліва.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(!currentBlock.tests || currentBlock.tests.length === 0) && currentBlockIndex < blocks.length - 1 && (
              <button className="btn btn-primary clip-diagonal" onClick={handleNextBlock} style={{ marginTop: '2rem', fontSize: '1.2rem', padding: '1rem 2rem' }}>
                Наступний блок <ArrowRight style={{ marginLeft: '0.5rem' }} />
              </button>
            )}
            
            {(!currentBlock.tests || currentBlock.tests.length === 0) && currentBlockIndex === blocks.length - 1 && (
              <div style={{ marginTop: '2rem', padding: '2rem', background: 'var(--success-bg)', border: '2px solid var(--success)', color: 'var(--success)', fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
                🎉 Тему повністю пройдено! Оберіть наступну тему зліва.
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;
