import { createContext, useContext, useState, useEffect } from 'react'; // Add useEffect
import { toast } from 'react-toastify';
import useLogin from '../hooks/loginhook';
import useRegister from '../hooks/registerhook';
import { setStorageData , getStorageData } from "../utils/data";
import useAdminLogin from '../hooks/adminloginhook';
import { useGoogleLogin as useGoogleLoginHook } from '../hooks/googleloginhook';
import { useGoogleRegister as useGoogleRegisterHook } from '../hooks/googleregisterhook';
import { useGetMe } from '../hooks/getMe';
import { useUpdateProfile } from '../hooks/useUpdateProfile';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user && isLoggedIn && !!getStorageData('token');

  // Add this useEffect to check storage on mount
  useEffect(() => {
    const token = getStorageData('token');
    const storedUser = {
      id: getStorageData('id'),
      name: getStorageData('name'),
      email: getStorageData('email'),
      isAdmin: getStorageData('isAdmin') === 'true'
    };

    if (token && storedUser.name) {
      setUser(storedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const { isLoading, execute: executeLogin } = useLogin();
  const { isLoadingAdminLogin, execute: executeAdminLogin } = useAdminLogin();
  const { isLoading: isLoadingRegister, execute: executeRegister } = useRegister();
  const { isLoading: isLoadingUpdateProfile, execute: executeUpdateProfile } = useUpdateProfile();
  const { execute: executeGoogleLogin } = useGoogleLoginHook();
  const { execute: executeGoogleRegister } = useGoogleRegisterHook();
  const { isLoading: isLoadingGetMe, execute: executeGetMe } = useGetMe();

  const handleAuthSuccess = (response) => {
    setStorageData('token', response.data.token);
    setStorageData('id', response.data.user.id);
    setStorageData('name', response.data.user.name);
    setStorageData('email', response.data.user.email);
    setUser(response.data.user);
    setIsLoggedIn(true);
    return { success: true };
  };

  const login = async (type, email, password) => {
    try {
      let response;
      if (type === 'google') {
        response = await executeGoogleLogin(email); // email is accessToken here
      } else {
        response = await executeLogin(email, password);
      }

      if (response?.data?.user) {
        toast.success(response.message);
        return handleAuthSuccess(response);
      }
      return { success: false };
    } catch (error) {
      handleLoginError(error);
      return { success: false };
    }
  };

  const register = async (type, payload) => {
    try {
      let response;
      if (type === 'google') {
        response = await executeGoogleRegister(payload); // payload is accessToken
      } else {
        const { name, email, password } = payload;
        if (!validateRegistrationData(name, email, password)) {
          return { success: false };
        }
        response = await executeRegister(name, email, password);
      }

      if (response?.data?.user) {
        toast.success(response.message || 'Registration successful!');
        return handleAuthSuccess(response);
      }
      return { success: false };
    } catch (error) {
      handleRegisterError(error);
      return { success: false };
    }
  };

  const validateRegistrationData = (name, email, password) => {
    console.log("reg data :", name, email, password)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return false;
    }
    if (!name || name.length < 4) {
      toast.error("Name must be at least 4 characters long");
      return false;
    }
    return true;
  };


  // Modify adminLogin to also store isAdmin flag
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
        setStorageData('name', "Admin");
        setStorageData('isAdmin', 'true');
        setUser({name: "Admin", isAdmin: true});
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

  const getProfile = async () => {
    try {
      const response = await executeGetMe();
      
      if (response?.data) {
        return { success: true, data: response?.data?.user};
      }
      return { success: false, error: 'Error getting the profile' };
    } catch (error) {
      return { success: false, error: error?.response?.data?.message || 'Admin login failed' };
    }
  }

  // Modify logout to clear all stored data
  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
  };

  const value = {
    isAuthenticated,
    isLoggedIn,
    user,
    isLoading,
    isLoadingRegister,
    login,
    register,
    logout,
    adminLogin,
    getProfile,
    isLoadingGetMe,
    isLoadingAdminLogin,
    updateProfile: executeUpdateProfile,
    isLoadingUpdateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};