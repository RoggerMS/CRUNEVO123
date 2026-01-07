import React, { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import {
  Bell,
  CalendarDays,
  FileText,
  GraduationCap,
  Home as HomeIcon,
  MessageCircle,
  Receipt,
  Shield,
  Store as StoreIcon,
  Users,
  BookOpen,
} from 'lucide-react';

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
import Settings from './pages/Settings';

import AppMenu, { type AppMenuSection } from './components/AppMenu';
import Sidebar from './components/Sidebar';

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
        <p>
          The ultimate platform for students and teachers. Connect, learn, share resources, and grow together.
        </p>
        <div className="hero-buttons">
          <Link to="/login" className="btn hero-btn">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary hero-btn">
            Register
          </Link>
        </div>
      </div>

      <div
        style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
        }}
      >
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

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/users/me')
        .then((res) => setCurrentUser(res.data))
        .catch(() => {});
    }
  }, []);

  const menuSections = useMemo<AppMenuSection[]>(() => {
    const sections: AppMenuSection[] = [
      {
        title: 'Social',
        items: [
          {
            label: 'Feed',
            description: 'Explora las novedades de tu red.',
            to: '/feed',
            icon: <HomeIcon size={18} />,
          },
          {
            label: 'Clubes',
            description: 'Conecta con comunidades y clubes.',
            to: '/clubs',
            icon: <Users size={18} />,
          },
          {
            label: 'Eventos',
            description: 'Consulta y organiza actividades.',
            to: '/events',
            icon: <CalendarDays size={18} />,
          },
        ],
      },
      {
        title: 'Aprendizaje',
        items: [
          {
            label: 'Aula',
            description: 'Haz preguntas y comparte conocimiento.',
            to: '/aula',
            icon: <GraduationCap size={18} />,
          },
          {
            label: 'Apuntes',
            description: 'Consulta resúmenes y materiales.',
            to: '/apuntes',
            icon: <BookOpen size={18} />,
          },
          {
            label: 'Documentos',
            description: 'Crea o revisa documentos compartidos.',
            to: '/documents/new',
            icon: <FileText size={18} />,
          },
        ],
      },
      {
        title: 'Comunicación',
        items: [
          {
            label: 'Mensajes',
            description: 'Chatea con otros miembros.',
            to: '/messages',
            icon: <MessageCircle size={18} />,
          },
          {
            label: 'Notificaciones',
            description: 'Revisa tus alertas recientes.',
            to: '/notifications',
            icon: <Bell size={18} />,
          },
        ],
      },
      {
        title: 'Comercio',
        items: [
          {
            label: 'Marketplace',
            description: 'Compra y vende recursos académicos.',
            to: '/store',
            icon: <StoreIcon size={18} />,
          },
          {
            label: 'Mis compras',
            description: 'Revisa el historial de pedidos.',
            to: '/store/orders/mine',
            icon: <Receipt size={18} />,
          },
        ],
      },
    ];

    if (currentUser?.role === 'ADMIN') {
      sections.push({
        title: 'Administración',
        items: [
          {
            label: 'Panel',
            description: 'Gestiona usuarios y contenido.',
            to: '/admin',
            icon: <Shield size={18} />,
          },
        ],
      });
    }

    return sections;
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Routes where we don't show the main app layout (auth pages, landing)
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <div className="app-sidebar-wrapper">
        <Sidebar />
      </div>

      <div className="app-main">
        <header className="topbar">
          <div style={{ marginRight: 'auto', fontWeight: 'bold' }}>
            {/* Page Title or Breadcrumb could go here */}
          </div>

          <div className="topbar-actions">
            <AppMenu sections={menuSections} />

            <Link to="/messages" className="topbar-icon-button" aria-label="Ir a mensajes">
              <MessageCircle size={18} />
            </Link>

            <Link to="/notifications" className="topbar-icon-button" aria-label="Ir a notificaciones">
              <Bell size={18} />
            </Link>

            {currentUser ? (
              <div className="topbar-profile">
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
                    className="topbar-avatar"
                  />
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>@{currentUser.username}</span>
                </Link>
                <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <span>Loading...</span>
            )}
          </div>
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
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Home />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <PrivateRoute>
              <Feed />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/new"
          element={
            <PrivateRoute>
              <CreateDocument />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <PrivateRoute>
              <DocumentDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/aula"
          element={
            <PrivateRoute>
              <Aula />
            </PrivateRoute>
          }
        />
        <Route
          path="/aula/new"
          element={
            <PrivateRoute>
              <CreateQuestion />
            </PrivateRoute>
          }
        />
        <Route
          path="/aula/:id"
          element={
            <PrivateRoute>
              <QuestionDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/apuntes"
          element={
            <PrivateRoute>
              <Apuntes />
            </PrivateRoute>
          }
        />
        <Route
          path="/apuntes/:id"
          element={
            <PrivateRoute>
              <ApunteDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/store"
          element={
            <PrivateRoute>
              <Store />
            </PrivateRoute>
          }
        />
        <Route
          path="/store/new"
          element={
            <PrivateRoute>
              <CreateProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/store/orders/mine"
          element={
            <PrivateRoute>
              <MyPurchases />
            </PrivateRoute>
          }
        />
        <Route
          path="/store/:id"
          element={
            <PrivateRoute>
              <StoreDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route path="/setting" element={<Navigate to="/settings" />} />
        <Route path="/configuracion" element={<Navigate to="/settings" />} />

        {/* Legacy routes redirect to Aula */}
        <Route path="/questions/new" element={<Navigate to="/aula/new" />} />
        <Route path="/questions/:id" element={<Navigate to="/aula/:id" />} />

        <Route
          path="/users/:id/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/clubs/new"
          element={
            <PrivateRoute>
              <CreateClub />
            </PrivateRoute>
          }
        />
        <Route
          path="/clubs"
          element={
            <PrivateRoute>
              <Clubs />
            </PrivateRoute>
          }
        />
        <Route
          path="/clubs/:id"
          element={
            <PrivateRoute>
              <ClubDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/events"
          element={
            <PrivateRoute>
              <Events />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />

        <Route
          path="/ai"
          element={
            <div className="card">
              <h3>AI Module</h3>
              <p>Coming soon...</p>
            </div>
          }
        />
        <Route
          path="/courses"
          element={
            <div className="card">
              <h3>Courses Module</h3>
              <p>Coming soon...</p>
            </div>
          }
        />
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
