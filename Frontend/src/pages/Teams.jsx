import { useState, useEffect } from 'react';
import { 
  Users, Plus, Mail, UserPlus, Shield, ExternalLink, X, 
  LayoutDashboard, CheckSquare, MessageSquare, FolderKanban, 
  StickyNote, Milestone, Crown, Search, Trash2, Clock, AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Teams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [teamTasks, setTeamTasks] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [teamMode, setTeamMode] = useState('Leader');
  
  const { register, handleSubmit: handleCreateSubmit, reset: resetCreate } = useForm();
  const { register: registerInvite, handleSubmit: handleInviteSubmit, reset: resetInvite } = useForm();
  const { register: registerTask, handleSubmit: handleTaskSubmit, reset: resetTask } = useForm();

  const tabs = ['Overview', 'Tasks', 'Chat', 'Files', 'Notes', 'Viva'];

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam && activeTab === 'Tasks') {
      fetchTeamTasks();
    }
  }, [selectedTeam, activeTab]);

  const fetchTeams = async () => {
    try {
      const { data } = await API.get('/teams');
      setTeams(data);
      if (data.length > 0 && !selectedTeam) setSelectedTeam(data[0]);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamTasks = async () => {
    try {
      const { data } = await API.get(`/tasks/team/${selectedTeam._id}`);
      setTeamTasks(data);
    } catch (error) {
      console.error('Error fetching team tasks:', error);
    }
  };

  const onCreateTeam = async (data) => {
    try {
      const { data: newTeam } = await API.post('/teams', { ...data, mode: teamMode });
      setShowCreateModal(false);
      resetCreate();
      fetchTeams();
      setSelectedTeam(newTeam);
    } catch (error) {
      alert('Error creating team');
    }
  };

  const onCreateTask = async (data) => {
    try {
      await API.post('/tasks', { ...data, team: selectedTeam._id });
      setShowTaskModal(false);
      resetTask();
      fetchTeamTasks();
    } catch (error) {
      alert('Error creating task');
    }
  };

  const onDeleteTeam = async () => {
    if (window.confirm('Delete this team?')) {
      try {
        await API.delete(`/teams/${selectedTeam._id}`);
        setSelectedTeam(null);
        fetchTeams();
      } catch (error) {
        alert('Error deleting team');
      }
    }
  };

  const onInviteMember = async (data) => {
    try {
      await API.post(`/teams/${selectedTeam._id}/members`, data);
      setShowInviteModal(false);
      resetInvite();
      fetchTeams();
    } catch (error) {
      alert(error.response?.data?.message || 'Error inviting member');
    }
  };

  const canCreateTask = () => {
    if (!selectedTeam) return false;
    if (selectedTeam.mode === 'Normal') return true;
    return selectedTeam.lead._id === user._id;
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading Workspace...</div>;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Teams</h2>
          <p className="text-muted small mb-0">Collaborate with your team members</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm">
          <Plus size={18} />
          <span className="fw-bold small">Create Team</span>
        </button>
      </div>

      <div className="row g-4" style={{ height: 'calc(100vh - 180px)' }}>
        {/* LEFT COLUMN */}
        <div className="col-md-4 col-lg-3 h-100 overflow-auto pe-3">
          <div className="text-muted extra-small fw-bold mb-3 text-uppercase px-2">Your Teams</div>
          {teams.map((team, index) => (
            <div 
              key={team._id}
              onClick={() => setSelectedTeam(team)}
              className={`p-3 rounded-4 mb-3 cursor-pointer transition-all border-2 ${selectedTeam?._id === team._id ? 'bg-primary bg-opacity-10 border-primary shadow-sm' : 'bg-dark bg-opacity-25 border-transparent hover-bg-dark border border-secondary border-opacity-10'}`}
            >
              <div className="d-flex align-items-center gap-3">
                <div className={`p-2 rounded-3 shadow-sm ${getTeamColor(index)}`}>
                  <Users size={20} className="text-white" />
                </div>
                <div className="flex-grow-1 overflow-hidden">
                  <h6 className="fw-bold mb-0 text-white text-truncate">{team.name}</h6>
                  <span className="text-muted extra-small">{team.members.length} members • {team.mode || 'Leader'}</span>
                </div>
                {team.mode === 'Leader' && team.lead._id === user._id && <Crown size={12} className="text-warning" />}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-md-8 col-lg-9 h-100 overflow-auto">
          {selectedTeam ? (
            <div className="card-custom h-100 d-flex flex-column p-0 overflow-hidden border-secondary border-opacity-10 shadow-lg">
              {/* Header */}
              <div className="p-4 p-md-5 bg-dark bg-opacity-25 border-bottom border-secondary border-opacity-10">
                <div className="d-flex justify-content-between align-items-center gap-4">
                  <div className="d-flex align-items-center gap-4">
                    <div className="bg-primary p-4 rounded-4 shadow-lg"><Users size={32} className="text-white" /></div>
                    <div>
                      <h3 className="fw-bold text-white mb-1">{selectedTeam.name}</h3>
                      <div className="badge bg-primary bg-opacity-10 text-primary small">{selectedTeam.mode || 'Leader'} Mode</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button onClick={() => setShowInviteModal(true)} className="btn btn-outline-primary rounded-pill px-4 py-2 small fw-bold">Invite Member</button>
                    {selectedTeam.lead._id === user._id && <button onClick={onDeleteTeam} className="btn btn-outline-danger rounded-pill px-4 py-2 small fw-bold"><Trash2 size={14} /></button>}
                  </div>
                </div>
                <div className="d-flex gap-4 mt-5">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`btn btn-link text-decoration-none px-4 py-2 rounded-pill small fw-bold transition-all ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-muted hover-text-white'}`}>{tab}</button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 p-md-5 flex-grow-1">
                {activeTab === 'Overview' && (
                  <>
                    <h5 className="fw-bold mb-4 text-white">Team Members</h5>
                    <div className="d-flex flex-column gap-2 mb-5">
                      {selectedTeam.members.map((member) => (
                        <div key={member._id} className="d-flex align-items-center justify-content-between p-3 bg-dark bg-opacity-25 rounded-4 border border-secondary border-opacity-10">
                          <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '36px', height: '36px' }}>{member.name[0]}</div>
                            <div>
                              <div className="fw-bold text-white small">{member.name}</div>
                              <div className="text-muted extra-small">{selectedTeam.lead._id === member._id ? 'Team Leader' : 'Developer'}</div>
                            </div>
                          </div>
                          <div className="text-muted small">{member.email}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'Tasks' && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold mb-0 text-white">Team Tasks</h5>
                      {canCreateTask() && (
                        <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm rounded-pill px-4">
                          <Plus size={16} className="me-2" /> New Task
                        </button>
                      )}
                    </div>
                    <div className="row g-4">
                      {teamTasks.map(task => (
                        <div key={task._id} className="col-md-6">
                          <div className="card-custom p-4 bg-dark bg-opacity-25 border-secondary border-opacity-10 h-100">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <h6 className="fw-bold text-white mb-0">{task.title}</h6>
                              <div className={`badge ${task.status === 'Completed' ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${task.status === 'Completed' ? 'text-success' : 'text-warning'} extra-small`}>{task.status}</div>
                            </div>
                            <p className="text-muted extra-small mb-4 line-clamp-2">{task.description}</p>
                            <div className="mt-auto pt-3 border-top border-secondary border-opacity-10 d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white extra-small" style={{ width: '20px', height: '20px' }}>{task.assignedTo?.name?.[0] || '?'}</div>
                                <span className="text-muted extra-small">Assignee: <span className="text-white-50">{task.assignedTo?.name || 'Unassigned'}</span></span>
                              </div>
                              <span className="text-muted extra-small d-flex align-items-center gap-1"><Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {teamTasks.length === 0 && <div className="text-center py-5"><AlertCircle className="text-muted mb-2" size={32} /><p className="text-muted small">No tasks created yet.</p></div>}
                    </div>
                  </div>
                )}

                {activeTab !== 'Overview' && activeTab !== 'Tasks' && (
                  <div className="text-center py-5"><div className="bg-dark bg-opacity-25 p-5 rounded-circle d-inline-block mb-4">{getTabIcon(activeTab)}</div><h5 className="fw-bold text-white">Team {activeTab}</h5><p className="text-muted small mx-auto" style={{ maxWidth: '300px' }}>Synchronized with the main {activeTab} module.</p></div>
                )}
              </div>
            </div>
          ) : (
            <div className="card-custom h-100 d-flex flex-column align-items-center justify-content-center p-5 opacity-50"><Users size={64} className="mb-4" /><h4>No Team Selected</h4></div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="card-custom p-4 p-md-5 w-100 border-primary border-opacity-25" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">New Team Task</h4><button onClick={() => setShowTaskModal(false)} className="btn btn-link text-muted p-0"><X size={24} /></button></div>
            <form onSubmit={handleTaskSubmit(onCreateTask)}>
              <div className="mb-3"><label className="form-label text-muted small fw-bold mb-1">TASK TITLE</label><input type="text" className="form-control" {...registerTask('title', { required: true })} /></div>
              <div className="mb-3"><label className="form-label text-muted small fw-bold mb-1">DESCRIPTION</label><textarea className="form-control" rows="2" {...registerTask('description')}></textarea></div>
              <div className="row g-3 mb-3">
                <div className="col-6"><label className="form-label text-muted small fw-bold mb-1">DUE DATE</label><input type="date" className="form-control" {...registerTask('dueDate', { required: true })} /></div>
                <div className="col-6"><label className="form-label text-muted small fw-bold mb-1">PRIORITY</label><select className="form-select" {...registerTask('priority')}><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-1">ASSIGN TO MEMBER</label>
                <select className="form-select" {...registerTask('assignedTo', { required: true })}>
                  <option value="">Select Member</option>
                  {selectedTeam.members.map(m => <option key={m._id} value={m._id}>{m.name} {m._id === user._id ? '(You)' : ''}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-lg">Assign Task</button>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="card-custom p-4 p-md-5 w-100 border-primary border-opacity-25" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">Start a New Project</h4><button onClick={() => setShowCreateModal(false)} className="btn btn-link text-muted p-0"><X size={24} /></button></div>
            <form onSubmit={handleCreateSubmit(onCreateTeam)}>
              <div className="mb-4"><label className="form-label text-muted small fw-bold mb-2 text-uppercase">Team Name</label><input type="text" className="form-control" {...register('name', { required: true })} /></div>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-3 d-block text-uppercase">Workspace Mode</label>
                <div className="row g-3">
                  <div className="col-6"><div onClick={() => setTeamMode('Leader')} className={`p-3 rounded-4 cursor-pointer border-2 transition-all text-center ${teamMode === 'Leader' ? 'bg-primary bg-opacity-10 border-primary' : 'bg-dark bg-opacity-25 border-transparent opacity-50'}`}><Shield size={20} className="mb-2" /><div className="fw-bold small">Leader Mode</div></div></div>
                  <div className="col-6"><div onClick={() => setTeamMode('Normal')} className={`p-3 rounded-4 cursor-pointer border-2 transition-all text-center ${teamMode === 'Normal' ? 'bg-info bg-opacity-10 border-info' : 'bg-dark bg-opacity-25 border-transparent opacity-50'}`}><Users size={20} className="mb-2" /><div className="fw-bold small">Normal Mode</div></div></div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-lg">Create Workspace</button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="card-custom p-4 p-md-5 w-100 border-primary border-opacity-25" style={{ maxWidth: '450px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold mb-0">Invite Member</h4><button onClick={() => setShowInviteModal(false)} className="btn btn-link text-muted p-0"><X size={24} /></button></div>
            <form onSubmit={handleInviteSubmit(onInviteMember)}><div className="mb-4"><input type="email" className="form-control py-3" placeholder="student@university.edu" {...registerInvite('email', { required: true })} /></div><button type="submit" className="btn btn-primary w-100 py-3 fw-bold shadow-lg">Send Invitation</button></form>
          </div>
        </div>
      )}
    </div>
  );
};

const getTeamColor = (index) => {
  const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info'];
  return colors[index % colors.length];
};

const getTabIcon = (tab) => {
  switch (tab) {
    case 'Chat': return <MessageSquare size={48} className="text-primary" />;
    case 'Files': return <FolderKanban size={48} className="text-primary" />;
    case 'Notes': return <StickyNote size={48} className="text-primary" />;
    case 'Viva': return <Milestone size={48} className="text-primary" />;
    default: return <LayoutDashboard size={48} className="text-primary" />;
  }
};

export default Teams;
