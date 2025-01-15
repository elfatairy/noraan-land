import { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import useLogin from '../hooks/loginhook';
import useRegister from '../hooks/registerhook';
import { setStorageData , getStorageData } from "../utils/data";
import useAdminLogin from '../hooks/adminloginhook';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const {
    isLoading,
    // error: responseErrorLogin,
    execute: executeLogin
  } = useLogin();
  const {
    isLoading: isLoadingRegister,
    execute: executeRegister
  } = useRegister();
  const {
    isLoading: isLoadingAdminLogin,
    execute: executeAdminLogin
  } = useAdminLogin();

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
        setStorageData('id', response.data.user.id);
        setStorageData('name', response.data.user.name);
        setStorageData('email', response.data.user.email);
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

  const register = async (name, email, password) => {
    // Validate email and password (reuse existing validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address", { autoClose: 3000 });
      return { success: false };
    }

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long", { autoClose: 3000 });
      return { success: false };
    }

    try {
      const response = await executeRegister(name, email, password);
      
      if (response?.data?.user) {
        setStorageData('token', response.data.token);
        setStorageData('id', response.data.user.id);
        setStorageData('name', response.data.user.name);
        setStorageData('email', response.data.user.email);
        setUser(response.data.user);
        setIsLoggedIn(true);
        toast.success(response.message || 'Registration successful!', { autoClose: 3000 });
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      handleRegisterError(error);
      return { 
        success: false, 
        error: error?.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const adminLogin = async (username, password) => {
    if (!username || username.length < 3) {
      toast.error("Username must be at least 3 characters", { autoClose: 3000 });
      return { success: false };
    }

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters", { autoClose: 3000 });
      return { success: false };
    }

    try {
      const response = await executeAdminLogin(username, password);
      
      if (response?.data?.token) {
        setStorageData('token', response.data.token);
        setUser({name : "Admin", isAdmin: true });
        console.log(user);
        console.log(getStorageData('token'))
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      handleLoginError(error);
      return { success: false, error: error?.response?.data?.message || 'Admin login failed' };
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

  const handleRegisterError = (error) => {
    const errorMessage = error?.response?.data?.message;
    toast.error(errorMessage || "An error occurred during registration", { autoClose: 3000 });
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
    isLoadingRegister,
    login,
    register,
    logout,
    adminLogin,
    isLoadingAdminLogin
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