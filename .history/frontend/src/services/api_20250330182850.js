import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const API_URL2 = "http://localhost:8000/api/posts";
// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for Sanctum authentication
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
  (error) => Promise.reject(error)
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
  getAllPosts: async (page, search, author) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (search) params.append("search", search);
    if (author) params.append("author", author);

    const response = await axios.get(`${API_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    return response;
  }
};

// Comments API
export const commentsAPI = {
  addComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),

  deleteComment: (id) => api.delete(`/comments/${id}`),
};

export default api;
