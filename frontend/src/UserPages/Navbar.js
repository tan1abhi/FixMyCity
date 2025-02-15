import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../images/logo.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/home">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
      </div>
      <ul className="navbar-menu">
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/report-issue">Report Issue</Link>
        </li>
        <li>
          <Link to="/view-issues">View Issues</Link>
        </li>
        <li>
          <Link to="/authorities">Authorities</Link>
        </li>
      </ul>
      <div className="navbar-profile">
        <Link to="/profile" className="profile-link">
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
