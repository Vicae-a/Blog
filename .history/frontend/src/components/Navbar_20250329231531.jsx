import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiPlus, FiHome, FiLogIn } from "react-icons/fi";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">Blog App</Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Navbar Links */}
        <div className={`md:flex md:items-center ${isOpen ? "block" : "hidden"} md:block`}>
          <div className="flex flex-col md:flex-row md:space-x-6 mt-4 md:mt-0">
            <Link to="/" className="hover:text-gray-300 flex items-center space-x-2">
              <FiHome /> <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/posts/create" className="hover:text-gray-300 flex items-center space-x-2">
                  <FiPlus /> <span>New Post</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                    className="flex items-center space-x-2 hover:text-gray-300"
                  >
                    <FiUser /> <span>{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-lg w-40">
                      <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                      <button 
                        onClick={logout} 
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <FiLogOut /> <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-gray-300 flex items-center space-x-2">
                  <FiLogIn /> <span>Login</span>
                </Link>
                <Link to="/register" className="hover:text-gray-300">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
