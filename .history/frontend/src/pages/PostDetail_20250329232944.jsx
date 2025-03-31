import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import moment from 'moment';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsAPI.getPost(id),
    refetchOnWindowFocus: false,
  });
  

  const addCommentMutation = useMutation({
    mutationFn: (commentData) => commentsAPI.addComment(id, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast.success('Comment added successfully');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });
  

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
  
  const deletePostMutation = useMutation(
    () => postsAPI.deletePost(id),
    {
      onSuccess: () => {
        toast.success('Post deleted successfully');
        navigate('/');
      },
      onError: () => {
        toast.error('Failed to delete post');
      },
    }
  );

  const handleAddComment = async (postId, content) => {
    await addCommentMutation.mutateAsync(content);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteCommentMutation.mutateAsync(commentId);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePostMutation.mutateAsync();
    }
  };

  if (isLoading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error loading post: {error.message}</div>;

  const post = data.data;
  const isAuthor = user && post.user_id === user.id;
  const imageUrl = post.image_path 
    ? `http://localhost:8000/storage/${post.image_path}` 
    : null;

  return (
    <div className="post-detail-page">
      <div className="container">
        <article className="post">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span className="post-author">By {post.user.name}</span>
              <span className="post-date">
                {moment(post.created_at).format('MMMM D, YYYY')}
              </span>
            </div>
          </header>
          
          {imageUrl && (
            <div className="post-image">
              <img src={imageUrl} alt={post.title} />
            </div>
          )}
          
          <div className="post-content">
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {isAuthor && (
            <div className="post-actions">
              <button 
                onClick={() => navigate(`/edit-post/${post.id}`)} 
                className="edit-post-btn"
              >
                Edit Post
              </button>
              <button 
                onClick={handleDeletePost} 
                className="delete-post-btn"
              >
                Delete Post
              </button>
            </div>
          )}
        </article>
        
        <section className="comments-section">
          <h2 className="comments-title">
            {post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}
          </h2>
          
          {isAuthenticated ? (
            <CommentForm 
              onSubmit={handleAddComment} 
              postId={post.id} 
            />
          ) : (
            <div className="login-to-comment">
              Please <a href="/login">login</a> to leave a comment.
            </div>
          )}
          
          <div className="comments-list">
            {post.comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              post.comments.map(comment => (
                <Comment 
                  key={comment.id} 
                  comment={comment} 
                  onDelete={handleDeleteComment} 
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetail;
