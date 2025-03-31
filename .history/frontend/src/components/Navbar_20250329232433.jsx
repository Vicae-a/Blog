import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiPlus, FiHome, FiLogIn } from "react-icons/fi";
import "./Navbar.css"; // Import scoped CSS

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="logo">Blog App</Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Navbar Links */}
        <div className={`nav-links ${isOpen ? "active" : ""}`}>
          <Link to="/" className="nav-item">
            <FiHome /> Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/posts/create" className="nav-item">
                <FiPlus /> New Post
              </Link>

              {/* User Dropdown */}
              <div 
                ref={dropdownRef} 
                className={`nav-item dropdown ${isDropdownOpen ? "open" : ""}`}
              >
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="dropdown-btn"
                >
                  <FiUser /> {user.name}
                </button>

                {/* Dropdown Menu */}
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <button 
                    onClick={logout} 
                    className="dropdown-item logout"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">
                <FiLogIn /> Login
              </Link>
              <Link to="/register" className="nav-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
