import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for Sanctum to work with cookies
});

// Add a request interceptor to add the token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/user'),
  updateProfile: (userData) => api.put('/user', userData),
};

// Posts API
export const postsAPI = {
  getAllPosts: (page = 1, search = '', author = '') => 
    api.get('/posts', { params: { page, search, author } }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      formData.append(key, postData[key]);
    });
    return api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updatePost: (id, postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (postData[key] !== null) {
        formData.append(key, postData[key]);
      }
    });
    return api.post(`/posts/${id}?_method=PUT`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deletePost: (id) => api.delete(`/posts/${id}`),
};

// Comments API
export const commentsAPI = {
  addComment: (postId, content) => 
    api.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;