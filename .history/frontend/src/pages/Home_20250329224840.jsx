// src/pages/Home.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { toast } from 'react-toastify';

const Home = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [author, setAuthor] = useState('');

  
  
  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postsAPI.deletePost(postId);
        toast.success('Post deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const handleSearch = (term) => {
    setSearch(term);
    setPage(1); // Reset to first page when searching
  };

  const handleAuthorFilter = (authorId) => {
    setAuthor(authorId === author ? '' : authorId); // Toggle filter
    setPage(1); // Reset to first page when filtering
  };

  if (isLoading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error loading posts: {error.message}</div>;

  const { data: posts, current_page, last_page } = data.data;

  return (
    <div className="home-page">
      <div className="container">
        <h1 className="page-title">Latest Blog Posts</h1>
        
        <div className="search-filter-container">
          <SearchBar onSearch={handleSearch} />
          {author && (
            <button onClick={() => setAuthor('')} className="clear-filter">
              Clear author filter
            </button>
          )}
        </div>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts found. {search && 'Try a different search term.'}</p>
          </div>
        ) : (
          <>
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onDelete={handleDelete}
                  onAuthorFilter={handleAuthorFilter}
                />
              ))}
            </div>
            
            <Pagination
              currentPage={current_page}
              lastPage={last_page}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;




