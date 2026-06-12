import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { User, Activity, AlertCircle, Clock, BookOpen, CheckCircle } from 'lucide-react';

const Admin = () => {
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by most recently active if possible
        users.sort((a, b) => {
          const syncA = a.profile?.lastSync || '';
          const syncB = b.profile?.lastSync || '';
          return syncB.localeCompare(syncA);
        });
        
        setUsersData(users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err.message || 'Помилка доступу. Можливо, Firebase Rules забороняють читання.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Ніколи';
    const d = new Date(dateStr);
    return d.toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="card text-center" style={{ marginTop: '2rem' }}>
        <Activity className="mx-auto mb-3" style={{ animation: 'spin 1s linear infinite' }} />
        <h2>Завантаження бази користувачів...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ marginTop: '2rem', borderLeft: '4px solid var(--error-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--error-color)', marginBottom: '1rem' }}>
          <AlertCircle size={24} />
          <h2 style={{ margin: 0 }}>Помилка доступу</h2>
        </div>
        <p>{error}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Щоб виправити це, зайдіть у Firebase Console &rarr; Firestore Database &rarr; Rules і переконайтеся, що ви дозволили читання колекції <code>users</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page animate-fade-in" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Панель адміністратора</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Результати всіх зареєстрованих користувачів</p>
        </div>
        <div className="stat-card" style={{ padding: '0.8rem 1.5rem', background: 'var(--bg-secondary)', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <User size={24} color="var(--accent-primary)" />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{usersData.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Користувачів</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {usersData.length === 0 ? (
          <div className="card text-center">Немає зареєстрованих користувачів з історією.</div>
        ) : (
          usersData.map(user => {
            const profile = user.profile || { displayName: 'Анонімний користувач (' + user.id.slice(0,6) + '...)', email: 'Немає email' };
            const history = user.history || [];
            
            // Calculate stats
            const totalTests = history.length;
            const avgScore = totalTests > 0 
              ? Math.round(history.reduce((acc, h) => acc + (h.score || 0), 0) / totalTests) 
              : 0;
            
            return (
              <div key={user.id} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  {profile.photoURL ? (
                    <img src={profile.photoURL} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={24} color="var(--text-secondary)" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {profile.displayName}
                      {profile.email && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({profile.email})</span>}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={12} /> Остання активність: {formatDate(profile.lastSync)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'right' }}>
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>{totalTests}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Тестів</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{avgScore}%</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Сер. бал</div>
                    </div>
                  </div>
                </div>

                {history.length > 0 ? (
                  <div className="history-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                    {history.slice().reverse().map(item => (
                      <div key={item.id} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{formatDate(item.date)}</div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <BookOpen size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
                          <span>{item.title}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px dashed var(--border-color)' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Питань: {item.totalAnswered}/{item.totalQuestions}</span>
                          <span style={{ fontWeight: 'bold', color: item.score >= 70 ? 'var(--success-color)' : item.score >= 40 ? 'var(--warning-color)' : 'var(--error-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={14} /> {item.score}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>Немає історї тестів</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Admin;
