import { useParams, useNavigate } from 'react-router-dom'; // Import hooks for accessing route parameters and navigation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import hooks from react-query for data fetching and mutations
import { postsAPI, commentsAPI } from '../services/api'; // Import API functions for posts and comments
import { useAuth } from '../context/AuthContext'; // Import the authentication context
import Comment from '../components/Comment'; // Import the Comment component for displaying individual comments
import CommentForm from '../components/CommentForm'; // Import the CommentForm component for adding new comments
import moment from 'moment'; // Import the moment library for date formatting
import { toast } from 'react-toastify'; // Import the toast library for displaying notifications

const PostDetail = () => {
  // Get the 'id' parameter from the URL using the useParams hook
  const { id } = useParams();
  // Hook to navigate between routes programmatically
  const navigate = useNavigate();
  // Access user information and authentication status from the AuthContext
  const { user, isAuthenticated } = useAuth();
  // Get the query client instance from react-query
  const queryClient = useQueryClient();

  // Log the post ID from the URL for debugging purposes
  console.log("Post ID from URL:", id);

  // Fetch the post details using the useQuery hook from react-query
  const { data, isLoading, error } = useQuery({
    // Unique key for this query, used for caching and invalidation
    queryKey: ['post', id],
    // Function to fetch the post data using the postsAPI
    queryFn: () => postsAPI.getPost(id),
    // Prevent automatic refetching of data when the window gains focus
    refetchOnWindowFocus: false,
  });

  // Log the API response for debugging
  console.log("API Response:", data);

  // Extract the post data from the query result, or initialize as an empty object if data is not yet available
  const post = data?.data || {};

  // Log a message if the post data is empty or invalid
  if (!post || Object.keys(post).length === 0) {
    console.log("Post data is empty or invalid");
  }

  // Determine the author's name, prioritizing 'user.name', then 'user.username', then 'author.name', and finally a default value
  const postAuthor = post.user?.name || post.user?.username || post.author?.name || "Unknown Author";

  // Initialize the image URL with a placeholder
  let imageUrl = 'https://via.placeholder.com/800x400';
  // If an image path exists in the post data, construct the full image URL
  if (post.image_path) {
    imageUrl = post.image_path.startsWith('http') ? post.image_path : `http://localhost:8000/storage/${post.image_path}`;
  }

  // Extract the comments array from the post data, ensuring it's an array
  const comments = Array.isArray(post.comments) ? post.comments : [];

  // Check if the currently logged-in user is the author of the post
  const isAuthor = user && post.user_id === user.id;

  // Mutation hook for adding a new comment to the post
  const addCommentMutation = useMutation({
    // Function to call the comments API to add a comment
    mutationFn: (commentData) => commentsAPI.addComment(id, commentData),
    // Callback function executed on successful mutation
    onSuccess: () => {
      // Invalidate the post query to trigger a refetch and display the new comment
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      // Display a success toast notification
      toast.success('Comment added successfully');
    },
    // Callback function executed on mutation error
    onError: () => {
      // Display an error toast notification
      toast.error('Failed to add comment');
    },
  });

  // Mutation hook for deleting a comment
  const deleteCommentMutation = useMutation({
    // Function to call the comments API to delete a comment
    mutationFn: (commentId) => commentsAPI.deleteComment(commentId),
    // Callback function executed on successful mutation
    onSuccess: () => {
      // Invalidate the post query to trigger a refetch and update the comments list
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      // Display a success toast notification
      toast.success('Comment deleted successfully');
    },
    // Callback function executed on mutation error
    onError: () => {
      // Display an error toast notification
      toast.error('Failed to delete comment');
    },
  });

  // Mutation hook for deleting the entire post
  const deletePostMutation = useMutation({
    // Function to call the posts API to delete the post
    mutationFn: () => postsAPI.deletePost(id),
    // Callback function executed on successful mutation
    onSuccess: () => {
      // Display a success toast notification
      toast.success('Post deleted successfully');
      // Navigate the user back to the homepage after successful deletion
      navigate('/');
    },
    // Callback function executed on mutation error
    onError: () => {
      // Display an error toast notification
      toast.error('Failed to delete post');
    },
  });

  // Conditional rendering: Display a loading message while the post data is being fetched
  if (isLoading) return <div className="loading">Loading post...</div>;
  // Conditional rendering: Display an error message if there was an error fetching the post
  if (error) return <div className="error">Error loading post: {error.message}</div>;
  // Conditional rendering: Display an error message if the post data is not found or is empty
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