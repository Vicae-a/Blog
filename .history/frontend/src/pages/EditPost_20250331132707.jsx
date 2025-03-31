import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { postsAPI } from "../services/api";
import { toast } from "react-toastify";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null,
    published_at: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postsAPI.getPost(id),
    refetchOnWindowFocus: false,
  });

  // Debugging: Check if API is returning data
  useEffect(() => {
    console.log("Fetched Data:", data); // <-- Check if data exists
    if (data?.data) {
      const post = data.data;
      setFormData({
        title: post.title || "",
        content: post.content || "",
        image: null, 
        published_at: post.published_at 
          ? new Date(post.published_at).toISOString().slice(0, 16) 
          : "",
      });
      console.log("Updated formData:", {
        title: post.title,
        content: post.content,
        published_at: post.published_at,
      }); // <-- Check if formData is set
    }
  }, [data]); // Runs when `data` is updated

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "image" ? files[0] : value,
    }));
  };

  if (isLoading) return <div>Loading post...</div>;
  if (error) return <div>Error loading post: {error.message}</div>;

  return (
    <div>
      <h1>Edit Post</h1>
      <form>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
        />
      </form>
    </div>
  );
};

export default EditPost;
