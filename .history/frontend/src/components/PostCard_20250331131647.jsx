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
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h2>
        <p className="post-meta">
          <span className="post-author">By {post.user.name}</span>
          <span className="post-date">{moment(post.created_at).format('MMM D, YYYY')}</span>
        </p>
        <p className="post-preview">{contentPreview}</p>
        <div className="post-actions">
          <Link to={`/posts/${post.id}`} className="read-more">Read More</Link>
          {isAuthor && (
            <>
              <Link to={`/posts/${post.id}`} className="edit-post">Edit</Link>
              <button onClick={() => onDelete(post.id)} className="delete-post">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;