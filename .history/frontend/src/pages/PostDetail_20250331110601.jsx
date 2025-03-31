import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { postsAPI } from "../services/api";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postsAPI.getPost(id);
        console.log("Post Detail API Response:", response);
        
        // Extract the correct data structure
        const postData = response?.data?.data;
        if (postData) {
          setPost(postData);
        } else {
          setError("Unexpected response format");
        }
      } catch (error) {
        console.error("Error fetching post details:", error);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="post-detail">
      <h1>{post.title || "Untitled"}</h1>
      <p>By {post.author?.name || "Unknown Author"}</p>
      {post.image_url ? (
        <img src={post.image_url} alt={post.title} style={{ maxWidth: "100%" }} />
      ) : (
        <p>No Image Available</p>
      )}
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default PostDetail;
