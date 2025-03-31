import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsAPI } from "../servicesapi";
import PostCard from "../components/PostCard";

const Home = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts", page, search, author],
    queryFn: () => postsAPI.getAllPosts(page, search, author).then(res => res.data),
    keepPreviousData: true,
  });

  const posts = data?.data?.data || [];
  const currentPage = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;

  if (isLoading) return <p>Loading posts...</p>;
  if (error) return <p>Error loading posts.</p>;

  return (
    <div className="home-container">
      <input
        type="text"
        placeholder="Search posts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => refetch()}>Search</button>

      <div className="posts-grid">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {currentPage} of {lastPage}</span>
        <button disabled={currentPage === lastPage} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
