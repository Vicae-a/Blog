// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useMutation } from 'npm install axios
';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: (response) => {
        // Update the user in context
        setUser(response.data);
        toast.success('Profile updated successfully');
        
        // Clear passwords
        setFormData({
          ...formData,
          password: '',
          password_confirmation: '',
        });
      },
      onError: (error) => {
        const responseErrors = error.response?.data?.errors || {};
        setErrors(responseErrors);
        toast.error('Failed to update profile');
      },
    }
  );

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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Only validate password if it's provided
    if (formData.password) {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.password_confirmation) {
        newErrors.password_confirmation = 'Passwords do not match';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Only include password if it's provided
    const profileData = {
      name: formData.name,
      email: formData.email,
    };
    
    if (formData.password) {
      profileData.password = formData.password;
      profileData.password_confirmation = formData.password_confirmation;
    }
    
    await updateProfileMutation.mutateAsync(profileData);
  };

  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="profile-form">
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
            <label htmlFor="password">New Password (leave blank to keep current)</label>
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
            <label htmlFor="password_confirmation">Confirm New Password</label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
            {errors.password_confirmation && <span className="error">{errors.password_confirmation}</span>}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={updateProfileMutation.isLoading}
          >
            {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;