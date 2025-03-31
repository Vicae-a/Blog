import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import PostCard from "../components/PostCard";

const Home = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    console.log("Auth token exists:", !!token);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts", page, search, author],
    queryFn: async () => {
      console.log("Making API request to fetch posts");
      try {
        const response = await postsAPI.getAllPosts(page, search, author);
        console.log("API Response:", response.data); // Correct logging
        return response.data; // Ensure correct response handling
      } catch (err) {
        console.error("API Error:", err);
        throw err;
      }
    },
    enabled: isAuthenticated,
  });

  // Correct data extraction
  const posts = data?.data?.data || [];
  const currentPage = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;

  useEffect(() => {
    console.log("Full API Response:", data);
    console.log("Extracted Posts:", posts);
  }, [data]);

  if (!isAuthenticated) {
    return (
      <div className="auth-warning">
        <h2>Authentication Required</h2>
        <p>Please log in to view posts.</p>
        <button onClick={() => (window.location.href = "/login")}>Go to Login</button>
      </div>
    );
  }

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

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
        <button onClick={() => refetch()}>Search</button>
      </div>

      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <div>
            <p>No posts available.</p>
            <button onClick={() => refetch()}>Refresh Posts</button>
          </div>
        )}
      </div>

      {data?.data && (
        <div className="pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span>Page {currentPage} of {lastPage}</span>
          <button 
            disabled={currentPage === lastPage} 
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;