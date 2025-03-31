import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPostById } from "../services/api";
import Loader from "../components/Loader";
import Error from "../components/Error";

const PostDetail = () => {
  const { id } = useParams();
  
  const {
    data: post,
    isLoading,
    isError,
  } = useQuery(["post", id], () => fetchPostById(id));

  if (isLoading) return <Loader />;
  if (isError) return <Error message="Failed to load post." />;

  // Ensure user exists before accessing name
  const postAuthor = post?.user?.name || "Unknown Author";

  return (
    <div className="post-detail-container">
      <h1 className="post-title">{post?.title}</h1>
      <p className="post-author">By {postAuthor}</p>
      <div className="post-content">{post?.content}</div>
    </div>
  );
};

export default PostDetail;
