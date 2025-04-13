import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { useGoogleLogin , useGoogleOneTapLogin  } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../../components/loading/loading';
import { FcGoogle } from 'react-icons/fc';
import './login.css';
import axios from 'axios';
import PhoneNumberModal from '../../../components/phoneNumberModal/phoneNumberModal';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [phone, setPhone] = useState('+201012345678'); 
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [googleAuthData, setGoogleAuthData] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const { login, handleGoogleLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('Full Google Response:', response);
        console.log('Authorization Code:', response.code);
        setGoogleAuthData(response);
        setAuthMode('code');
        setShowPhoneModal(true);
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed');
      }
    },
    flow: 'auth-code',
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    scope: 'email profile'
  });
  
  // For automatic popup
  useGoogleOneTapLogin({
    onSuccess: credentialResponse => {
      console.log(credentialResponse);
      setGoogleAuthData(credentialResponse);
      setAuthMode('credential');
      setShowPhoneModal(true);
    },
    onError: () => {
      console.log('Login Failed');
    },
    auto_select: true, 
    cancel_on_tap_outside: true,
    use_fedcm_for_prompt: true,
  });

  const handlePhoneSubmit = async (data) => {
    try {
      const result = await handleGoogleLogin(data.mode, {
        phoneNumber: data.phoneNumber,
        code: data.code,
        credential: data.credential
      });

      if (result.success) {
        toast.success('Google login successful!');
        setShowPhoneModal(false);
        navigate('/', { replace: true });
      } else {
        toast.error('Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to complete Google login');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const result = await login('credentials', {
        email: email,
        password: password
      });
      
      if (result?.success) {
        toast.success('Logged in successfully!');
        navigate('/', { replace: true });
      }
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      console.log(email);
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      console.log(password);
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  if(isLoading) return <Loading isVisible={isLoading} />;

  return (
    <>
      <div className="auth-container">

        <div className="auth-box">
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <Link to="/forgot-password" className="auth-forgot-password">
              Forgot Password?
            </Link>
            <div className="auth-redirect">
              Don't have an account? <Link to="/register">Register</Link>
            </div>
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button 
            type="button" 
            onClick={() => googleLogin()}
            className="google-auth-btn"
            data-testid="google-login-button"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          {/* <GoogleLogin
    onSuccess={credentialResponse => {
      console.log(credentialResponse);
    }}
    onError={() => {
      console.log('Login Failed');
    }}
    useOneTap
    auto_select
  /> */}

        </div>
      </div>
      <PhoneNumberModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onSubmit={handlePhoneSubmit}
        mode={authMode}
        googleData={googleAuthData}
      />
    </>
  );
};

export default Login;