import { createContext, useContext, useState, useEffect } from 'react'; // Add useEffect
import { toast } from 'react-toastify';
import useLogin from '../hooks/loginhook';
import useRegister from '../hooks/registerhook';
import { setStorageData , getStorageData } from "../utils/data";
import useAdminLogin from '../hooks/adminloginhook';
import { useGoogleLogin as useGoogleLoginHook } from '../hooks/googleloginhook';
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
  const { isLoading: isLoadingGetMe, execute: executeGetMe } = useGetMe();


  const handleGoogleLoginSuccess = async (response) => {
    try {
      // Store token and user data
      setStorageData('token', response.data.token);
      setStorageData('id', response.data.student.id);
      setStorageData('name', response.data.student.name);
      setStorageData('email', response.data.student.email);
      setStorageData('phone', response.data.student.phone); 
      
      // Update context
      setUser(response.data.student);
      setIsLoggedIn(true);

      return { 
        success: true,
        message: response.message || 'Logged in with Google successfully!'
      };
    } catch (error) {
      console.error('Error handling Google login success:', error);
      return { success: false };
    }
  };

  const login = async (type, payload) => {
    try {
      let response;
        // Regular email/password login
        response = await executeLogin(payload.email, payload.password);
        
        if (response?.data?.student) {
          // Store user data including phone
          setStorageData('token', response.data.token);
          setStorageData('id', response.data.student.id);
          setStorageData('name', response.data.student.name);
          setStorageData('email', response.data.student.email);
          setStorageData('phone', response.data.student.phone); // Add this line
          
          // Update context
          setUser(response.data.student);
          setIsLoggedIn(true);

          return { 
            success: true,
            message: response.message || 'Logged in successfully!'
          };
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

        const { name, email, password, phone } = payload;
        if (!validateRegistrationData(name, email, password, phone)) {
          return { success: false };
        }
        response = await executeRegister(name, email, password, phone);
      

      if (response?.data?.user || response?.data?.student) {
        const userData = response?.data?.user || response?.data?.student;
        // Store user data
        setStorageData('token', response.data.token);
        setStorageData('id', userData.id);
        setStorageData('name', userData.name);
        setStorageData('email', userData.email);
        setStorageData('phone', userData.phone); // Store phone number
        
        // Update context
        setUser(userData);
        setIsLoggedIn(true);
        
        toast.success(response.message || 'Registration successful!');
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      handleRegisterError(error);
      return { success: false };
    }
  };

  const validateRegistrationData = (name, email, password, phone) => {
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
    if (!phone) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const handleGoogleLogin = async (mode, payload) => {
    try {
      const response = await executeGoogleLogin({
        mode,
        phoneNumber: payload.phoneNumber,
        code: payload.code || null,
        credential: payload.credential || null
      });

      if (response?.data?.student) {
        setStorageData('token', response.data.token);
        setStorageData('id', response.data.student.id);
        setStorageData('name', response.data.student.name);
        setStorageData('email', response.data.student.email);
        setStorageData('phone', response.data.student.phone);

        setUser(response.data.student);
        setIsLoggedIn(true);

        return { 
          success: true,
          message: 'Logged in with Google successfully!'
        };
      }
      return { success: false };
    } catch (error) {
      handleLoginError(error);
      return { success: false };
    }
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
        return { success: true, data: response?.data?.student};
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
    localStorage.removeItem('phone');
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
    handleGoogleLogin
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