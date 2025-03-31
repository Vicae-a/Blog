import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI, commentsAPI } from "../services/api";
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comment';
import CommentForm from '../components/CommentForm';
import moment from 'moment';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsAPI.getPost(id),
    refetchOnWindowFocus: false,
  });

  const post = data?.data?.data || {};
  const comments = Array.isArray(post.comments) ? post.comments : [];
  
  const imageUrl = post.image_path
    ? `http://localhost:8000/storage/${post.image_path}`
    : 'https://via.placeholder.com/800x400';

  const addCommentMutation = useMutation({
    mutationFn: (commentData) => commentsAPI.addComment(id, commentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast.success('Comment added successfully');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast.success('Comment deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });

  if (isLoading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: "red" }}>{error.message}</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <div className="post-detail">
      <h1>{post.title || "Untitled"}</h1>
      <p>By {post.user?.name || "Unknown Author"}</p>
      {post.created_at && (
        <p className="post-date">
          Published on {moment(post.created_at).format('MMM D, YYYY')}
        </p>
      )}
      {post.image_path ? (
        <img src={imageUrl} alt={post.title} style={{ maxWidth: "100%" }} />
      ) : (
        <p>No Image Available</p>
      )}
      <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Comments Section */}
      <section className="comments-section">
        <h2 className="comments-title">{comments.length} Comment{comments.length !== 1 ? 's' : ''}</h2>
        {isAuthenticated ? (
          <CommentForm onSubmit={addCommentMutation.mutate} postId={post.id} />
        ) : (
          <div className="login-to-comment">Please <a href="/login">login</a> to leave a comment.</div>
        )}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <Comment key={comment.id} comment={comment} onDelete={deleteCommentMutation.mutate} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PostDetail;
