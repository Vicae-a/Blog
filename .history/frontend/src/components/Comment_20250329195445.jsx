import moment from 'moment';
import { useAuth } from '../context/AuthContext';

const Comment = ({ comment, onDelete }) => {
  const { user } = useAuth();
  const isAuthor = user && comment.user_id === user.id;

  return (
    <div className="comment">
      <div className="comment-header">
        <h4 className="comment-author">{comment.user.name}</h4>
        <span className="comment-date">{moment(comment.created_at).format('MMM D, YYYY [at] h:mm A')}</span>
      </div>
      <p className="comment-content">{comment.content}</p>
      {isAuthor && (
        <button onClick={() => onDelete(comment.id)} className="delete-comment">
          Delete
        </button>
      )}
    </div>
  );
};

export default Comment;
