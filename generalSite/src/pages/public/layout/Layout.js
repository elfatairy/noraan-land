// StudentLayout.js
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import "./Layout.css";

const PublicLayout = () => {
  
    return (
      <div className="admin-layout">
        <Navbar className="navbar" />
          <main className="main-content">
            <Outlet />
          </main>
        <Footer className="footer" />
      </div> 
    );
  };
  
  
export default PublicLayout;
