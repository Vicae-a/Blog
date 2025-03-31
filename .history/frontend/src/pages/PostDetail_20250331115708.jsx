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

  // Log the ID to ensure it's being captured from the URL
  console.log("Post ID from URL in PostDetail:", id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsAPI.getPost(id),
    refetchOnWindowFocus: false,
  });

  const post = data?.data || {};
  const postAuthor = post.user?.name || post.user?.username || "Unknown Author";
  const comments = Array.isArray(post.comments) ? post.comments : [];

  const imageUrl = post.image_path && post.image_path.startsWith('http')
    ? post.image_path
    : post.image_path
      ? `http://localhost:8000/storage/${post.image_path}`
      : 'https://via.placeholder.com/800x400';

  const isAuthor = user && post.user_id === user.id;

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

  const deletePostMutation = useMutation({
    mutationFn: () => postsAPI.deletePost(id),
    onSuccess: () => {
      toast.success('Post deleted successfully');
      navigate('/');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const handleAddComment = async (content) => {
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

  if (isLoading) {
    console.log("Loading state in PostDetail"); // Check if loading state is active
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    console.error("Error fetching post in PostDetail:", error); // Log any errors
    return <div className="error">Error loading post: {error.message}</div>;
  }

  if (!post || Object.keys(post).length === 0) {
    console.log("Post data is empty or undefined in PostDetail"); // Check if post data is received
    return <div className="error">Post not found.</div>;
  }

  return (
    <div className="post-detail-page">
      <div className="container">
        <article className="post">
          <header className="post-header">
            <h1 className="post-title">{post.title}</h1>
            <div className="post-meta">
              <span className="post-author">By {postAuthor}</span>
              <span className="post-date">{moment(post.created_at).format('MMM D, YYYY')}</span> {/* Corrected date format */}
            </div>
          </header>

          {imageUrl && (
            <div className="post-image">
              <img src={imageUrl} alt={post.title} />
            </div>
          )}

          <div className="post-content">
            {post.content?.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="post-actions">
            <button onClick={() => navigate('/')} className="read-more">Back to Posts</button>
            {isAuthor && (
              <>
                <button onClick={() => navigate(`/edit-post/${post.id}`)} className="edit-post-btn">Edit</button>
                <button onClick={handleDeletePost} className="delete-post-btn">Delete</button>
              </>
            )}
          </div>
        </article>

        <section className="comments-section">
          <h2 className="comments-title">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>
          {isAuthenticated ? (
            <CommentForm onSubmit={handleAddComment} postId={post.id} />
          ) : (
            <div className="login-to-comment">Please <a href="/login">login</a> to leave a comment.</div>
          )}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <Comment key={comment.id} comment={comment} onDelete={handleDeleteComment} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetail;