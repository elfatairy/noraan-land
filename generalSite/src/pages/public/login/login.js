import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/auth';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../../components/loading/loading';
import { FcGoogle } from 'react-icons/fc';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [phone, setPhone] = useState('+201149957585'); // Add phone state
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        console.log('Google Login Response:', response);
        
        // Get user info using access token
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        });
        const profile = await userInfo.json();
        
        console.log('Google User Profile:', {
          id: profile.sub,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          given_name: profile.given_name,
          family_name: profile.family_name,
          locale: profile.locale
        });

        // Send to backend with phone number
        const result = await login('google', {
          accessToken: response.access_token,
          phone: phone // Add phone to payload
        });
        
        if (result?.success) {
          toast.success('Successfully logged in with Google!');
          navigate('/');
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error('Google login failed');
    },
    scope: 'email profile',
    flow: 'implicit',
    
    // Add your client ID here
    client_id: "484926163697-gqhd1kh1hnedcmfkl49lv15g3cvee0mk.apps.googleusercontent.com",
    
    cookiePolicy: 'single_host_origin',
  });
  
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
      </div>
    </div>
  );
};

export default Login;