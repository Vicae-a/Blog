import React, { useState, useEffect } from "react";
import { postsAPI } from "../services/api";
import PostCard from "../components/PostCard";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Fetch posts (Allow for both logged-in and guest users)
  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await postsAPI.getAllPosts(page, search, author);
      console.log("Full API Response:", response);
  
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
  }, [page, search, author]);

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
            <button onClick={fetchPosts}>Refresh Posts</button>
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

      {/* Optional: Show protected actions only for logged-in users */}
      {isAuthenticated && (
        <div className="protected-content">
          <p>You are logged in. You can create or edit posts.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
