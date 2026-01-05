import { useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { formatApiErrorMessage } from '../api/error';

export default function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/register', { email, username, password });
      alert('Registered! Please login.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setError('Registration failed: ' + formatApiErrorMessage(err));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <form onSubmit={handleSubmit} className="card">
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn" style={{ width: '100%' }}>Register</button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
