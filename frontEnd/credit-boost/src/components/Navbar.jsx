import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { UserCircle, Menu, X, Code } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would typically be from auth context

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.svg" alt="CreditBoost Logo" className="logo-image" />
          <span className="logo-text">CreditBoost</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/credit-passport" className="nav-link">
              Credit Passport
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/api-testing" className="nav-link">
              <Code size={16} className="mr-1" />
              API Testing
            </NavLink>
          </li>
          {isLoggedIn ? (
            <li className="nav-item">
              <NavLink to="/profile" className="nav-link profile-link">
                <UserCircle size={20} />
                <span>Profile</span>
              </NavLink>
            </li>
          ) : (
            <>
              <li className="nav-item">
                <NavLink to="/login" className="nav-link">
                  Login
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/register" className="nav-link register-link">
                  Register
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

