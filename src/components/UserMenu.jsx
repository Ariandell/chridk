import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { LogOut, User } from 'lucide-react';
import { syncProgressWithCloud } from '../utils/history';

// A simple function to decode the JWT payload
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const UserMenu = () => {
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load user from local storage on mount
    const storedToken = localStorage.getItem('google_token');
    if (storedToken) {
      const decoded = parseJwt(storedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
        // Sync in the background on load
        syncProgressWithCloud(storedToken).then(() => {
           // Optionally dispatch a custom event if we want the UI to update without reload, 
           // but since it's background sync, next navigation will show updated history.
        });
      } else {
        localStorage.removeItem('google_token');
      }
    }
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const decoded = parseJwt(token);
    
    if (decoded) {
      localStorage.setItem('google_token', token);
      setUser(decoded);
      
      // Attempt to sync after login
      setIsSyncing(true);
      try {
        await syncProgressWithCloud(token);
        // Force reload to apply synced data
        window.location.reload();
      } catch (err) {
        console.error('Failed to sync progress:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('google_token');
    setUser(null);
    window.location.reload();
  };

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isSyncing && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Синхронізація...</span>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <img src={user.picture} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{user.given_name || user.name}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }} title="Вийти">
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="google-login-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => {
          console.log('Login Failed');
        }}
        useOneTap
        theme="filled_black"
        shape="pill"
        text="signin_with"
      />
    </div>
  );
};

export default UserMenu;
