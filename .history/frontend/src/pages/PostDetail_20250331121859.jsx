import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { postsAPI } from "../services/api";
import moment from "moment";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postsAPI.getPost(id);
        setPost(response?.data?.data || null);
      } catch (error) {
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await postsAPI.getComments(id);
        setComments(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchPost();
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await postsAPI.addComment(id, { content: newComment });
      setComments([...comments, response?.data?.data]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!post) return <p>Post not found.</p>;

  const imageUrl = post.image_path
    ? `http://localhost:8000/storage/${post.image_path}`
    : "https://via.placeholder.com/800x400";

  return (
    <div className="post-detail">
      <h1>{post.title || "Untitled"}</h1>
      <p>By {post.user?.name || "Unknown Author"}</p>
      {post.created_at && <p className="post-date">Published on {moment(post.created_at).format("MMM D, YYYY")}</p>}
      {post.image_path ? <img src={imageUrl} alt={post.title} style={{ maxWidth: "100%" }} /> : <p>No Image Available</p>}
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Comments Section */}
      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>
                <strong>{comment.user?.name || "Anonymous"}</strong>
                <p>{comment.content}</p>
                <small>{moment(comment.created_at).fromNow()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  );
};

export default PostDetail;
