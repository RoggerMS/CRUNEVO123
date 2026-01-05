import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Trash2, UserCheck, Ban, Edit, X, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

function AdminPanelContent() {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'content'>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [contentType, setContentType] = useState('post');
  const [contentStatus, setContentStatus] = useState('active');
  const [contentSearch, setContentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit User State
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ points: 0, level: 1 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'users') {
      const delayDebounceFn = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [userSearch]);

  useEffect(() => {
      if (activeTab === 'content') {
          const delayDebounceFn = setTimeout(() => {
              fetchContent();
          }, 500);
          return () => clearTimeout(delayDebounceFn);
      }
  }, [contentType, contentStatus, contentSearch]);

  const fetchData = () => {
    setLoading(true);
    setError('');
    
    if (activeTab === 'reports') {
      api.get('/admin/reports')
        .then(res => {
          setReports(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch Reports Error", err);
          setError('Access Denied or Failed to load reports');
          setLoading(false);
        });
    } else if (activeTab === 'content') {
        fetchContent();
    } else {
      fetchUsers();
    }
  };

  const fetchContent = () => {
      setLoading(true);
      api.get(`/admin/content/${contentType}`, {
          params: {
              status: contentStatus,
              q: contentSearch,
              limit: 50
          }
      })
      .then(res => {
          // Handle both { items: [], total: 0 } and [] formats
          const list = res.data.items || (Array.isArray(res.data) ? res.data : []);
          setContentList(list);
          setLoading(false);
      })
      .catch(err => {
          console.error("Fetch Content Error", err);
          setContentList([]);
          setError('Failed to load content');
          setLoading(false);
      });
  };

  const fetchUsers = () => {
    api.get(`/admin/users?search=${userSearch}`)
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch Users Error", err);
        setError('Access Denied');
        setLoading(false);
      });
  };

  const handleDeleteContent = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to permanently delete this content?')) return;
    try {
      await api.delete(`/admin/content/${type.toLowerCase()}/${id}`);
      // Optimistic update
      if (activeTab === 'reports') {
          setReports(reports.filter(r => r.targetId !== id));
      } else {
          setContentList(contentList.filter(i => i.id !== id));
      }
      alert('Content deleted');
    } catch (error) {
      alert('Failed to delete content');
    }
  };

  const handleUpdateStatus = async (type: string, id: string, newStatus: string) => {
      try {
          await api.post(`/admin/content/${type.toLowerCase()}/${id}/status`, { status: newStatus });
          // Optimistic
          setContentList(contentList.filter(i => i.id !== id));
          alert(`Content ${newStatus.toLowerCase()}`);
      } catch (error) {
          alert('Failed to update status');
      }
  };

  const handleToggleBan = async (user: any) => {
    if (!confirm(`Are you sure you want to ${user.isBanned ? 'unban' : 'ban'} this user?`)) return;
    try {
      await api.post(`/admin/users/${user.id}/ban`, { isBanned: !user.isBanned });
      fetchUsers();
    } catch (error) {
      alert('Failed to update ban status');
    }
  };

  const handleVerifyTeacher = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/verify-teacher`);
      fetchUsers();
      alert('Teacher Verified');
    } catch (error) {
      alert('Failed to verify teacher');
    }
  };

  const openEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({ points: user.points, level: user.level });
  };

  const handleUpdateStats = async () => {
    if (!editingUser) return;
    try {
      await api.post(`/admin/users/${editingUser.id}/stats`, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      alert('Failed to update stats');
    }
  };

  if (error) return <div className="error">{error} <button className="btn btn-sm btn-outline" onClick={() => fetchData()}>Retry</button></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Admin Panel</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'reports' ? '' : 'btn-outline'}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
          <button 
            className={`btn ${activeTab === 'content' ? '' : 'btn-outline'}`}
            onClick={() => setActiveTab('content')}
          >
            Content
          </button>
          <button 
            className={`btn ${activeTab === 'users' ? '' : 'btn-outline'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>
      </div>

      {activeTab === 'content' && (
        <div>
            <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Type:</span>
                    {['post', 'document', 'question'].map(type => (
                        <button 
                            key={type}
                            className={`btn btn-sm ${contentType === type ? '' : 'btn-outline'}`}
                            onClick={() => setContentType(type)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {type}s
                        </button>
                    ))}
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Status:</span>
                    {['active', 'hidden', 'deleted', 'all'].map(status => (
                        <button 
                            key={status}
                            className={`btn btn-sm ${contentStatus === status ? '' : 'btn-outline'}`}
                            onClick={() => setContentStatus(status)}
                            style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div style={{ width: '100%' }}>
                     <input 
                        placeholder="Search by title, content..." 
                        value={contentSearch}
                        onChange={e => setContentSearch(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading content...</div>
            ) : (
                <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th>Info</th>
                                <th>Author</th>
                                <th>Stats</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contentList.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{item.title || (item.content ? item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '') : 'Item')}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666', maxWidth: '300px' }}>
                                            <span className="badge" style={{ marginRight: '5px' }}>{contentType}</span>
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        {item.author?.username || item.owner?.username || item.organizer?.username || 'Unknown'}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            {item._count?.likes !== undefined && <span>👍 {item._count.likes} </span>}
                                            {item._count?.comments !== undefined && <span>💬 {item._count.comments} </span>}
                                            {item._count?.answers !== undefined && <span>📝 {item._count.answers} </span>}
                                        </div>
                                    </td>
                                    <td>
                                        {item.status === 'ACTIVE' && <span className="badge" style={{ background: '#28a745' }}>Active</span>}
                                        {item.status === 'HIDDEN' && <span className="badge" style={{ background: '#ffc107', color: '#000' }}>Hidden</span>}
                                        {item.status === 'DELETED' && <span className="badge" style={{ background: '#dc3545' }}>Deleted</span>}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            {/* View Details (Mock) */}
                                            {/* 
                                            <button className="btn btn-sm btn-outline" title="View">
                                                <Eye size={16} />
                                            </button> 
                                            */}
                                            
                                            {item.status === 'ACTIVE' && (
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#ffc107', color: '#000' }}
                                                    onClick={() => handleUpdateStatus(contentType, item.id, 'HIDDEN')}
                                                    title="Hide"
                                                >
                                                    <EyeOff size={16} />
                                                </button>
                                            )}
                                            
                                            {item.status === 'HIDDEN' && (
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#28a745' }}
                                                    onClick={() => handleUpdateStatus(contentType, item.id, 'ACTIVE')}
                                                    title="Activate"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}

                                            {(item.status === 'DELETED') ? (
                                                <button 
                                                    className="btn btn-sm" 
                                                    style={{ background: '#17a2b8' }}
                                                    onClick={() => handleUpdateStatus(contentType, item.id, 'ACTIVE')}
                                                    title="Restore"
                                                >
                                                    <RotateCcw size={16} />
                                                </button>
                                            ) : (
                                                 <button 
                                                  className="btn btn-sm" 
                                                  style={{ background: '#dc3545' }}
                                                  onClick={() => handleUpdateStatus(contentType, item.id, 'DELETED')} // Soft Delete
                                                  title="Delete"
                                                >
                                                  <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {contentList.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No content found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th>Reason</th>
                <th>Target</th>
                <th>Reporter</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.reason}</td>
                  <td>
                    <span className="badge">{r.targetType}</span>
                    <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#666' }}>{r.targetId}</span>
                  </td>
                  <td>@{r.reporter.username}</td>
                  <td>{r.status}</td>
                  <td>
                    <button 
                      className="btn btn-sm" 
                      style={{ background: '#dc3545', padding: '5px 10px' }}
                      onClick={() => handleDeleteContent(r.targetType, r.targetId)}
                      title="Delete Content"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No reports found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <input 
              placeholder="Search users by username or email..." 
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th>User</th>
                  <th>Role</th>
                  <th>Stats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>@{u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.email}</div>
                    </td>
                    <td>
                        {u.role}
                        {u.teacherVerified && <span className="badge" style={{ marginLeft: '5px', background: '#28a745' }}>Verified</span>}
                    </td>
                    <td>
                      <div>Lvl {u.level}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{u.points} pts</div>
                    </td>
                    <td>
                      {u.isBanned ? (
                        <span className="badge" style={{ background: '#dc3545' }}>BANNED</span>
                      ) : (
                        <span className="badge" style={{ background: '#28a745' }}>Active</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          className="btn btn-sm"
                          onClick={() => openEditUser(u)}
                          title="Edit Stats"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn btn-sm"
                          onClick={() => handleToggleBan(u)}
                          title={u.isBanned ? "Unban" : "Ban"}
                          style={{ background: u.isBanned ? '#28a745' : '#dc3545' }}
                        >
                          {u.isBanned ? <UserCheck size={16} /> : <Ban size={16} />}
                        </button>
                        {!u.teacherVerified && (
                            <button 
                                className="btn btn-sm"
                                onClick={() => handleVerifyTeacher(u.id)}
                                title="Verify Teacher"
                                style={{ background: '#17a2b8' }}
                            >
                                <UserCheck size={16} />
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No users found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div className="card" style={{ width: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Edit User: @{editingUser.username}</h3>
                    <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                
                <div className="form-group">
                    <label>Level</label>
                    <input 
                        type="number"
                        value={editForm.level}
                        onChange={e => setEditForm({ ...editForm, level: parseInt(e.target.value) })}
                    />
                </div>
                
                <div className="form-group">
                    <label>Points</label>
                    <input 
                        type="number"
                        value={editForm.points}
                        onChange={e => setEditForm({ ...editForm, points: parseInt(e.target.value) })}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" onClick={() => setEditingUser(null)}>Cancel</button>
                    <button className="btn" onClick={handleUpdateStats}>Save Changes</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
    return (
        <ErrorBoundary>
            <AdminPanelContent />
        </ErrorBoundary>
    );
}
