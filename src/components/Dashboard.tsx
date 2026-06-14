import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../App';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface Stats {
  total: {
    total_problems: number;
    correct_answers: number;
    accuracy: number;
  };
  multiplication: {
    total_problems: number;
    correct_answers: number;
    accuracy: number;
  };
  division: {
    total_problems: number;
    correct_answers: number;
    accuracy: number;
  };
  today: {
    problems_solved: number;
    correct_answers: number;
  };
  streak: number;
  badges: Array<{
    id: number;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
  }>;
  points: number;
  currentCorrectStreak: number;
  motivationalMessage: string;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user.id]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/users/${user.id}/stats`);
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error('Kunne ikke hente statistikk:', err);
      setLoading(false);
    }
  };

  const startPractice = (mode: 'practice' | 'test') => {
    // Lagre mode i localStorage
    localStorage.setItem('practiceMode', mode);
    navigate('/select');
  };

  if (loading) {
    return <div className="loading">Laster...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Hei, {user.display_name}!</h1>
          <p className="user-info">
            Klasse {user.grade} • Født {user.birth_year}
          </p>
        </div>
        <button onClick={onLogout} className="btn-secondary">
          Logg ut
        </button>
      </header>

      <div className="action-section" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => startPractice('practice')} className="btn-primary">
            💪 Øving
          </button>
          <button onClick={() => startPractice('test')} className="btn-primary" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            🏆 Test
          </button>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
          Øving: Lær i ditt eget tempo (1 poeng per økt) • Test: Vis hva du kan (poeng basert på resultat)
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{stats?.points || 0}</div>
          <div className="stat-label">Poeng totalt</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats?.total.total_problems || 0}</div>
          <div className="stat-label">Oppgaver løst</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats?.total.accuracy || 0}%</div>
          <div className="stat-label">Nøyaktighet</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats?.streak || 0}</div>
          <div className="stat-label">Dager på rad</div>
        </div>
      </div>

      {stats?.motivationalMessage && (
        <div className="motivational-banner">
          <p>{stats.motivationalMessage}</p>
        </div>
      )}

      <div className="operation-stats-section">
        <h2>Statistikk per øvelsestype</h2>
        <div className="operation-stats-grid">
          <div className="operation-stat-card">
            <div className="operation-header">
              <span className="operation-icon">✖️</span>
              <h3>Ganging</h3>
            </div>
            <div className="operation-stat-items">
              <div className="operation-stat-item">
                <span className="label">Oppgaver:</span>
                <span className="value">{stats?.multiplication.total_problems || 0}</span>
              </div>
              <div className="operation-stat-item">
                <span className="label">Riktige:</span>
                <span className="value">{stats?.multiplication.correct_answers || 0}</span>
              </div>
              <div className="operation-stat-item">
                <span className="label">Nøyaktighet:</span>
                <span className="value highlight">{stats?.multiplication.accuracy || 0}%</span>
              </div>
            </div>
          </div>

          <div className="operation-stat-card">
            <div className="operation-header">
              <span className="operation-icon">➗</span>
              <h3>Deling</h3>
            </div>
            <div className="operation-stat-items">
              <div className="operation-stat-item">
                <span className="label">Oppgaver:</span>
                <span className="value">{stats?.division.total_problems || 0}</span>
              </div>
              <div className="operation-stat-item">
                <span className="label">Riktige:</span>
                <span className="value">{stats?.division.correct_answers || 0}</span>
              </div>
              <div className="operation-stat-item">
                <span className="label">Nøyaktighet:</span>
                <span className="value highlight">{stats?.division.accuracy || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="today-section">
        <h2>I dag</h2>
        <div className="today-stats">
          <div className="today-item">
            <span className="today-label">Oppgaver løst:</span>
            <span className="today-value">{stats?.today.problems_solved || 0}</span>
          </div>
          <div className="today-item">
            <span className="today-label">Riktige svar:</span>
            <span className="today-value">{stats?.today.correct_answers || 0}</span>
          </div>
          <div className="today-item">
            <span className="today-label">Riktige på rad:</span>
            <span className="today-value">{stats?.currentCorrectStreak || 0}</span>
          </div>
        </div>
      </div>

      <div className="badges-section">
        <h2>Dine Badges ({stats?.badges.length || 0})</h2>
        {stats?.badges && stats.badges.length > 0 ? (
          <div className="badges-grid">
            {stats.badges.map((badge) => (
              <div key={badge.id} className="badge-card">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                <div className="badge-date">
                  {new Date(badge.earned_at).toLocaleDateString('no-NO')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-badges">Ingen badges ennå. Start å øve for å tjene din første!</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
