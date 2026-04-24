import { Search, Bell, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg glass-morphism sticky-top py-3 px-4" style={{ marginLeft: '280px', zIndex: 900 }}>
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
          <button className="btn p-2 rounded-circle text-muted hover-bg-light position-relative">
            <Bell size={20} />
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>
          
          <div className="vr mx-2 opacity-10" style={{ height: '24px' }}></div>

          <div className="d-flex align-items-center gap-3 cursor-pointer">
            <div className="text-end d-none d-md-block">
              <div className="fw-bold text-white small mb-0">{user?.name}</div>
              <div className="text-muted extra-small" style={{ fontSize: '11px' }}>Available</div>
            </div>
            <div className="bg-primary rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '42px', height: '42px' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
