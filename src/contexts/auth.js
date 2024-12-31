import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useLogin from './loginhook';
import { setStorageData } from "../utils/data";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const {
    isLoading,
    error: responseErrorLogin,
    execute: executeLogin
  } = useLogin();

  const login = async (email, password) => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", { autoClose: 3000 });
      return { success: false };
    }

    // Validate password
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long", { autoClose: 3000 });
      return { success: false };
    }

    try {
      const response = await executeLogin(email, password);
      
      if (response?.data?.user) {
        setStorageData('token', response.data.token);
        setUser(response.data.user);
        setIsLoggedIn(true);
        toast.success(response.message, { autoClose: 3000 });
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      handleLoginError(error);
      return { 
        success: false, 
        error: error?.response?.data?.message || 'Login failed' 
      };
    }
  };

  const handleLoginError = (error) => {
    const errorMessage = error?.response?.data?.message;
    
    switch (error?.response?.data?.name) {
      case 'INVALID_PAYLOAD':
        toast.error("Invalid email or password format", { autoClose: 3000 });
        break;
      case 'EMAIL_PASSWORD_INCORRECT':
        toast.error("Email or password is incorrect", { autoClose: 3000 });
        break;
      default:
        toast.error(errorMessage || "An error occurred during login", { autoClose: 3000 });
        break;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
  };

  const value = {
    isLoggedIn,
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };