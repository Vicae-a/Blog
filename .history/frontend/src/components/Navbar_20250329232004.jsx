import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiPlus, FiHome, FiLogIn } from "react-icons/fi";
import "..assets/css/"; // Import the CSS file

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
              <div className="nav-item dropdown">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="dropdown-btn"
                >
                  <FiUser /> {user.name}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <button 
                      onClick={logout} 
                      className="dropdown-item logout"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
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
