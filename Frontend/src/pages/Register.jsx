import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { UserPlus, Mail, Lock, User, UserCheck, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    const result = await registerAuth(data);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="card-custom p-4 p-md-5" style={{ maxWidth: '540px', width: '100%' }}>
        <div className="text-center mb-5">
          <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 mb-4">
            <UserPlus className="text-primary" size={32} />
          </div>
          <h2 className="fw-bold">Create Account</h2>
          <p className="text-muted">Join the CampusFlow ecosystem today</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-3 py-3 px-4 mb-4" role="alert">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div className="small fw-semibold">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12 mb-4">
              <label className="form-label text-muted small fw-bold mb-2">FULL NAME</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0 text-muted">
                  <User size={18} />
                </span>
                <input
                  type="text"
                  className={`form-control border-start-0 ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted small fw-bold mb-2">UNIVERSITY EMAIL</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                placeholder="john@university.edu"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>
          </div>


          <div className="mb-5">
            <label className="form-label text-muted small fw-bold mb-2">PASSWORD</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' }
                })}
              />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Create Account
          </button>
        </form>

        <p className="text-center text-muted small mb-0">
          Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
