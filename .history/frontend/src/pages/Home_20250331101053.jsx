import React, { useState, useEffect } from "react";
import { postsAPI } from "../services/api";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch posts manually
  const fetchPosts = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError("");
    try {
      const response = await postsAPI.getAllPosts(page, search, author);
      console.log("Full API Response:", response);
  
      // Correct data extraction
      const responseData = response?.data?.data?.data;
      if (Array.isArray(responseData)) {
        setPosts(responseData);
        console.log("Extracted Posts:", responseData);
      } else {
        setError("Unexpected response format");
        console.log("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPosts();
  }, [page, search, author, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="auth-warning">
        <h2>Authentication Required</h2>
        <p>Please log in to view posts.</p>
        <button onClick={() => (window.location.href = "/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>Posts</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchPosts}>Search</button>
      </div>

      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div>
            <p>No posts available.</p>
          </div>
        )}
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Home;
