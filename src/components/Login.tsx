import { useState } from 'react';
import { User } from '../App';

interface LoginProps {
  onLogin: (user: User) => void;
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Innlogging feilet');
        setLoading(false);
        return;
      }

      onLogin(data.user);
    } catch (err) {
      setError('Kunne ikke koble til server');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Gangetabell App</h1>
        <p className="subtitle">Øv på gangetabellen og få badges!</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Brukernavn</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="hermann eller vilma"
              required
            />
          </div>

          <div className="form-group">
            <label>Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="pwpw67"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logger inn...' : 'Logg inn'}
          </button>
        </form>

        <div className="login-hint">
          <p>Tips: Brukernavn: hermann eller vilma</p>
          <p>Passord: pwpw67</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
