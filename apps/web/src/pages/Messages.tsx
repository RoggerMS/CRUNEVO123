import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Search, X } from 'lucide-react';

export default function Messages() {
  const { id } = useParams(); // conversation ID
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New Message Modal State
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const fetchConversations = useCallback(() => {
    api.get('/messages/conversations')
      .then(res => {
        setConversations(res.data);
        setLoadingConversations(false);
        if (id) {
            const current = res.data.find((c: any) => c.id === id);
            if (current) setActiveConversation(current);
        }
      })
      .catch(console.error);
  }, [id]);

  const fetchMessages = useCallback((convId: string) => {
    api.get(`/messages/conversations/${convId}`)
      .then(res => {
        setMessages(res.data);
      })
      .catch(console.error);
  }, []);

  // Polling for conversations list
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Polling for messages in active conversation
  useEffect(() => {
    if (id) {
      fetchMessages(id);
      const interval = setInterval(() => fetchMessages(id), 3000);
      return () => clearInterval(interval);
    } else {
        setMessages([]);
        setActiveConversation(null);
    }
  }, [id, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    api.post(`/messages/conversations/${id}`, { content: newMessage })
      .then(() => {
        setNewMessage('');
        fetchMessages(id); // Immediate update
        fetchConversations(); // Update list order/preview
      })
      .catch(console.error);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
        api.get(`/users/search?q=${query}`)
            .then(res => setSearchResults(res.data))
            .catch(console.error);
    } else {
        setSearchResults([]);
    }
  };

  const startNewConversation = (userId: string) => {
      api.post('/messages/conversations', { toUserId: userId })
        .then(res => {
            setShowNewMessageModal(false);
            setSearchQuery('');
            setSearchResults([]);
            navigate(`/messages/${res.data.id}`);
            fetchConversations();
        })
        .catch(console.error);
  };

  return (
    <div className="container" style={{ display: 'flex', height: '80vh', gap: '1rem', position: 'relative' }}>
      {/* Sidebar: Conversations List */}
      <div className="card" style={{ width: '300px', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Messages</h3>
          <button className="btn btn-sm" onClick={() => setShowNewMessageModal(true)}>+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingConversations ? (
            <div style={{ padding: '1rem' }}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '1rem' }}>No conversations yet.</div>
          ) : (
            conversations.map(c => (
              <div 
                key={c.id}
                onClick={() => navigate(`/messages/${c.id}`)}
                style={{ 
                  padding: '1rem', 
                  borderBottom: '1px solid #eee', 
                  cursor: 'pointer',
                  background: c.id === id ? '#f0f0f0' : 'white'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>@{c.otherUser.username}</div>
                <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.lastMessage ? c.lastMessage.content : 'No messages'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {id ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee', background: '#f9f9f9' }}>
              <h3 style={{ margin: 0 }}>
                Chat with {activeConversation ? `@${activeConversation.otherUser.username}` : 'Loading...'}
              </h3>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(m => {
                 // Check if senderId matches activeConversation.otherUser.id. If so, it's them. Else it's me.
                 const isThem = activeConversation && m.senderId === activeConversation.otherUser.id;
                 
                 return (
                    <div 
                        key={m.id} 
                        style={{ 
                            alignSelf: isThem ? 'flex-start' : 'flex-end',
                            background: isThem ? '#e9ecef' : '#007bff',
                            color: isThem ? 'black' : 'white',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            maxWidth: '70%'
                        }}
                    >
                        {m.content}
                    </div>
                 );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '10px' }}>
              <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button type="submit" className="btn">Send</button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
          <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
              <div className="card" style={{ width: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h3>New Message</h3>
                      <button onClick={() => setShowNewMessageModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                      <input 
                        autoFocus
                        placeholder="Search users..." 
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        style={{ marginBottom: 0 }}
                      />
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                      {searchResults.map(user => (
                          <div 
                            key={user.id}
                            onClick={() => startNewConversation(user.id)}
                            style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                          >
                              <span>@{user.username}</span>
                              <Search size={16} color="#666" />
                          </div>
                      ))}
                      {searchQuery && searchResults.length === 0 && (
                          <div style={{ padding: '10px', color: '#666' }}>No users found</div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
