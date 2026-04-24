import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import Teams from './pages/Teams';
import Chat from './pages/Chat';
import Files from './pages/Files';
import Calendar from './pages/Calendar';
import VivaTracker from './pages/VivaTracker';
import MainLayout from './components/Layout/MainLayout';
import API from './api/axios';
import { 
  CheckSquare, MessageSquare, Clock, TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock data for the chart (Will be dynamic later)
const chartData = [
  { name: 'Mon', tasks: 4 },
  { name: 'Tue', tasks: 7 },
  { name: 'Wed', tasks: 5 },
  { name: 'Thu', tasks: 12 },
  { name: 'Fri', tasks: 9 },
  { name: 'Sat', tasks: 15 },
  { name: 'Sun', tasks: 11 },
];

const Landing = () => (
  <div className="container min-vh-100 d-flex flex-column align-items-center justify-content-center text-center">
    <h1 className="display-3 fw-bold mb-4">CampusFlow</h1>
    <p className="lead text-muted mb-5" style={{ maxWidth: '600px' }}>
      The complete student project management ecosystem. Manage tasks, chat with teams, and track your Viva milestones in one place.
    </p>
    <div className="d-flex gap-3">
      <a href="/login" className="btn btn-primary btn-lg px-5">Get Started</a>
      <a href="/register" className="btn btn-outline-secondary btn-lg px-5">Create Account</a>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/tasks/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="row g-4 pb-5">
      <div className="col-12">
        <h2 className="fw-bold">Welcome back, {user?.name}! 👋</h2>
        <p className="text-muted">Here's what's happening with your projects today.</p>
      </div>
      
      {/* Row 1: Stats Cards */}
      <div className="col-md-3">
        <div className="card-custom p-4">
          <div className="text-muted small fw-bold mb-1">TOTAL TASKS</div>
          <div className="h2 fw-bold mb-0">{stats.totalTasks}</div>
          <div className="text-success small mt-2">Live from database</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card-custom p-4 border-primary border-opacity-25">
          <div className="text-muted small fw-bold mb-1 text-primary">PENDING</div>
          <div className="h2 fw-bold mb-0">{stats.pendingTasks}</div>
          <div className="text-primary small mt-2">Needs attention</div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card-custom p-4">
          <div className="text-muted small fw-bold mb-1">COMPLETED</div>
          <div className="h2 fw-bold mb-0">{stats.completionPercentage}%</div>
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div className="progress-bar bg-success" style={{ width: `${stats.completionPercentage}%` }}></div>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card-custom p-4">
          <div className="text-muted small fw-bold mb-1 text-warning">VIVA DAYS</div>
          <div className="h2 fw-bold mb-0">12</div>
          <div className="text-warning small mt-2">Upcoming milestone</div>
        </div>
      </div>

      {/* Row 2: Charts and Deadlines */}
      <div className="col-lg-8 mt-4">
        <div className="card-custom p-4 h-100">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0">Project Progress</h5>
            <div className="dropdown">
              <button className="btn btn-dark btn-sm rounded-pill px-3 border border-secondary border-opacity-25 extra-small">Last 7 Days</button>
            </div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="col-lg-4 mt-4">
        <div className="card-custom p-4 h-100">
          <h5 className="fw-bold mb-4">Upcoming Deadlines</h5>
          <div className="d-flex flex-column gap-4">
            <div className="d-flex gap-3">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3 h-fit mt-1">
                <Clock className="text-danger" size={18} />
              </div>
              <div className="flex-grow-1 border-bottom border-opacity-10 pb-3">
                <div className="d-flex justify-content-between">
                  <div className="fw-bold small">Project Proposal</div>
                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill extra-small">Tomorrow</span>
                </div>
                <div className="text-muted extra-small mt-1">CampusFlow Web App</div>
              </div>
            </div>
            <div className="d-flex gap-3">
              <div className="bg-warning bg-opacity-10 p-2 rounded-3 h-fit mt-1">
                <Clock className="text-warning" size={18} />
              </div>
              <div className="flex-grow-1 border-bottom border-opacity-10 pb-3">
                <div className="d-flex justify-content-between">
                  <div className="fw-bold small">Database Schema</div>
                  <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill extra-small">In 3 days</span>
                </div>
                <div className="text-muted extra-small mt-1">Backend API Development</div>
              </div>
            </div>
            <div className="d-flex gap-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3 h-fit mt-1">
                <Clock className="text-primary" size={18} />
              </div>
              <div className="flex-grow-1 pb-1">
                <div className="d-flex justify-content-between">
                  <div className="fw-bold small">UI Mockups</div>
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill extra-small">Next Week</span>
                </div>
                <div className="text-muted extra-small mt-1">Frontend UI Design</div>
              </div>
            </div>
          </div>
          <button className="btn btn-link text-primary p-0 mt-3 text-decoration-none small fw-bold">View all deadlines →</button>
        </div>
      </div>

      {/* Row 3: Activity & Notes */}
      <div className="col-md-6 mt-4">
        <div className="card-custom p-4 h-100">
          <h5 className="fw-bold mb-4">Recent Activity</h5>
          <div className="d-flex gap-3 mb-4">
            <div className="bg-success bg-opacity-10 p-2 rounded-circle h-fit shadow-sm">
              <CheckSquare className="text-success" size={16} />
            </div>
            <div className="border-bottom border-opacity-10 pb-3 w-100">
              <p className="small mb-0 text-white"><strong>You</strong> completed the task <u>Setup Auth API</u></p>
              <span className="text-muted extra-small" style={{ fontSize: '11px' }}>2 hours ago</span>
            </div>
          </div>
          <div className="d-flex gap-3">
            <div className="bg-primary bg-opacity-10 p-2 rounded-circle h-fit shadow-sm">
              <MessageSquare className="text-primary" size={16} />
            </div>
            <div className="w-100">
              <p className="small mb-0 text-white"><strong>Rahul</strong> commented on <u>Database Design</u></p>
              <span className="text-muted extra-small" style={{ fontSize: '11px' }}>Yesterday at 4:30 PM</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 mt-4">
        <div className="card-custom p-4 h-100 bg-primary bg-opacity-10 border-primary border-opacity-25 shadow-none">
          <h5 className="fw-bold mb-3 text-primary">Quick Notes</h5>
          <textarea 
            className="form-control bg-transparent border-0 text-white shadow-none p-0 mt-2" 
            placeholder="Type a quick note here..." 
            rows="5"
            style={{ resize: 'none', fontSize: '14px' }}
          ></textarea>
          <div className="d-flex justify-content-end mt-3 pt-2">
            <button className="btn btn-primary btn-sm rounded-pill px-4 py-2">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  
  return <MainLayout>{children}</MainLayout>;
};

function App() {
  return (
    <div className="app-container min-vh-100" style={{ backgroundColor: '#020617' }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        {/* Placeholder for other protected routes */}
        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/viva" element={<ProtectedRoute><VivaTracker /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><div className="h2 fw-bold">Analytics</div></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><div className="h2 fw-bold">Settings</div></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
