import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CheckSquare, Users, MessageSquare, 
  Files, Calendar, Milestone, BarChart3, Settings, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Teams', icon: Users, path: '/teams' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Files', icon: Files, path: '/files' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Viva Tracker', icon: Milestone, path: '/viva' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  return (
    <div className="d-flex flex-column h-100 p-3 glass-morphism" style={{ width: '280px', minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1000 }}>
      <div className="d-flex align-items-center mb-5 ps-2 pt-3">
        <div className="bg-primary rounded-3 p-2 me-2 d-flex align-items-center justify-content-center">
          <Milestone className="text-white" size={24} />
        </div>
        <h4 className="fw-bold mb-0 text-white" style={{ letterSpacing: '0.5px' }}>CampusFlow</h4>
      </div>

      <div className="nav flex-column nav-pills mb-auto">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`nav-link d-flex align-items-center gap-3 mb-2 py-3 px-3 transition-all ${
              location.pathname === item.path 
                ? 'bg-primary text-white shadow-sm fw-bold' 
                : 'text-muted'
            }`}
            style={{ borderRadius: '12px' }}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>

      <hr className="my-4 opacity-10" />

      <div className="nav flex-column nav-pills pb-3">
        <Link
          to="/settings"
          className={`nav-link d-flex align-items-center gap-3 mb-2 py-3 px-3 text-muted`}
          style={{ borderRadius: '12px' }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button
          onClick={logout}
          className="nav-link d-flex align-items-center gap-3 py-3 px-3 text-danger border-0 bg-transparent w-100 text-start"
          style={{ borderRadius: '12px' }}
        >
          <LogOut size={20} />
          <span className="fw-semibold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
