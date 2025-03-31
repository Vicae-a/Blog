import React, { useState, useEffect } from "react"; // Import React and necessary hooks
import { useParams } from "react-router-dom"; // Import the useParams hook to access URL parameters
import { postsAPI } from "../services/api"; // Import the postsAPI object from your API service
import moment from 'moment'; // Import the moment library for date formatting

const PostDetail = () => {
  // Get the 'id' parameter from the URL using the useParams hook provided by react-router-dom
  const { id } = useParams();

  // useState hook to store the fetched post data. Initial state is null.
  const [post, setPost] = useState(null);

  // useState hook to store any error message that might occur during the API call. Initial state is an empty string.
  const [error, setError] = useState("");

  // useState hook to track the loading state of the API call. Initial state is true (loading).
  const [loading, setLoading] = useState(true);

  // useEffect hook to handle side effects in the component, such as fetching data from an API.
  // The empty array as the second argument means this effect will only run once after the initial render.
  // However, we want to refetch the post if the 'id' in the URL changes, so we include 'id' in the dependency array.
  useEffect(() => {
    // Define an asynchronous function to fetch the post data
    const fetchPost = async () => {
      try {
        // Call the 'getPost' function from your postsAPI to fetch the post with the given 'id'
        const response = await postsAPI.getPost(id);
        console.log("Post Detail API Response:", response); // Log the API response for debugging

        // Extract the actual post data from the response. Assuming your backend returns data in a nested 'data' property.
        const postData = response?.data?.data;

        // Check if 'postData' exists and is not null
        if (postData) {
          // If the data is successfully fetched, update the 'post' state with the received data
          setPost(postData);
        } else {
          // If the response doesn't have the expected structure, set an error message
          setError("Unexpected response format");
        }
      } catch (error) {
        // If there's an error during the API call (e.g., network issue, server error), log the error
        console.error("Error fetching post details:", error);
        // Set an error message to display to the user
        setError("Failed to load post");
      } finally {
        // This block always runs after the try/catch block, regardless of the outcome.
        // Set 'loading' to false to indicate that the data fetching is complete.
        setLoading(false);
      }
    };

    // Call the 'fetchPost' function when the component mounts or when the 'id' in the URL changes
    fetchPost();
  }, [id]); // The effect depends on the 'id'. If the 'id' changes, this effect will re-run.

  // Conditional rendering: If 'loading' is true, display a loading message
  if (loading) return <p>Loading post...</p>;

  // Conditional rendering: If 'error' has a value (meaning an error occurred), display the error message
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Conditional rendering: If 'post' is null after loading (meaning no post was found), display a "Post not found" message
  if (!post) return <p>Post not found.</p>;

  // Determine the image URL based on the 'image_path' property of the post data.
  // This matches the logic used in the PostCard component to construct the image URL.
  const imageUrl = post.image_path
    ? `http://localhost:8000/storage/${post.image_path}`
    : 'https://via.placeholder.com/800x400'; // Provide a default placeholder URL if 'image_path' is not available

  return (
    <div className="post-detail">
      {/* Display the post title. Use the logical OR operator to provide a default value if 'post.title' is undefined. */}
      <h1>{post.title || "Untitled"}</h1>

      {/* Display the author's name. Access the 'name' property from the 'user' object within the 'post' data. */}
      <p>By {post.user?.name || "Unknown Author"}</p>

      {/* Conditionally render the post creation date if 'post.created_at' exists */}
      {post.created_at && (
        <p className="post-date">
          Published on {moment(post.created_at).format('MMM D,<ctrl3348>')} {/* Format the date using moment */}
        </p>
      )}

      {/* Conditionally render the post image if 'post.image_path' exists */}
      {post.image_path ? (
        // Display the image using the constructed 'imageUrl'. Set a maximum width for responsiveness.
        <img src={imageUrl} alt={post.title} style={{ maxWidth: "100%" }} />
      ) : (
        // If there's no image path, display a "No Image Available" message
        <p>No Image Available</p>
      )}

      {/* Display the post content. 'dangerouslySetInnerHTML' is used to render HTML content that might be present in 'post.content'.
          Be cautious when using this as it can be a security risk if the content is from an untrusted source. */}
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
};

export default PostDetail;