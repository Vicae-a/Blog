// src/pages/Home.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { toast } from 'react-toastify';

const Home = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');

  const { data, isLoading, error, refetch } = useQuery(
    ['posts', page, search, author],
    () => postsAPI.getAllPosts(page, search, author),
    { keepPreviousData: true }
  );

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(postId);
        toast.success('Post deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1); // Reset to first page when searching
  };

  const handleAuthorFilter = (authorId) => {
    setAuthor(authorId === author ? '' : authorId); // Toggle filter
    setPage(1); // Reset to first page when filtering
  };

  if (isLoading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error loading posts: {error.message}</div>;

  const { data: posts, current_page, last_page } = data.data;

  return (
    <div className="home-page">
      <div className="container">
        <h1 className="page-title">Latest Blog Posts</h1>
        
        <div className="search-filter-container">
          <SearchBar onSearch={handleSearch} />
          {author && (
            <button onClick={() => setAuthor('')} className="clear-filter">
              Clear author filter
            </button>
          )}
        </div>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. {search && 'Try a different search term.'}</p>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={handleDelete}
                  onAuthorFilter={handleAuthorFilter}
                />
              ))}
            </div>
            
            <Pagination
              currentPage={current_page}
              lastPage={last_page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;


import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(formData);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="auth-button"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

// src/pages/Register.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) 
      newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.password_confirmation) 
      newErrors.password_confirmation = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await register(formData);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password_confirmation">Confirm Password</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
            {errors.password_confirmation && 
              <span className="error">{errors.password_confirmation}</span>}
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="auth-button"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;