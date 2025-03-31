import { useState } from 'react';

const CommentForm = ({ onSubmit, postId }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
        await onSubmit({ post_id: postId, content });

      setContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <h3>Add a Comment</h3>
      <div className="form-group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment here..."
          maxLength={500}
          required
          disabled={isSubmitting}
        />
        <small>{content.length}/500</small>
      </div>
      <button type="submit" disabled={isSubmitting || !content.trim()}>
        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
      </button>
    </form>
  );
};

export default CommentForm;
