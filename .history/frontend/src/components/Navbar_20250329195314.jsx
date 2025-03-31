import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-item">Blog App</Link>
        </div>

        <div className="navbar-menu">
          <div className="navbar-end">
            <Link to="/" className="navbar-item">Home</Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/create-post" className="navbar-item">New Post</Link>
                <div className="navbar-item has-dropdown is-hoverable">
                  <a className="navbar-link">{user.name}</a>
                  <div className="navbar-dropdown">
                    <Link to="/profile" className="navbar-item">Profile</Link>
                    <a onClick={logout} className="navbar-item">Logout</a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-item">Login</Link>
                <Link to="/register" className="navbar-item">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
