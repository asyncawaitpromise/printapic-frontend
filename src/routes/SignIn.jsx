import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle } from 'react-feather';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, requestPasswordReset, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle regular sign in
  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        // Redirect to intended location or camera page
        const from = location.state?.from?.pathname || '/camera';
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  // Handle Google OAuth sign in
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Redirect to intended location or camera page
        const from = location.state?.from?.pathname || '/camera';
        navigate(from, { replace: true });
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setErrors({ general: 'Google sign in failed. Please try again.' });
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      setErrors({ forgotPassword: 'Please enter your email address' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setErrors({ forgotPassword: 'Please enter a valid email address' });
      return;
    }
    
    try {
      const result = await requestPasswordReset(forgotPasswordEmail);
      
      if (result.success) {
        setForgotPasswordSent(true);
        setErrors({});
      } else {
        setErrors({ forgotPassword: result.error });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ forgotPassword: 'Failed to send reset email. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <button 
              onClick={() => navigate('/')}
              className="btn btn-ghost btn-sm gap-2 mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-base-content/70">
              Sign in to your Print A Pic account
            </p>
          </div>

          {/* Sign In Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              
              {/* Google Sign In Button */}
              <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="btn btn-outline btn-block gap-2 mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                  <path fill="#EA4335" d="M8.98 4.72c1.16 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-2.7z"/>
                </svg>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="divider">OR</div>

              {/* Error Message */}
              {errors.general && (
                <div className="alert alert-error mb-4">
                  <AlertCircle size={16} />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Email/Password Form */}
              {!showForgotPassword ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Email Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={`input input-bordered w-full pl-10 ${errors.email ? 'input-error' : ''}`}
                        disabled={isLoading}
                      />
                      <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                    </div>
                    {errors.email && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.email}</span>
                      </label>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                        disabled={isLoading}
                      />
                      <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40 hover:text-base-content"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.password}</span>
                      </label>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="link link-primary text-sm"
                    >
                      Forgot your password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary btn-block"
                  >
                    {isLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              ) : (
                /* Forgot Password Form */
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Reset Password</h3>
                    <p className="text-sm text-base-content/70">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  {forgotPasswordSent ? (
                    <div className="alert alert-success">
                      <AlertCircle size={16} />
                      <span>Password reset email sent! Check your inbox.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Email</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={`input input-bordered w-full pl-10 ${errors.forgotPassword ? 'input-error' : ''}`}
                            disabled={isLoading}
                          />
                          <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
                        </div>
                        {errors.forgotPassword && (
                          <label className="label">
                            <span className="label-text-alt text-error">{errors.forgotPassword}</span>
                          </label>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary btn-block"
                      >
                        {isLoading ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Sending...
                          </>
                        ) : (
                          'Send Reset Email'
                        )}
                      </button>
                    </form>
                  )}

                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordSent(false);
                      setForgotPasswordEmail('');
                      setErrors({});
                    }}
                    className="btn btn-ghost btn-block"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}

              {/* Sign Up Link */}
              {!showForgotPassword && (
                <div className="text-center mt-6">
                  <p className="text-sm text-base-content/70">
                    Don't have an account?{' '}
                    <Link to="/signup" className="link link-primary">
                      Sign up here
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 