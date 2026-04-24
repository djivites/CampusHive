import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Clock, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import API from '../api/axios';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const columns = ['Todo', 'In Progress', 'Review', 'Completed'];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await API.post('/tasks', data);
      setShowModal(false);
      reset();
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // For now, we'll just implement a simple status update API later or use this logic
      // In a real app, you'd have a PUT /tasks/:id route
      console.log('Update status to:', newStatus);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">My Tasks</h2>
          <p className="text-muted small mb-0">Manage and track your project milestones</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm"
        >
          <Plus size={18} />
          <span className="fw-bold small">New Task</span>
        </button>
      </div>

      <div className="row g-4 overflow-auto flex-nowrap pb-4" style={{ minHeight: '70vh' }}>
        {columns.map(column => (
          <div key={column} className="col-md-3" style={{ minWidth: '320px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
              <div className="d-flex align-items-center gap-2">
                <h6 className="fw-bold mb-0 text-white">{column}</h6>
                <span className="badge bg-dark border border-secondary border-opacity-25 rounded-pill text-muted extra-small py-1 px-2">
                  {tasks.filter(t => t.status === column).length}
                </span>
              </div>
              <button className="btn btn-link text-muted p-0 hover-text-white transition-all">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="d-flex flex-column gap-3">
              {tasks.filter(t => t.status === column).map(task => (
                <div 
                  key={task._id} 
                  className="card-custom p-3 border-start border-4 hover-translate-y transition-all cursor-pointer" 
                  style={{ borderLeftColor: getPriorityColor(task.priority) + ' !important' }}
                >
                  <div className="d-flex justify-content-between mb-2">
                    <span className={`extra-small fw-bold text-uppercase`} style={{ color: getPriorityColor(task.priority), fontSize: '10px', letterSpacing: '0.5px' }}>
                      {task.priority} Priority
                    </span>
                    <div className="dropdown">
                      <button className="btn btn-link p-0 text-muted" data-bs-toggle="dropdown">
                        <MoreVertical size={14} />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end p-2 border-secondary border-opacity-25">
                        {columns.filter(c => c !== column).map(c => (
                          <li key={c}><button className="dropdown-item small" onClick={() => updateStatus(task._id, c)}>Move to {c}</button></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <h6 className="fw-bold mb-2 small text-white line-clamp-1">{task.title}</h6>
                  <p className="text-muted extra-small mb-3 line-clamp-2" style={{ lineHeight: '1.5' }}>
                    {task.description || 'No description provided.'}
                  </p>
                  <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top border-secondary border-opacity-10">
                    <div className="d-flex align-items-center gap-1 text-muted extra-small">
                      <Clock size={12} />
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}</span>
                    </div>
                    <div className="bg-primary bg-opacity-20 rounded-pill px-2 py-1 d-flex align-items-center gap-1">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '18px', height: '18px', fontSize: '9px' }}>
                        U
                      </div>
                      <span className="text-primary fw-bold" style={{ fontSize: '9px' }}>YOU</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty State for Column */}
              {tasks.filter(t => t.status === column).length === 0 && (
                <div className="text-center py-5 rounded-4 border border-dashed border-secondary border-opacity-25 mt-2 bg-dark bg-opacity-10">
                  <p className="text-muted extra-small mb-0">No tasks in {column}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="card-custom p-4 p-md-5 w-100" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Create New Task</h4>
              <button onClick={() => setShowModal(false)} className="btn btn-link text-muted p-0"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">TASK TITLE</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="e.g. Design Database Schema"
                  {...register('title', { required: 'Title is required' })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">DESCRIPTION</label>
                <textarea 
                  className="form-control"
                  placeholder="What needs to be done?"
                  rows="3"
                  {...register('description')}
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label text-muted small fw-bold mb-2">PRIORITY</label>
                  <select className="form-select" {...register('priority')}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="form-label text-muted small fw-bold mb-2">DUE DATE</label>
                  <input type="date" className="form-control" {...register('dueDate')} />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">INITIAL STATUS</label>
                <select className="form-select" {...register('status')}>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="d-flex gap-3 mt-5">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline-secondary flex-fill py-2 fw-bold">Cancel</button>
                <button type="submit" className="btn btn-primary flex-fill py-2 fw-bold">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return '#ef4444';
    case 'Medium': return '#f59e0b';
    case 'Low': return '#10b981';
    default: return '#6366f1';
  }
};

export default Tasks;
