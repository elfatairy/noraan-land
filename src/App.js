import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { RouterProvider } from "./routes/RouterProvider";
import { AuthProvider } from "./contexts/auth";
import { ToastContainer } from "react-toastify";
import { GoogleOAuthProvider } from "@react-oauth/google";

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <ToastContainer />
        <RouterProvider />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
