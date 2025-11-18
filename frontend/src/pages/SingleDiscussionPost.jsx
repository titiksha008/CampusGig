import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getDiscussionById, addReplyToDiscussion } from "../services/discussionApi";
import { useAuth } from "../context/AuthContext";
import "../pages/AppStyles.css";

export default function SingleDiscussionPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [reply, setReply] = useState("");
  const { user } = useAuth();

  const fetchPost = async () => {
    try {
      const res = await getDiscussionById(id);
      setPost(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitReply = async () => {
    if (!user) return alert("Login required to reply.");
    if (!reply) return;

    try {
      await addReplyToDiscussion(id, { text: reply });
      setReply("");
      fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (!post) return <p className="loading">Loading post...</p>;

  return (
    <div className="single-container">
      <div className="single-card">
        <h2>{post.title}</h2>
        <p className="single-content">{post.content}</p>

        <div className="tag-container">
          {post.tags?.map((tag, i) => (
            <span key={i} className={`tag tag-${tag.toLowerCase()}`}>
              #{tag}
            </span>
          ))}
        </div>

        <p className="posted-by">Posted by 👤 {post.author?.name || "Unknown"}</p>
      </div>

      <h3 className="replies-title">💬 Replies</h3>

      <div className="reply-list">
        {post.comments?.map((r, index) => (
          <div key={index} className="reply-card">
            <p>{r.text}</p>
            <small className="reply-user">
              👤 {r.user?.name || "User"} • {formatDistanceToNow(new Date(r.createdAt))} ago
            </small>
          </div>
        ))}
      </div>

      <textarea
        className="textarea-field"
        placeholder="Write your reply..."
        value={reply}
        onChange={e => setReply(e.target.value)}
      />
      <button className="post-btn" onClick={submitReply}>
        Reply
      </button>
    </div>
  );
}
