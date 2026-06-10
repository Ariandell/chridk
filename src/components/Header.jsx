import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <div style={{ position: 'sticky', top: '0', zIndex: 100, marginBottom: '2rem' }}>
      <header className="app-header persona-header" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '1rem 2rem', 
        background: '#0f0f14', // Very dark
        borderBottom: '5px solid var(--accent-primary)',
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 98% 100%, 70% 90%, 50% 100%, 30% 90%, 2% 100%, 0 85%)',
        position: 'relative'
      }}>
        {/* Background diagonal stripes effect */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(217, 15, 35, 0.05) 10px, rgba(217, 15, 35, 0.05) 20px)',
          zIndex: -1
        }} />

        <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.8rem', transform: 'rotate(-2deg)' }}>
          <div style={{ 
            background: 'var(--accent-primary)', padding: '0.5rem', 
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <BookOpen size={24} color="#000" style={{ transform: 'rotate(2deg)' }} />
          </div>
          <span style={{ fontSize: '1.8rem', fontWeight: '900', letterSpacing: '1px', color: '#fff', textTransform: 'uppercase', textShadow: '2px 2px 0 var(--accent-primary)' }}>EduTest</span>
        </Link>
        <div id="header-portal-target" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto', transform: 'rotate(1deg)' }}>
          {/* Exam controls will portal here */}
          <UserMenu />
        </div>
      </header>
    </div>
  );
};

export default Header;
