import "./App.css";
import { RouterProvider } from "./routes/RouterProvider";
import { AuthProvider } from "./contexts/auth";
import {  ToastContainer } from "react-toastify";

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <RouterProvider />
    </AuthProvider>
  );
};

export default App;
