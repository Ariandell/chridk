import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Import local JSON files
// If they are not generated yet, they might crash on build, so we handle it gracefully if possible.
// In Vite we can import JSON directly, but if it doesn't exist, Vite fails.
// We will assume the user generates them before building.
import topicsData from '../data/topics.json';
import materialsData from '../data/materials.json';

const preprocessLatex = (text) => {
  if (!text) return "";
  return text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$').replace(/\\\[([\s\S]*?)\\\]/g, '$$$$$1$$$$');
};

const Materials = () => {
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState({});
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  useEffect(() => {
    // Load topics
    if (Array.isArray(topicsData)) {
      setTopics(topicsData);
      if (topicsData.length > 0) {
        setSelectedTopicId(topicsData[0].id);
      }
    }

    // Process materials into a map for O(1) lookup
    if (Array.isArray(materialsData)) {
      const matMap = {};
      materialsData.forEach(mat => {
        matMap[mat.id] = mat.content;
      });
      setMaterials(matMap);
    }
  }, []);

  const selectedMaterial = selectedTopicId ? materials[selectedTopicId] : null;

  return (
    <div className="container" style={{ display: 'flex', gap: '2rem', marginTop: '2rem', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar - Topics List */}
      <div className="glass-panel" style={{ width: '300px', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--accent-primary)', fontSize: '1.5rem', textTransform: 'uppercase' }}>
          <BookOpen size={24} /> Теми ЄФВВ
        </h2>
        
        {topics.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Теми ще не згенеровані.
          </div>
        ) : (
          topics.map(topic => (
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
                lineHeight: '1.4'
              }}
              onClick={() => setSelectedTopicId(topic.id)}
            >
              <div style={{ fontWeight: 'bold' }}>{topic.title}</div>
            </button>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ flexGrow: 1, overflowY: 'auto', padding: '2.5rem' }}>
        {!selectedTopicId ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <BookOpen size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>Виберіть тему ліворуч, щоб почати навчання</h3>
          </div>
        ) : !selectedMaterial ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            <AlertCircle size={64} style={{ marginBottom: '1rem', opacity: 0.5, color: '#f39c12' }} />
            <h3>Матеріали для цієї теми ще генеруються...</h3>
            <p style={{ marginTop: '0.5rem' }}>Скрипт generate_materials.cjs ще не обробив цю тему.</p>
          </div>
        ) : (
          <div className="markdown-body" style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '1.1rem' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkMath, remarkGfm]} 
              rehypePlugins={[rehypeKatex]}
            >
              {preprocessLatex(selectedMaterial)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default Materials;
