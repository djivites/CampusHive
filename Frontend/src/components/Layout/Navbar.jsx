import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import API from '../../api/axios';
import { 
  Search, Bell, User, Settings, Users, MessageSquare, ClipboardList, CheckCircle 
} from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get('/notifications');
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Listen for real-time notifications via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket]);

  const handleMarkRead = async (id, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TEAM_ADDED':
      case 'MEMBER_JOINED':
        return <Users size={16} className="text-info" />;
      case 'NEW_MESSAGE':
        return <MessageSquare size={16} className="text-primary" />;
      case 'TASK_ASSIGNED':
        return <ClipboardList size={16} className="text-warning" />;
      case 'TASK_COMPLETED':
        return <CheckCircle size={16} className="text-success" />;
      default:
        return <Bell size={16} className="text-muted" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'TEAM_ADDED':
      case 'MEMBER_JOINED':
        return 'bg-info';
      case 'NEW_MESSAGE':
        return 'bg-primary';
      case 'TASK_ASSIGNED':
        return 'bg-warning';
      case 'TASK_COMPLETED':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <nav className="navbar navbar-expand-lg glass-morphism sticky-top py-3 px-4" style={{ zIndex: 900 }}>
      <div className="container-fluid p-0">
        <div className="d-flex align-items-center bg-dark bg-opacity-50 rounded-pill px-4 py-2 border w-50" style={{ maxWidth: '400px' }}>
          <Search className="text-muted me-2" size={18} />
          <input 
            type="text" 
            className="form-control bg-transparent border-0 p-0 text-white shadow-none small" 
            placeholder="Search projects, tasks..." 
            style={{ fontSize: '14px' }}
          />
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="dropdown">
            <button 
              className="btn p-2 rounded-circle text-muted hover-bg-light position-relative"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '9px', padding: '3px 5px' }}>
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="dropdown-menu dropdown-menu-end p-0 border border-secondary border-opacity-25 shadow-lg bg-dark rounded-4 overflow-hidden" style={{ width: '360px', zIndex: 1050, backgroundColor: '#090d16' }}>
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary border-opacity-10 bg-dark bg-opacity-50">
                <span className="fw-bold text-white small">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="btn btn-link text-primary p-0 text-decoration-none extra-small fw-bold"
                    style={{ fontSize: '11px' }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="overflow-auto" style={{ maxHeight: '320px' }}>
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <div 
                      key={notif._id}
                      onClick={() => handleMarkRead(notif._id, notif.read)}
                      className={`d-flex gap-3 p-3 border-bottom border-secondary border-opacity-10 cursor-pointer transition-all ${!notif.read ? 'bg-primary bg-opacity-5 border-start border-3 border-primary' : 'hover-bg-dark'}`}
                    >
                      <div className={`p-2 rounded-3 h-fit ${getNotificationColor(notif.type)} bg-opacity-10`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <span className={`fw-bold text-white small ${!notif.read ? '' : 'text-white-50'}`}>{notif.title}</span>
                          <span className="text-muted extra-small" style={{ fontSize: '9px' }}>{formatTime(notif.createdAt)}</span>
                        </div>
                        <p className="text-muted small mb-0 mt-1" style={{ fontSize: '12px', lineHeight: '1.4' }}>{notif.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5">
                    <Bell className="text-muted mb-2 opacity-25" size={32} />
                    <p className="text-muted small mb-0">No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="vr mx-2 opacity-10" style={{ height: '24px' }}></div>

          <div 
            onClick={() => navigate('/settings')}
            className="d-flex align-items-center gap-3 cursor-pointer"
          >
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-white small mb-0">{user?.name}</div>
              <div className="text-muted extra-small" style={{ fontSize: '11px' }}>Available</div>
            </div>
            <div 
              className="bg-primary rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm overflow-hidden" 
              style={{ 
                width: '42px', 
                height: '42px',
                backgroundImage: user?.avatar ? `url("${user.avatar}")` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {!user?.avatar && (user?.name?.[0]?.toUpperCase() || 'U')}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
