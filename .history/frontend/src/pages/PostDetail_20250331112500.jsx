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

  console.log("Post ID from URL:", id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsAPI.getPost(id),
    refetchOnWindowFocus: false,
  });

  console.log("API Response:", data);

  const post = data?.data || {};

  if (!post || Object.keys(post).length === 0) {
    console.log("Post data is empty or invalid");
  }

  const postAuthor = post.user?.name || post.user?.username || post.author?.name || "Unknown Author";

  let imageUrl = 'https://via.placeholder.com/800x400';
  if (post.image_path) {
    imageUrl = post.image_path.startsWith('http') ? post.image_path : `http://localhost:8000/storage/${post.image_path}`;
  }

  const comments = Array.isArray(post.comments) ? post.comments : [];

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

  if (isLoading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error loading post: {error.message}</div>;
  if (!post || Object.keys(post).length === 0) return <div className="error">Post not found.</div>;

  return (
    <div className="post-detail-page">
      <div className="container">
        <article className="post">
          <header className="post-header">
            <h1 className="post-title">{post.title || "Untitled Post"}</h1>
            <div className="post-meta">
              <span className="post-author">By {postAuthor}</span>
              <span className="post-date">{post.created_at ? moment(post.created_at).format('MMM D, YYYY') : "Unknown Date"}</span>
            </div>
          </header>

          <div className="post-image">
            <img 
              src={imageUrl} 
              alt={post.title || "Post Image"} 
              onError={(e) => e.target.src = 'https://via.placeholder.com/800x400'} 
            />
          </div>

          <div className="post-content">
            {post.content ? post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            )) : <p>No content available.</p>}
          </div>

          <div className="post-actions">
            <button onClick={() => navigate(-1)} className="back-btn">Back</button>
            {isAuthor && (
              <>
                <button onClick={() => navigate(`/edit-post/${post.id}`)} className="edit-post-btn">Edit</button>
                <button onClick={deletePostMutation.mutate} className="delete-post-btn">Delete</button>
              </>
            )}
          </div>
        </article>

        <section className="comments-section">
          <h2 className="comments-title">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>
          {isAuthenticated ? (
            <CommentForm onSubmit={addCommentMutation.mutate} postId={post.id} />
          ) : (
            <div className="login-to-comment">Please <a href="/login">login</a> to leave a comment.</div>
          )}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <Comment key={comment.id} comment={comment} onDelete={deleteCommentMutation.mutate} />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PostDetail;
