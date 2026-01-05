import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from './api/client';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import CreateDocument from './pages/CreateDocument';
import DocumentDetail from './pages/DocumentDetail';
import CreateQuestion from './pages/CreateQuestion';
import QuestionDetail from './pages/QuestionDetail';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Clubs from './pages/Clubs';
import CreateClub from './pages/CreateClub';
import ClubDetail from './pages/ClubDetail';
import Aula from './pages/Aula';
import Apuntes from './pages/Apuntes';
import ApunteDetail from './pages/ApunteDetail';
import Store from './pages/Store';
import StoreDetail from './pages/StoreDetail';
import CreateProduct from './pages/CreateProduct';
import MyPurchases from './pages/MyPurchases';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

import Events from './pages/Events';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/feed" /> : <>{children}</>;
}

function Home() {
    return (
        <div className="container">
            <div className="hero">
                <h1>Welcome to CRUNEVO</h1>
                <p>The ultimate platform for students and teachers. Connect, learn, share resources, and grow together.</p>
                <div className="hero-buttons">
                    <Link to="/login" className="btn hero-btn">Login</Link>
                    <Link to="/register" className="btn btn-secondary hero-btn">Register</Link>
                </div>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="card text-center">
                    <h3>📚 Social Feed</h3>
                    <p>Share updates, documents, and questions with your network.</p>
                </div>
                <div className="card text-center">
                    <h3>🎓 Aula & Apuntes</h3>
                    <p>Ask questions, get answers, and access a library of study materials.</p>
                </div>
                <div className="card text-center">
                    <h3>🛒 Store</h3>
                    <p>Buy and sell premium educational resources and courses.</p>
                </div>
                <div className="card text-center">
                    <h3>💬 Chat</h3>
                    <p>Connect instantly with other students and teachers.</p>
                </div>
            </div>
        </div>
    );
}

import Sidebar from './components/Sidebar';

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        api.get('/users/me').then(res => setCurrentUser(res.data)).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Routes where we don't show the main app layout (auth pages, landing)
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
      return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Sidebar for Desktop */}
      <div className="sidebar-container" style={{ display: 'none' }}> 
         {/* We will use media query in CSS or JS for responsive, for now assume desktop > 768px */}
      </div>
      <div style={{ display: 'block' }}> {/* Actually let's just force Sidebar for now since we want it */}
          <Sidebar />
      </div>

      <div style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Top Bar (Search, Notifs, Profile) */}
          <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem', gap: '20px' }}>
             <div style={{ marginRight: 'auto', fontWeight: 'bold' }}>
                 {/* Page Title or Breadcrumb could go here */}
             </div>

             <Link to="/notifications" style={{ position: 'relative', textDecoration: 'none', fontSize: '1.2rem' }}>
                🔔
             </Link>

             {currentUser ? (
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Link 
                        to={`/users/${currentUser.id}/profile`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <img 
                            src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=random`} 
                            alt={currentUser.username}
                            style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                        />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>@{currentUser.username}</span>
                    </Link>
                    <button onClick={handleLogout} className="btn btn-sm btn-secondary">Logout</button>
                </div>
             ) : (
                 <span>Loading...</span>
             )}
          </header>

          {children}
      </div>
    </div>
  );
}

function AppContent() {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/documents/new" element={<PrivateRoute><CreateDocument /></PrivateRoute>} />
          <Route path="/documents/:id" element={<PrivateRoute><DocumentDetail /></PrivateRoute>} />
          
          <Route path="/aula" element={<PrivateRoute><Aula /></PrivateRoute>} />
          <Route path="/aula/new" element={<PrivateRoute><CreateQuestion /></PrivateRoute>} />
          <Route path="/aula/:id" element={<PrivateRoute><QuestionDetail /></PrivateRoute>} />
          
          <Route path="/apuntes" element={<PrivateRoute><Apuntes /></PrivateRoute>} />
          <Route path="/apuntes/:id" element={<PrivateRoute><ApunteDetail /></PrivateRoute>} />
          
          <Route path="/store" element={<PrivateRoute><Store /></PrivateRoute>} />
          <Route path="/store/new" element={<PrivateRoute><CreateProduct /></PrivateRoute>} />
          <Route path="/store/orders/mine" element={<PrivateRoute><MyPurchases /></PrivateRoute>} />
          <Route path="/store/:id" element={<PrivateRoute><StoreDetail /></PrivateRoute>} />

          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/messages/:id" element={<PrivateRoute><Messages /></PrivateRoute>} />

          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />

          {/* Legacy routes redirect to Aula */}
          <Route path="/questions/new" element={<Navigate to="/aula/new" />} />
          <Route path="/questions/:id" element={<Navigate to="/aula/:id" />} />
          
          <Route path="/users/:id/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/clubs/new" element={<PrivateRoute><CreateClub /></PrivateRoute>} />
          <Route path="/clubs" element={<PrivateRoute><Clubs /></PrivateRoute>} />
          <Route path="/clubs/:id" element={<PrivateRoute><ClubDetail /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
          
          <Route path="/ai" element={<div className="card"><h3>AI Module</h3><p>Coming soon...</p></div>} />
          <Route path="/courses" element={<div className="card"><h3>Courses Module</h3><p>Coming soon...</p></div>} />
        </Routes>
      </Layout>
    );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
