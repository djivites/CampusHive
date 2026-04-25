import { useState, useEffect } from 'react';
import { 
  User, Bell, Shield, Palette, Trash2, 
  Moon, Sun, Check, Mail, Camera 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Settings = () => {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    teamActivity: false,
    allowFileUploads: true,
    taskCreation: true,
    inviteMembers: false,
    theme: 'dark'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data } = await API.get('/users/profile');
      setProfile({
        name: data.name,
        email: data.email,
        bio: data.bio || ''
      });
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/users/profile', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingToggle = async (key) => {
    const newVal = !settings[key];
    setSettings({ ...settings, [key]: newVal });
    try {
      await API.put('/users/settings', { [key]: newVal });
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('CRITICAL: This will permanently delete your account and all data. Are you absolutely sure?')) {
      try {
        await API.delete('/users');
        logout();
      } catch (error) {
        alert('Error deleting account');
      }
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading preferences...</div>;

  return (
    <div className="container-fluid p-0 pb-5">
      <div className="mb-5">
        <h2 className="fw-bold mb-1 text-white">Settings</h2>
        <p className="text-muted small">Manage your account and preferences</p>
      </div>

      <div className="d-flex flex-column gap-5">
        {/* Profile Settings */}
        <div className="card-custom p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 mb-5">
            <User className="text-primary" size={24} />
            <h5 className="fw-bold mb-0 text-white">Profile Settings</h5>
          </div>

          <div className="d-flex align-items-center gap-4 mb-5">
            <div className="position-relative">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-lg" style={{ width: '100px', height: '100px', fontSize: '32px' }}>
                {profile.name[0]}
              </div>
              <button className="btn btn-dark btn-sm rounded-circle position-absolute bottom-0 end-0 p-2 border border-secondary border-opacity-25 shadow">
                <Camera size={16} />
              </button>
            </div>
            <button className="btn btn-primary rounded-pill px-4 fw-bold small">Change Avatar</button>
          </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold mb-2">FULL NAME</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold mb-2">EMAIL</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-5">
              <label className="form-label text-muted small fw-bold mb-2">BIO</label>
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Tell us about yourself..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill fw-bold shadow-lg" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Notifications */}
        <div className="card-custom p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 mb-5">
            <Bell className="text-success" size={24} />
            <h5 className="fw-bold mb-0 text-white">Notifications</h5>
          </div>

          <div className="d-flex flex-column gap-4">
            <div className="d-flex justify-content-between align-items-center pb-4 border-bottom border-secondary border-opacity-10">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Email Notifications</h6>
                <p className="text-muted extra-small mb-0">Receive email updates about your tasks and deadlines</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.emailNotifications} onChange={() => handleSettingToggle('emailNotifications')} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center pb-4 border-bottom border-secondary border-opacity-10">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Push Notifications</h6>
                <p className="text-muted extra-small mb-0">Get push notifications for important updates</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.pushNotifications} onChange={() => handleSettingToggle('pushNotifications')} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center pb-4 border-bottom border-secondary border-opacity-10">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Task Reminders</h6>
                <p className="text-muted extra-small mb-0">Receive reminders for upcoming deadlines</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.taskReminders} onChange={() => handleSettingToggle('taskReminders')} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Team Activity</h6>
                <p className="text-muted extra-small mb-0">Get notified when team members make updates</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.teamActivity} onChange={() => handleSettingToggle('teamActivity')} />
              </div>
            </div>
          </div>
        </div>

        {/* Team Permissions */}
        <div className="card-custom p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 mb-5">
            <Shield className="text-warning" size={24} />
            <h5 className="fw-bold mb-0 text-white">Team Permissions</h5>
          </div>

          <div className="d-flex flex-column gap-4">
            <div className="d-flex justify-content-between align-items-center pb-4 border-bottom border-secondary border-opacity-10">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Allow File Uploads</h6>
                <p className="text-muted extra-small mb-0">Team members can upload files to shared workspace</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.allowFileUploads} onChange={() => handleSettingToggle('allowFileUploads')} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center pb-4 border-bottom border-secondary border-opacity-10">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Task Creation</h6>
                <p className="text-muted extra-small mb-0">All members can create and assign tasks</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.taskCreation} onChange={() => handleSettingToggle('taskCreation')} />
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-bold mb-1 text-white small">Invite Members</h6>
                <p className="text-muted extra-small mb-0">Members can invite new people to the team</p>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input custom-switch" type="checkbox" checked={settings.inviteMembers} onChange={() => handleSettingToggle('inviteMembers')} />
              </div>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card-custom p-4 p-md-5">
          <div className="d-flex align-items-center gap-3 mb-5">
            <Palette className="text-info" size={24} />
            <h5 className="fw-bold mb-0 text-white">Appearance</h5>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div 
                onClick={() => handleSettingToggle('theme')}
                className={`p-4 rounded-4 cursor-pointer border-2 transition-all d-flex flex-column align-items-center gap-3 ${settings.theme === 'dark' ? 'bg-primary bg-opacity-10 border-primary shadow-lg' : 'bg-dark bg-opacity-25 border-transparent opacity-50'}`}
              >
                <div className="bg-dark p-4 rounded-3 border border-secondary border-opacity-25 w-100 text-center">
                  <Moon size={32} className="text-primary" />
                </div>
                <h6 className="fw-bold mb-0 text-white small">Dark Mode</h6>
              </div>
            </div>
            <div className="col-md-6">
              <div 
                className={`p-4 rounded-4 cursor-not-allowed border-2 transition-all d-flex flex-column align-items-center gap-3 opacity-25`}
              >
                <div className="bg-white p-4 rounded-3 border border-secondary border-opacity-25 w-100 text-center">
                  <Sun size={32} className="text-dark" />
                </div>
                <h6 className="fw-bold mb-0 text-white small">Light Mode</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-custom p-4 p-md-5 border-danger border-opacity-10 bg-danger bg-opacity-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <Trash2 className="text-danger" size={24} />
            <h5 className="fw-bold mb-0 text-danger">Danger Zone</h5>
          </div>
          <p className="text-muted small mb-4">Once you delete your account, there is no going back. Please be certain.</p>
          <button onClick={handleDeleteAccount} className="btn btn-danger rounded-pill px-5 fw-bold shadow-lg">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
