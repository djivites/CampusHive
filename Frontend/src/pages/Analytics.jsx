import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Clock, CheckCircle, Activity, 
  Target, BarChart3, PieChart as PieChartIcon 
} from 'lucide-react';
import API from '../api/axios';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await API.get('/analytics');
      setData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Analyzing project data...</div>;
  if (!data) return <div className="text-center py-5 text-danger">Error loading analytics.</div>;

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="mb-5">
        <h2 className="fw-bold mb-1 text-white">Analytics</h2>
        <p className="text-muted small">Track your team's performance and productivity</p>
      </div>

      {/* Key Stats */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card-custom p-4 border-primary border-opacity-10 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                <CheckCircle className="text-primary" size={20} />
              </div>
              <span className="text-success extra-small fw-bold">+12%</span>
            </div>
            <div className="h3 fw-bold mb-1 text-white">{data.completionRate}%</div>
            <div className="text-muted extra-small fw-bold text-uppercase">Completion Rate</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-custom p-4 border-success border-opacity-10 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-success bg-opacity-10 p-2 rounded-3">
                <Activity className="text-success" size={20} />
              </div>
              <span className="text-success extra-small fw-bold">-8%</span>
            </div>
            <div className="h3 fw-bold mb-1 text-white">{data.teamVelocity}</div>
            <div className="text-muted extra-small fw-bold text-uppercase">Team Velocity</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-custom p-4 border-warning border-opacity-10 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-warning bg-opacity-10 p-2 rounded-3">
                <Users className="text-warning" size={20} />
              </div>
              <span className="text-white extra-small fw-bold">100%</span>
            </div>
            <div className="h3 fw-bold mb-1 text-white">{data.activeMembers}</div>
            <div className="text-muted extra-small fw-bold text-uppercase">Active Members</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card-custom p-4 border-danger border-opacity-10 h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="bg-danger bg-opacity-10 p-2 rounded-3">
                <Clock className="text-danger" size={20} />
              </div>
              <span className="text-danger extra-small fw-bold">-15%</span>
            </div>
            <div className="h3 fw-bold mb-1 text-white">{data.avgTaskTime}d</div>
            <div className="text-muted extra-small fw-bold text-uppercase">Avg. Task Time</div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Task Completion Trend */}
        <div className="col-lg-7">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-primary" />
              <h6 className="fw-bold mb-0 text-white">Task Completion Trend</h6>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Team Productivity */}
        <div className="col-lg-5">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-4">
              <Users size={18} className="text-primary" />
              <h6 className="fw-bold mb-0 text-white">Team Productivity</h6>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.productivity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="tasks" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Sprint Velocity */}
        <div className="col-lg-7">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary" />
              <h6 className="fw-bold mb-0 text-white">Sprint Velocity</h6>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.sprintVelocity}>
                  <defs>
                    <linearGradient id="colorVel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVel)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="col-lg-5">
          <div className="card-custom p-4 h-100">
            <div className="d-flex align-items-center gap-2 mb-4">
              <PieChartIcon size={18} className="text-primary" />
              <h6 className="fw-bold mb-0 text-white">Priority Distribution</h6>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
