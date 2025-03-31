import { Link } from 'react-router-dom';
import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const isAuthor = user && post.user_id === user.id;
  const imageUrl = post.image_path 
    ? `http://localhost:8000/storage/${post.image_path}` 
    : 'https://via.placeholder.com/800x400';

  // Limit content preview to 150 characters
  const contentPreview = post.content.length > 150 
    ? post.content.substring(0, 150) + '...' 
    : post.content;

  return (
    <div className="post-card">
      <div className="post-card-image">
        <img src={imageUrl} alt={post.title} />
      </div>
      <div className="post-card-content">
        <h2 className="post-title">
          <Link to={`/posts/${post.id}`}>{post.title