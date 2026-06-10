import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <header className="app-header">
      <div className="container header-content" style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="logo">
          <BookOpen className="logo-icon" size={28} />
          <span>EduTest <span className="text-gradient">Pro</span></span>
        </Link>
        <div id="header-portal-target" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: 'auto' }}>
          {/* Exam controls will portal here */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
