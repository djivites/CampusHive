import { useState, useEffect } from 'react';
import { FileText, Image, FileCode, MoreVertical, Upload, Search, Download, Trash2, FolderPlus, Link as LinkIcon, Globe, X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';

const Files = () => {
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState(location.state?.teamId ? 'team' : 'personal');
  const [activeTeamId, setActiveTeamId] = useState(location.state?.teamId || null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchPersonalFiles();
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data } = await API.get('/teams');
      setTeams(data);
      if (data.length > 0) setActiveTeamId(data[0]._id);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPersonalFiles = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/files');
      setFiles(data);
      setLinks([]);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamResources = async (teamId) => {
    setLoading(true);
    try {
      const { data } = await API.get(`/api/resources/team/${teamId}`);
      setFiles(data.files);
      setLinks(data.links);
    } catch (error) {
      console.error('Error fetching team resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'personal') {
      fetchPersonalFiles();
    } else if (activeTeamId) {
      fetchTeamResources(activeTeamId);
    }
  }, [activeTab, activeTeamId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (activeTab === 'team' && activeTeamId) {
      formData.append('teamId', activeTeamId);
    }

    setUploading(true);
    try {
      await API.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      activeTab === 'personal' ? fetchPersonalFiles() : fetchTeamResources(activeTeamId);
    } catch (error) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const onAddLink = async (data) => {
    try {
      await API.post('/resources/links', { ...data, teamId: activeTeamId });
      setShowLinkModal(false);
      reset();
      fetchTeamResources(activeTeamId);
    } catch (error) {
      alert('Error adding link');
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="text-danger" />;
      case 'JPG':
      case 'PNG':
      case 'JPEG': return <Image className="text-primary" />;
      case 'SQL':
      case 'JS':
      case 'PY': return <FileCode className="text-warning" />;
      default: return <FileText className="text-info" />;
    }
  };

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Resource Vault</h2>
          <p className="text-muted small mb-0">Manage your documents and shared team links</p>
        </div>
        <div className="d-flex gap-2">
          {activeTab === 'team' && (
            <button onClick={() => setShowLinkModal(true)} className="btn btn-outline-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm">
              <LinkIcon size={18} />
              <span className="fw-bold small">Add Link</span>
            </button>
          )}
          <label className={`btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm cursor-pointer ${uploading ? 'disabled' : ''}`}>
            <Upload size={18} />
            <span className="fw-bold small">{uploading ? 'Uploading...' : 'Upload File'}</span>
            <input type="file" className="d-none" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-4 mb-4 border-bottom border-secondary border-opacity-10">
        <button 
          onClick={() => setActiveTab('personal')}
          className={`btn btn-link text-decoration-none px-0 pb-3 fw-bold transition-all ${activeTab === 'personal' ? 'text-primary border-bottom border-3 border-primary' : 'text-muted'}`}
        >
          My Personal Files
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`btn btn-link text-decoration-none px-0 pb-3 fw-bold transition-all ${activeTab === 'team' ? 'text-primary border-bottom border-3 border-primary' : 'text-muted'}`}
        >
          Team Shared Vault
        </button>
      </div>

      {/* Team Selector if in Team Tab */}
      {activeTab === 'team' && teams.length > 0 && (
        <div className="mb-4">
          <label className="text-muted extra-small fw-bold mb-2 d-block text-uppercase">SELECT TEAM</label>
          <div className="d-flex gap-2 overflow-auto pb-2">
            {teams.map(team => (
              <button 
                key={team._id}
                onClick={() => setActiveTeamId(team._id)}
                className={`btn btn-sm rounded-pill px-4 py-2 transition-all ${activeTeamId === team._id ? 'btn-primary shadow-sm' : 'btn-dark bg-opacity-25 border-secondary border-opacity-25 text-muted'}`}
              >
                {team.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Files List */}
          {files.map((file) => (
            <div key={file._id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card-custom p-4 transition-all hover-translate-y h-100">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="bg-dark bg-opacity-50 p-3 rounded-4 shadow-sm">
                    {getFileIcon(file.type)}
                  </div>
                  <button className="btn btn-link text-muted p-0"><MoreVertical size={18} /></button>
                </div>
                <h6 className="fw-bold mb-1 text-white text-truncate">{file.name}</h6>
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-10">
                  <span className="text-muted extra-small">{file.size}</span>
                  <span className="text-muted extra-small">{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Links List (Only in Team Tab) */}
          {activeTab === 'team' && links.map((link) => (
            <div key={link._id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card-custom p-4 border-primary border-opacity-10 transition-all hover-translate-y h-100">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-4 shadow-sm">
                    <Globe className="text-primary" size={20} />
                  </div>
                  <button className="btn btn-link text-muted p-0"><MoreVertical size={18} /></button>
                </div>
                <h6 className="fw-bold mb-1 text-white text-truncate">{link.title}</h6>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-primary extra-small text-decoration-none d-block text-truncate mb-3">{link.url}</a>
                <div className="mt-auto pt-3 border-top border-secondary border-opacity-10">
                  <span className="text-muted extra-small">Added by {link.user.name}</span>
                </div>
              </div>
            </div>
          ))}

          {files.length === 0 && links.length === 0 && (
            <div className="col-12 text-center py-5 border border-dashed border-secondary border-opacity-25 rounded-4 bg-dark bg-opacity-10">
              <FolderPlus className="text-muted mb-3" size={32} />
              <p className="text-muted">This vault is currently empty. Start adding resources for your project.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Link Modal */}
      {showLinkModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center px-3" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="card-custom p-4 p-md-5 w-100" style={{ maxWidth: '450px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Add Team Resource</h4>
              <button onClick={() => setShowLinkModal(false)} className="btn btn-link text-muted p-0"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit(onAddLink)}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">TITLE</label>
                <input type="text" className="form-control" placeholder="e.g. Project GitHub Repo" {...register('title', { required: true })} />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">URL</label>
                <input type="url" className="form-control" placeholder="https://github.com/..." {...register('url', { required: true })} />
              </div>
              <button type="submit" className="btn btn-primary w-100 py-3 fw-bold mt-3">Save Resource</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Files;
