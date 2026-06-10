import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <div style={{ position: 'sticky', top: '1rem', zIndex: 100, padding: '0 1rem', marginBottom: '2rem' }}>
      <header className="app-header glass-panel" style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '0.8rem 1.5rem', borderRadius: '30px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(217, 15, 35, 0.1)',
        border: '1px solid rgba(217, 15, 35, 0.2)',
        maxWidth: '1200px', margin: '0 auto'
      }}>
        <Link to="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '-0.5px' }}>EduTest <span className="text-gradient">Pro</span></span>
        </Link>
        <div id="header-portal-target" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
          {/* Exam controls will portal here */}
          <UserMenu />
        </div>
      </header>
    </div>
  );
};

export default Header;
