import { useState, useEffect, useRef } from 'react';
import { Send, Hash, MessageSquare, Info, Users, Clock } from 'lucide-react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Chat = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null);
  const scrollRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    socket.current = io('http://localhost:5000'); // Replace with your backend URL
    
    socket.current.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await API.get('/teams');
        setTeams(data);
        if (data.length > 0) {
          setActiveTeam(data[0]);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, []);

  // Handle team switch
  useEffect(() => {
    if (activeTeam) {
      socket.current.emit('join_team', activeTeam._id);
      fetchMessages(activeTeam._id);
    }
  }, [activeTeam]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async (teamId) => {
    try {
      const { data } = await API.get(`/messages/${teamId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeTeam) {
      const messageData = {
        team: activeTeam._id,
        sender: user._id,
        text: newMessage
      };
      socket.current.emit('send_message', messageData);
      setNewMessage('');
    }
  };

  return (
    <div className="container-fluid p-0 pb-5" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="row g-0 h-100 card-custom overflow-hidden">
        {/* Sidebar: Teams List */}
        <div className="col-md-3 border-end border-secondary border-opacity-10 d-flex flex-column bg-dark bg-opacity-25">
          <div className="p-4 border-bottom border-secondary border-opacity-10">
            <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-white">
              <MessageSquare size={20} className="text-primary" />
              Messages
            </h5>
          </div>
          <div className="flex-grow-1 overflow-auto p-3">
            <div className="text-muted extra-small fw-bold mb-3 text-uppercase px-2" style={{ letterSpacing: '1px' }}>Channels</div>
            {teams.map(team => (
              <div 
                key={team._id}
                onClick={() => setActiveTeam(team)}
                className={`d-flex align-items-center gap-2 p-3 rounded-4 cursor-pointer transition-all mb-2 ${activeTeam?._id === team._id ? 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25' : 'text-muted hover-bg-dark'}`}
              >
                <Hash size={18} />
                <span className="fw-bold small">{team.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-md-9 d-flex flex-column bg-dark bg-opacity-10">
          {activeTeam ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-bottom border-secondary border-opacity-10 bg-dark bg-opacity-25 d-flex justify-content-between align-items-center px-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-20 p-2 rounded-3">
                    <Hash className="text-primary" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-white">{activeTeam.name}</h6>
                    <div className="text-muted extra-small">{activeTeam.members.length} Members</div>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button className="btn btn-link text-muted p-0"><Info size={20} /></button>
                  <button className="btn btn-link text-muted p-0"><Users size={20} /></button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-4">
                {messages.map((msg, index) => {
                  const isMe = msg.sender._id === user._id || msg.sender === user._id;
                  return (
                    <div key={index} className={`d-flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div 
                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" 
                        style={{ width: '36px', height: '36px', flexShrink: 0 }}
                      >
                        {msg.sender.name?.[0] || 'U'}
                      </div>
                      <div className={`d-flex flex-column ${isMe ? 'align-items-end' : ''}`} style={{ maxWidth: '70%' }}>
                        <div className="d-flex align-items-center gap-2 mb-1 px-1">
                          <span className="fw-bold small text-white">{isMe ? 'You' : msg.sender.name}</span>
                          <span className="text-muted extra-small" style={{ fontSize: '10px' }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3 rounded-4 ${isMe ? 'bg-primary text-white' : 'bg-dark border border-secondary border-opacity-25 text-white-50'}`} style={{ fontSize: '14px' }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-dark bg-opacity-25 border-top border-secondary border-opacity-10">
                <form onSubmit={handleSendMessage} className="d-flex gap-3">
                  <div className="flex-grow-1 position-relative">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message #${activeTeam.name}`}
                      className="form-control bg-dark border-secondary border-opacity-25 py-3 px-4 rounded-4 text-white shadow-none"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary rounded-4 px-4 d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale">
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center p-5">
              <div className="bg-primary bg-opacity-10 p-5 rounded-circle mb-4">
                <MessageSquare className="text-primary" size={64} />
              </div>
              <h3 className="fw-bold">No Channel Selected</h3>
              <p className="text-muted" style={{ maxWidth: '300px' }}>Select a team from the sidebar to start chatting with your group.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
