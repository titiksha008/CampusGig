import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllDiscussions, createDiscussion } from "../services/discussionApi";
import { useAuth } from "../context/AuthContext";
import "./AppStyles.css";

export default function DiscussionBoard() {
  const [discussions, setDiscussions] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch discussions with search, tag, sorting, pagination
  const fetchDiscussions = async (pageNum = 1) => {
    try {
      setLoading(true);
      let query = `?page=${pageNum}&limit=10&sortBy=${sortBy}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedTag) query += `&tag=${encodeURIComponent(selectedTag)}`;
      const res = await getAllDiscussions(query);
      if (pageNum === 1) setDiscussions(res.data.discussions || []);
      else setDiscussions(prev => [...prev, ...res.data.discussions]);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions(1);
  }, [sortBy, selectedTag]);

  const handleLoadMore = () => {
    if (page < totalPages) fetchDiscussions(page + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post a discussion.");
    if (!title || !content) return;

    try {
      const tagList = tags.split(",").map(t => t.trim()).filter(Boolean);
      const res = await createDiscussion({ title, content, tags: tagList });
      setDiscussions(prev => [res.data, ...prev]);
      setTitle("");
      setContent("");
      setTags("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = () => fetchDiscussions(1);

  const handleTagClick = (tag) => {
    setSelectedTag(tag);
  };

  return (
    <div className="discussion-container">
      <h2 className="discussion-title">Campus Gig Discussion Board 💬</h2>

      {/* Search & Sort */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search discussions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="nav-search"
        />
        <button className="search-btn" onClick={handleSearch}>Search</button>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="nav-filter"
        >
          <option value="recent">Most Recent</option>
          <option value="views">Most Viewed</option>
          <option value="comments">Most Replied</option>
        </select>

        {selectedTag && (
          <button className="clear-tag-btn" onClick={() => setSelectedTag("")}>
            Clear Tag: #{selectedTag}
          </button>
        )}
      </div>

      {/* New Discussion Form */}
      <div className="discussion-form-card">
        <h3 className="section-title">📝 Start a New Discussion</h3>
        <form onSubmit={handleSubmit} className="discussion-form">
          <input
            type="text"
            placeholder="Post Title"
            className="input-field"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your question or discussion topic..."
            className="textarea-field"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tags (comma-separated, e.g., react, jobs)"
            className="input-field"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
          <button className="post-btn" type="submit">Post Discussion</button>
        </form>
      </div>

      <hr className="divider" />

      {/* Loading Skeleton */}
      {loading && page === 1 && (
        <Skeleton count={5} height={100} style={{ marginBottom: "12px" }} />
      )}

      {/* Discussion List */}
      {discussions.length === 0 && !loading ? (
        <p className="no-posts">No discussions yet. Start the conversation!</p>
      ) : (
        <div className="discussion-list">
          {discussions.map(d => (
            <div
              key={d._id}
              className="discussion-card"
              onClick={() => navigate(`/discussion/${d._id}`)}
            >
              <h3 className="discussion-card-title">{d.title}</h3>
              <p className="discussion-card-content">
                {d.content.length > 120 ? d.content.substring(0, 120) + "..." : d.content}
              </p>

              <div className="tag-container">
                {d.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className={`tag tag-${tag.toLowerCase()}`}
                    onClick={e => {
                      e.stopPropagation();
                      handleTagClick(tag);
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="meta-info">
                <span>👤 {d.author?.name || "Unknown User"}</span>
                <span>💬 {d.comments?.length || 0} replies</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {page < totalPages && (
        <button className="load-more-btn" onClick={handleLoadMore}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
