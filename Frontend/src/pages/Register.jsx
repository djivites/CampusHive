import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { UserPlus, Mail, Lock, User, UserCheck, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import API from '../api/axios';

const Register = () => {
  const { register: registerAuth } = useAuth();
  const [step, setStep] = useState('details'); // 'details' | 'verify'
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [message, setMessage] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleDetailsSubmit = async (data) => {
    setError('');
    setMessage('');
    setSendingOtp(true);
    try {
      const response = await API.post('/auth/send-otp', { email: data.email });
      setFormData(data);
      setStep('verify');
      setMessage(response.data?.message || 'Verification code sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setError('');

    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setRegistering(true);
    const result = await registerAuth({ ...formData, otp: otp.trim() });
    if (!result.success) {
      setError(result.message);
      setRegistering(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setMessage('');
    setSendingOtp(true);
    try {
      const response = await API.post('/auth/send-otp', { email: formData.email });
      setMessage(response.data?.message || 'Verification code resent successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleBack = () => {
    setStep('details');
    setError('');
    setMessage('');
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="card-custom p-4 p-md-5" style={{ maxWidth: '540px', width: '100%' }}>
        
        {step === 'details' ? (
          <>
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

            <form onSubmit={handleSubmit(handleDetailsSubmit)}>
              <div className="row">
                <div className="col-12 mb-4">
                  <label className="form-label text-muted small fw-bold mb-2">FULL NAME</label>
                  <div className="input-group has-validation">
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
                <div className="input-group has-validation">
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
                <div className="input-group has-validation">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="••••••••"
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                      validate: {
                        hasUppercase: (value) => 
                          /[A-Z]/.test(value) || 'Must contain at least one uppercase letter',
                        hasLowercase: (value) => 
                          /[a-z]/.test(value) || 'Must contain at least one lowercase letter',
                        hasNumber: (value) => 
                          /[0-9]/.test(value) || 'Must contain at least one number',
                        hasSpecialChar: (value) => 
                          /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Must contain at least one special character',
                      }
                    })}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>
              </div>

              <button type="submit" disabled={sendingOtp} className="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2">
                {sendingOtp ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    Sending Code...
                  </>
                ) : 'Send Verification Code'}
              </button>
            </form>

            <p className="text-center text-muted small mb-0">
              Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 mb-4">
                <UserCheck className="text-primary" size={32} />
              </div>
              <h2 className="fw-bold">Verify Your Email</h2>
              <p className="text-muted">We sent a 6-digit code to <strong className="text-white-50">{formData?.email}</strong></p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-3 py-3 px-4 mb-4" role="alert">
                <AlertCircle size={20} className="flex-shrink-0" />
                <div className="small fw-semibold">{error}</div>
              </div>
            )}

            {message && (
              <div className="alert alert-success d-flex align-items-center gap-3 py-3 px-4 mb-4" role="alert">
                <UserCheck size={20} className="flex-shrink-0 text-success" />
                <div className="small fw-semibold text-success">{message}</div>
              </div>
            )}

            <form onSubmit={handleVerifySubmit}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold mb-2">VERIFICATION CODE</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 text-muted">
                    <Lock size={18} />
                  </span>
                  <input
                    type="text"
                    maxLength="6"
                    className={`form-control border-start-0 ${otpError ? 'is-invalid' : ''}`}
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numeric only
                  />
                  {otpError && <div className="invalid-feedback d-block">{otpError}</div>}
                </div>
              </div>

              <button type="submit" disabled={registering} className="btn btn-primary w-100 mb-4 d-flex align-items-center justify-content-center gap-2">
                {registering ? (
                  <>
                    <RefreshCw size={18} className="spinner" />
                    Registering Account...
                  </>
                ) : 'Verify & Register'}
              </button>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <button type="button" onClick={handleBack} disabled={registering} className="btn btn-link text-decoration-none text-muted small p-0 d-flex align-items-center gap-1">
                  <ArrowLeft size={14} /> Back to email
                </button>
                <button type="button" onClick={handleResendOtp} disabled={sendingOtp || registering} className="btn btn-link text-decoration-none text-primary small p-0 fw-semibold">
                  {sendingOtp ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
