// StudentLayout.js
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import "./Layout.css";

const StudentLayout = () => {
    const location = useLocation();
  
    return (
      <div className="student-layout admin-layout">
        <Navbar className="navbar" />
        <div className="content-wrapper">
          <aside className="sidebar">
            <ul>
              <li className={location.pathname === "/student/upcoming-sessions" ? "active" : ""}>
                <Link to="/student/upcoming-sessions">
                  <i className="fas fa-clock"></i>
                  <span>Upcoming Sessions</span>
                </Link>
              </li>
              <li className={location.pathname === "/student/enrolled-courses" ? "active" : ""}>
                <Link to="/student/enrolled-courses">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Enrolled Courses</span>
                </Link>
              </li>
        
            </ul>
          </aside>
          <main className="main-content">
            <Outlet />
          </main>
        </div>
        <Footer className="footer" />
      </div>
    );
  };
  
  export default StudentLayout;
  