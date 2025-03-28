import "./App.css";
import 'react-toastify/dist/ReactToastify.css';
import { RouterProvider } from "./routes/RouterProvider";
import { AuthProvider } from "./contexts/auth";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  return (
    <GoogleOAuthProvider clientId="484926163697-gqhd1kh1hnedcmfkl49lv15g3cvee0mk.apps.googleusercontent.com">
      <AuthProvider>
        <ToastContainer />
        <RouterProvider />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
