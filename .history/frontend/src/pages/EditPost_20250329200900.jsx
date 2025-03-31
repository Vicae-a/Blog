// src/pages/EditPost.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import { toast } from 'react-toastify';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    published_at: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  const { data, isLoading, error } = useQuery(
    ['post', id],
    () => postsAPI.getPost(id),
    {
      refetchOnWindowFocus: false,
      onSuccess: (response) => {
        const post = response.data;
        setFormData({
          title: post.title,
          content: post.content,
          image: null,
          published_at: post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '',
        });
        
        if (post.image_path) {
          setImagePreview(`http://localhost:8000/storage/${post.image_path}`);
        }
      },
    }
  );
  
  const updatePostMutation = useMutation(
    (postData) => postsAPI.updatePost(id, postData),
    {
      onSuccess: () => {
        toast.success('Post updated successfully');
        navigate(`/posts/${id}`);
      },
      onError: (error) => {
        const responseErrors = error.response?.data?.errors || {};
        setErrors(responseErrors);
        toast.error('Failed to update post');
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image' && files[0]) {
      setFormData({
        ...formData,
        image: files[0],
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    await updatePostMutation.mutateAsync(formData);
  };

  if (isLoading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error loading post: {error.message}</div>;

  return (
    <div className="edit-post-page">
      <div className="container">
        <h1 className="page-title">Edit Post</h1>
        
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={255}
            />
            {errors.title && <span className="error">{errors.title}</span>}
            <small className="counter">{formData.title.length}/255</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
            />
            {errors.content && <span className="error">{errors.content}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
          </div>
          
          <div className="form-group">
            <label htmlFor="published_at">Publish Date</label>
            <input
              type="datetime-local"
              id="published_at"
              name="published_at"
              value={formData.published_at}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="btn btn-primary">Update Post</button>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
