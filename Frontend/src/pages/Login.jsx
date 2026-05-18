import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "44299924980-la4b0rt901goku6b9j8dtmpsc06jj6kd.apps.googleusercontent.com",
        callback: handleGoogleResponse
      });
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        { theme: "outline", size: "large", width: "100%", text: "continue_with" }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    setError('');
    const result = await googleLogin(response.credential);
    if (!result.success) {
      setError(result.message);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    const result = await login(data.email, data.password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="card-custom p-4 p-md-5" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="text-center mb-5">
          <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 mb-4">
            <LogIn className="text-primary" size={32} />
          </div>
          <h2 className="fw-bold">Welcome Back</h2>
          <p className="text-muted">Enter your credentials to access CampusFlow</p>
        </div>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-3 py-3 px-4 mb-4" role="alert">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div className="small fw-semibold">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold mb-2">EMAIL ADDRESS</label>
            <div className="input-group has-validation">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <Mail size={18} />
              </span>
              <input
                type="email"
                className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                placeholder="name@university.edu"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>
          </div>

          <div className="mb-5">
            <div className="d-flex justify-content-between mb-2">
              <label className="form-label text-muted small fw-bold">PASSWORD</label>
              <a href="#" className="text-primary small text-decoration-none fw-semibold">Forgot?</a>
            </div>
            <div className="input-group has-validation">
              <span className="input-group-text bg-transparent border-end-0 text-muted">
                <Lock size={18} />
              </span>
              <input
                type="password"
                className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-4">
            Sign In
          </button>
          
          <div className="mb-5" style={{ display: 'flex', justifyContent: 'center' }}>
            <div ref={googleButtonRef} style={{ width: '100%' }}></div>
          </div>
        </form>

        <p className="text-center text-muted small mb-0">
          Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
