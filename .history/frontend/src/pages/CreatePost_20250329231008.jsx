import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query"; 
import { postsAPI } from '../services/api';
import { toast } from 'react-toastify';

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    published_at: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Define mutation function
  const createPost = async (postData) => {
    const response = await postsAPI.createPost(postData);
    return response.data;
  };

  // Mutation hook
  const createPostMutation = useMutation({
    mutationFn: createPost,  // Correct function syntax
    onSuccess: (data) => {
      toast.success('Post created successfully');
      navigate(`/posts/${data.id}`);
    },
    onError: (error) => {
      const responseErrors = error.response?.data?.errors || {};
      setErrors(responseErrors);
      toast.error('Failed to create post');
    },
  });
  

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image' && files.length > 0) {
      setFormData({ ...formData, image: files[0] });

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error message when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
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

    try {
      await createPostMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="create-post-page">
      <div className="container">
        <h1 className="page-title">Create New Post</h1>

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
            <label htmlFor="image">Featured Image (Optional)</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
            />
            {errors.image && <span className="error">{errors.image}</span>}

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="published_at">Publish Date (Optional)</label>
            <input
              type="datetime-local"
              id="published_at"
              name="published_at"
              value={formData.published_at}
              onChange={handleChange}
            />
            {errors.published_at && <span className="error">{errors.published_at}</span>}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={createPostMutation.isLoading}
              className="submit-btn"
            >
              {createPostMutation.isLoading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
