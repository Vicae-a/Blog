import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import PostCard from "../components/PostCard";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { toast } from "react-toastify";

const Home = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["posts", page, search, author],
    queryFn: () => postsAPI.getAllPosts(page, search, author),
    keepPreviousData: true,
  });

  // Debugging logs
  useEffect(() => {
    console.log("Full API Response:", data);
  }, [data]);

  // Extract posts properly
  const currentPage = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;

  // Ensure correct response structure


  // Debugging log for posts
  useEffect(() => {
    console.log("Extracted Posts Data:", posts);
  }, [posts]);

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await postsAPI.deletePost(postId);
        toast.success("Post deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete post");
      }
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1);
  };

  const handleAuthorFilter = (authorId) => {
    setAuthor(authorId === author ? "" : authorId);
    setPage(1);
  };

  if (isLoading) return <div className="loading">Loading posts...</div>;
  if (error)
    return <div className="error">Error loading posts: {error.message}</div>;

  return (
    <div className="home-page">
      <div className="container">
        <h1 className="page-title">Latest Blog Posts</h1>

        <div className="search-filter-container">
          <SearchBar onSearch={handleSearch} />
          {author && (
            <button onClick={() => setAuthor("")} className="clear-filter">
              Clear author filter
            </button>
          )}
        </div>

        {posts.length > 0 ? (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onAuthorFilter={handleAuthorFilter}
              />
            ))}
          </div>
        ) : (
          <div className="no-posts">
            <p>No posts available.</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default Home;
