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
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
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
    completionPercentage: 0,
    upcomingDeadlines: [],
    recentActivity: [],
    chartData: [],
    daysToViva: 0
  });
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, noteRes] = await Promise.all([
          API.get('/tasks/stats'),
          API.get('/notes')
        ]);
        setStats(statsRes.data);
        setNote(noteRes.data.content);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await API.post('/notes', { content: note });
      alert('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    } finally {
      setSavingNote(false);
    }
  };

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
          <div className="h2 fw-bold mb-0">{stats.daysToViva || '0'}</div>
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
              <AreaChart data={stats.chartData.length > 0 ? stats.chartData : chartData}>
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
            {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((task, idx) => {
              const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const badgeClass = daysLeft <= 1 ? 'bg-danger' : daysLeft <= 3 ? 'bg-warning' : 'bg-primary';
              const badgeText = daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `In ${daysLeft} days`;
              
              return (
                <div key={task._id} className="d-flex gap-3">
                  <div className={`${badgeClass} bg-opacity-10 p-2 rounded-3 h-fit mt-1`}>
                    <Clock className={badgeClass.replace('bg-', 'text-')} size={18} />
                  </div>
                  <div className={`flex-grow-1 ${idx !== stats.upcomingDeadlines.length - 1 ? 'border-bottom border-opacity-10 pb-3' : 'pb-1'}`}>
                    <div className="d-flex justify-content-between">
                      <div className="fw-bold small line-clamp-1">{task.title}</div>
                      <span className={`badge ${badgeClass} bg-opacity-10 ${badgeClass.replace('bg-', 'text-')} rounded-pill extra-small`}>
                        {badgeText}
                      </span>
                    </div>
                    <div className="text-muted extra-small mt-1">{task.team?.name || 'Personal Project'}</div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-muted small">No upcoming deadlines.</p>
            )}
          </div>
          <button className="btn btn-link text-primary p-0 mt-3 text-decoration-none small fw-bold" onClick={() => navigate('/tasks')}>View all tasks →</button>
        </div>
      </div>

      {/* Row 3: Activity & Notes */}
      <div className="col-md-6 mt-4">
        <div className="card-custom p-4 h-100">
          <h5 className="fw-bold mb-4">Recent Activity</h5>
          {stats.recentActivity.length > 0 ? stats.recentActivity.map((task, idx) => (
            <div key={task._id} className="d-flex gap-3 mb-4 last-no-mb">
              <div className={`bg-${task.status === 'Completed' ? 'success' : 'primary'} bg-opacity-10 p-2 rounded-circle h-fit shadow-sm`}>
                {task.status === 'Completed' ? <CheckSquare className="text-success" size={16} /> : <Clock className="text-primary" size={16} />}
              </div>
              <div className={`${idx !== stats.recentActivity.length - 1 ? 'border-bottom border-opacity-10 pb-3' : ''} w-100`}>
                <p className="small mb-0 text-white">
                  <strong>You</strong> {task.status === 'Completed' ? 'completed' : 'updated'} the task <u>{task.title}</u>
                </p>
                <span className="text-muted extra-small" style={{ fontSize: '11px' }}>
                  {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )) : (
            <p className="text-muted small">No recent activity.</p>
          )}
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
            value={note}
            onChange={(e) => setNote(e.target.value)}
          ></textarea>
          <div className="d-flex justify-content-end mt-3 pt-2">
            <button 
              onClick={handleSaveNote}
              disabled={savingNote}
              className="btn btn-primary btn-sm rounded-pill px-4 py-2"
            >
              {savingNote ? 'Saving...' : 'Save Note'}
            </button>
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
  const { user } = useAuth();

  useEffect(() => {
    const theme = user?.settings?.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [user]);

  return (
    <div className="app-container min-vh-100">
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
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
