import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { postsAPI } from "../services/api";
import moment from 'moment'; // Import moment if you want to display the date

const PostDetail = () => {
  // Get the post ID from the URL parameters
  const { id } = useParams();
  // State to store the fetched post data
  const [post, setPost] = useState(null);
  // State to store any error messages
  const [error, setError] = useState("");
  // State to track the loading status
  const [loading, setLoading] = useState(true);

  // useEffect hook to fetch the post data when the component mounts or when the ID changes
  useEffect(() => {
    // Define an asynchronous function to fetch the post
    const fetchPost = async () => {
      try {
        // Call the API to get the specific post by its ID
        const response = await postsAPI.getPost(id);
        console.log("Post Detail API Response:", response);

        // Extract the post data from the response
        const postData = response?.data?.data;

        // Check if the post data exists
        if (postData) {
          // Update the post state with the fetched data
          setPost(postData);
        } else {
          // If the data structure is unexpected, set an error
          setError("Unexpected response format");
        }
      } catch (error) {
        // If there's an error during the API call, log the error and set an error message
        console.error("Error fetching post details:", error);
        setError("Failed to load post");
      } finally {
        // After the API call is complete (whether successful or not), set loading to false
        setLoading(false);
      }
    };

    // Call the fetchPost function when the component mounts or when the 'id' in the URL changes
    fetchPost();
  }, [id]); // The effect depends on the 'id'

  // Render loading message while data is being fetched
  if (loading) return <p>Loading post...</p>;

  // Render error message if there was an error fetching the post
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Render a "Post not found" message if the 'post' state is null after loading
  if (!post) return <p>Post not found.</p>;

  // Determine the image URL based on the 'image_path' property (similar to PostCard)
  const imageUrl = post.image_path
    ? `http://localhost:8000/storage/${post.image_path}`
    : 'https://via.placeholder.com/800x400'; // You can use a default placeholder if needed

  return (
    <div className="post-detail">
      {/* Display the post title */}
      <h1>{post.title || "Untitled"}</h1>

      {/* Display the author's name */}
      <p>By {post.user?.name || "Unknown Author"}</p>

      {/* Display the post creation date */}
      {post.created_at && (
        <p className="post-date">
          Published on {moment(post.created_at).format('MMM D, YYYY')}
        </p>
      )}

      {/* Display the post image */}
      {post.image_path ? (
        <img src={imageUrl} alt={post.title} style={{ maxWidth: "100%" }} />
      ) : (
        <p>No Image Available</p>
      )}

      {/* Display the post content using dangerouslySetInnerHTML for HTML content */}
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default PostDetail;