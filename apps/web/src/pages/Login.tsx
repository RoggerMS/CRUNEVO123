import { useState } from 'react';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { formatApiErrorMessage } from '../api/error';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.access_token);
      navigate('/feed');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas');
        return;
      }
      setError('Login failed: ' + formatApiErrorMessage(err));
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <form onSubmit={handleSubmit} className="card">
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn" style={{ width: '100%' }}>Login</button>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
}
