import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    api.get('/vitality/notifications')
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(console.error);
  };

  const handleRead = (n: any) => {
    if (!n.isRead) {
        api.patch(`/vitality/notifications/${n.id}/read`).catch(console.error);
    }
    if (n.link) {
        navigate(n.link);
    }
  };

  const markAllRead = () => {
    api.patch('/vitality/notifications/read-all')
      .then(() => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      })
      .catch(console.error);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Notifications</h2>
        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>Mark all read</button>
      </div>

      <div className="card">
        {loading ? (
            <div>Loading...</div>
        ) : notifications.length === 0 ? (
            <div>No notifications yet.</div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifications.map(n => (
                    <div 
                        key={n.id}
                        onClick={() => handleRead(n)}
                        style={{ 
                            padding: '1rem', 
                            borderBottom: '1px solid #eee', 
                            cursor: 'pointer',
                            background: n.isRead ? 'white' : '#f0f8ff',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}
                    >
                        <div style={{ fontSize: '1.2rem' }}>
                            {n.type === 'DAILY' ? '📢' : n.type === 'SYSTEM' ? '🎉' : '🔔'}
                        </div>
                        <div>
                            <div style={{ fontWeight: n.isRead ? 'normal' : 'bold' }}>{n.content}</div>
                            <div className="meta" style={{ fontSize: '0.8rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
