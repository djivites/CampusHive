import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertTriangle, Lightbulb, BookOpen, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import API from '../api/axios';

const VivaTracker = () => {
  const [viva, setViva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchViva();
  }, []);

  const fetchViva = async () => {
    try {
      const { data } = await API.get('/viva');
      if (data.length > 0) setViva(data[0]); // For now, just the first viva
    } catch (error) {
      console.error('Error fetching viva:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viva) {
      const timer = setInterval(() => {
        const difference = +new Date(viva.date) - +new Date();
        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [viva]);

  const onCreateViva = async (data) => {
    try {
      // Add default milestones
      const milestones = [
        { title: 'Project Report Submission', date: new Date(new Date(data.date).getTime() - 7 * 24 * 60 * 60 * 1000) },
        { title: 'PPT Presentation Ready', date: new Date(new Date(data.date).getTime() - 3 * 24 * 60 * 60 * 1000) }
      ];
      await API.post('/viva', { ...data, milestones });
      setShowModal(false);
      reset();
      fetchViva();
    } catch (error) {
      alert('Error creating viva');
    }
  };

  const toggleMilestone = async (milestoneId) => {
    try {
      await API.put(`/viva/${viva._id}/milestones/${milestoneId}`);
      fetchViva();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading your schedule...</div>;

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Viva Tracker</h2>
          <p className="text-muted small mb-0">Stay prepared for your upcoming project defense</p>
        </div>
        {!viva && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm">
            <Plus size={18} />
            <span className="fw-bold small">Set Viva Date</span>
          </button>
        )}
      </div>

      {!viva ? (
        <div className="card-custom p-5 text-center">
          <Calendar className="text-muted mb-3" size={48} />
          <h4 className="fw-bold">No Viva Scheduled</h4>
          <p className="text-muted">Set your external or internal viva date to start the countdown.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary px-4 py-2 rounded-pill mt-3">Set Date Now</button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12">
            <div className="card-custom p-5 text-center border-primary border-opacity-25 shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(2, 6, 23, 0) 100%)' }}>
              <h5 className="text-primary fw-bold text-uppercase mb-4" style={{ letterSpacing: '2px', fontSize: '12px' }}>{viva.title} Countdown</h5>
              <div className="d-flex justify-content-center gap-2 gap-md-5">
                {['days', 'hours', 'minutes', 'seconds'].map((label) => (
                  <div key={label} className="text-center">
                    <div className="display-4 fw-bold text-white mb-0" style={{ fontSize: 'min(4rem, 10vw)' }}>{(timeLeft[label] || 0).toString().padStart(2, '0')}</div>
                    <div className="text-muted text-uppercase extra-small mt-2" style={{ letterSpacing: '1px', fontSize: '10px' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 d-flex align-items-center justify-content-center gap-2 text-warning small bg-warning bg-opacity-10 p-3 rounded-4 d-inline-flex">
                <AlertTriangle size={18} />
                <span className="fw-bold">Exam Date: {new Date(viva.date).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card-custom p-4 h-100">
              <h5 className="fw-bold mb-4">Preparation Timeline</h5>
              <div className="d-flex flex-column gap-4">
                {viva.milestones.map((m, i) => (
                  <div key={i} className="d-flex gap-4">
                    <div className="d-flex flex-column align-items-center">
                      <div 
                        onClick={() => toggleMilestone(m._id)}
                        className={`rounded-circle p-1 d-flex align-items-center justify-content-center shadow-sm cursor-pointer transition-all ${m.completed ? 'bg-success' : 'bg-secondary bg-opacity-25'}`} 
                        style={{ width: '28px', height: '28px' }}
                      >
                        <CheckCircle2 className="text-white" size={16} />
                      </div>
                      {i !== viva.milestones.length - 1 && <div className="vr h-100 my-2 opacity-10" style={{ width: '2px' }}></div>}
                    </div>
                    <div className="flex-grow-1 pb-3 border-bottom border-secondary border-opacity-10">
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className={`fw-bold mb-1 ${m.completed ? 'text-muted text-decoration-line-through' : 'text-white'}`}>{m.title}</h6>
                        <span className="text-muted extra-small fw-bold">{new Date(m.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card-custom p-4 h-100">
              <h5 className="fw-bold mb-4">Success Tips</h5>
              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10">
                  <div className="d-flex gap-3">
                    <Lightbulb className="text-primary" size={24} />
                    <div>
                      <h6 className="fw-bold text-primary small">Know Your Code</h6>
                      <p className="text-muted extra-small mb-0">Be ready to explain any function or database query in detail.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-10">
                  <div className="d-flex gap-3">
                    <BookOpen className="text-success" size={24} />
                    <div>
                      <h6 className="fw-bold text-success small">Literature Survey</h6>
                      <p className="text-muted extra-small mb-0">Understand the base papers and existing works.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Viva Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="card-custom p-4 p-md-5 w-100" style={{ maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Schedule Your Viva</h4>
              <button onClick={() => setShowModal(false)} className="btn btn-link text-muted p-0"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit(onCreateViva)}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">VIVA TYPE</label>
                <input type="text" className="form-control" placeholder="e.g. External Final Viva" {...register('title', { required: true })} />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">DATE & TIME</label>
                <input type="datetime-local" className="form-control" {...register('date', { required: true })} />
              </div>
              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold mt-3">Save Schedule</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VivaTracker;
