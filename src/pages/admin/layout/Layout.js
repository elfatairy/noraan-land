import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Navbar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import "./Layout.css";

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <Navbar className="navbar" />
      <div className="content-wrapper">
        {location.pathname !== "/admin/login" &&(
        <aside className="sidebar">
          <ul>
            <li className={location.pathname === "/admin/upcoming-sessions" ? "active" : ""}>
              <Link to="/admin/upcoming-sessions">
                <i className="fas fa-clock"></i>
                <span>Upcoming Sessions</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/calendar" ? "active" : ""}>
              <Link to="/admin/calendar">
                <i className="fas fa-calendar-alt"></i>
                <span>Calendar</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/courses" ? "active" : ""}>
              <Link to="/admin/courses">
                <i className="fas fa-graduation-cap"></i>
                <span>Courses</span>
              </Link>
            </li>
            <li className={location.pathname === "/admin/students" ? "active" : ""}>
              <Link to="/admin/students">
                <i className="fas fa-user-graduate"></i>
                <span>Students</span>
              </Link>
            </li>
          </ul>
        </aside>
        )}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer className="footer" />
    </div>
  );
};

export default AdminLayout;
