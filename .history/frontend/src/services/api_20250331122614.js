  import axios from 'axios';

  const API_URL = 'http://localhost:8000/api';

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

      return api.get(`/posts?${params.toString()}`);
    },
    
    // Add the createPost method with proper FormData handling
    createPost: async (formData) => {
      // For FormData, we need to override the Content-Type header
      return api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    getPost: (id) => api.get(`/posts/${id}`),
    
    updatePost: (id, data) => {
      // Check if data is FormData (for image uploads)
      if (data instanceof FormData) {
        return api.post(`/posts/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: {
            _method: 'PUT', // Laravel form method spoofing
          },
        });
      }
      return api.put(`/posts/${id}`, data);
    },
    
    deletePost: (id) => api.delete(`/posts/${id}`),
  };

  // Comments API
  export const commentsAPI = {
    addComment: (postId, content) =>
      api.post(`/posts/${postId}/comments`, { post_id: postId, content }),
  };
  

  export default api;