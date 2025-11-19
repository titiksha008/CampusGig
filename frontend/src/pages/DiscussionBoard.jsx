// pages/DiscussionBoard.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getAllDiscussions, createDiscussion } from "../services/discussionApi";
import { useAuth } from "../context/AuthContext";
import "./discussion.css";

const INITIAL_LIMIT = 2;
const FETCH_ALL_LIMIT = 10000; // large enough to fetch "all" posts for tags & showAll

export default function DiscussionBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // full data
  const [allDiscussions, setAllDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  // UI state
  const [showAll, setShowAll] = useState(false);
  const [filteredDiscussions, setFilteredDiscussions] = useState(null);
  const [creating, setCreating] = useState(false);

  // form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const topRef = useRef(null);

  // Fetch ALL posts once (for tags & showAll)
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getAllDiscussions(`?page=1&limit=${FETCH_ALL_LIMIT}`);
      const arr = Array.isArray(res?.data?.discussions) ? res.data.discussions : [];
      setAllDiscussions(arr);

      // extract all tags from all posts, unique
      const allTags = Array.from(new Set(arr.flatMap((d) => (Array.isArray(d.tags) ? d.tags : []))));
      setAvailableTags(allTags);
    } catch (err) {
      console.error("Failed to fetch discussions (all):", err);
      alert("Failed to load discussions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL tag param -> selectedTag
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("tag") || "";
    if (t) {
      setSelectedTag(t);
      // set filtered and expand to show results
      const matched = allDiscussions.filter((p) => Array.isArray(p.tags) && p.tags.includes(t));
      setFilteredDiscussions(matched);
      setShowAll(true);
      // scroll to top so user sees list
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else {
      setSelectedTag("");
      setFilteredDiscussions(null);
    }
  }, [location.search, allDiscussions]);

  // Visible items (computed)
  const visibleItems = (() => {
    if (selectedTag && filteredDiscussions) return filteredDiscussions;
    if (showAll) return allDiscussions;
    return allDiscussions.slice(0, INITIAL_LIMIT);
  })();

  const handleTagClick = (tag) => {
    if (!tag) {
      navigate(window.location.pathname, { replace: true });
      setSelectedTag("");
      setFilteredDiscussions(null);
      return;
    }

    // set URL param (so direct links work)
    navigate(`?tag=${encodeURIComponent(tag)}`, { replace: true });
    // location.search effect will handle the rest
  };

  const openDiscussion = (id) => navigate(`/discussion/${id}`);

  const toggleShowAll = () => {
    const next = !showAll;
    setShowAll(next);

    // if collapsing, clear any tag filter if one is active (optional)
    if (!next) {
      // scroll to top of list
      setTimeout(() => {
        if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      // if we had a tag selected, we keep it but also collapse to top
      // you might want to clear tag on collapse; keeping tag is more intuitive
    } else {
      // if expanding, scroll slightly so user sees new items
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to post.");
    if (!title.trim() || !content.trim()) return alert("Title and content required.");

    try {
      setCreating(true);
      const tagList = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        tags: tagList,
      });

      // prepend to allDiscussions so it appears immediately
      setAllDiscussions((prev) => [res.data, ...prev]);

      // update tags
      if (tagList.length) {
        setAvailableTags((prev) => Array.from(new Set([...(prev || []), ...tagList])));
      }

      setTitle("");
      setContent("");
      setTagsInput("");

      // Ensure newly created post is visible (expand and scroll to top)
      setShowAll(true);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (err) {
      console.error("Create failed:", err);
      alert("Could not post discussion.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="discussion-container" ref={topRef}>
      <h2 className="discussion-title">Campus Gig Discussion Board 💬</h2>

      {selectedTag && (
        <div className="selected-tag-banner">
          Showing: <strong>#{selectedTag}</strong>
          <button className="clear-tag-btn" onClick={() => handleTagClick("")}>
            Clear
          </button>
        </div>
      )}

      {/* All tags always visible */}
      <div className="tag-bar">
        <span className="filter-label">Filter:</span>
        {availableTags.length === 0 && !loading ? (
          <span className="no-posts">No tags yet</span>
        ) : (
          availableTags.map((t) => (
            <button
              key={t}
              className={`tag-pill ${t === selectedTag ? "tag-selected" : ""}`}
              onClick={() => handleTagClick(t)}
              type="button"
            >
              {t}
            </button>
          ))
        )}
        <button className="tag-clear" onClick={() => handleTagClick("")}>Clear</button>
      </div>

      {loading && (
        <Skeleton count={INITIAL_LIMIT} height={90} className="skeleton-loader" />
      )}

      <div className={`discussion-list ${showAll ? "expanded" : "collapsed"}`} aria-live="polite">
        {visibleItems.length === 0 && !loading ? (
          <p className="no-posts">No discussions yet. Start the conversation!</p>
        ) : (
          visibleItems.map((d) => (
            <div
              key={d._id}
              className="discussion-card"
              onClick={() => openDiscussion(d._id)}
            >
              <h3 className="discussion-card-title">
                {d.title || d.content?.slice(0, 120) || "Untitled"}
              </h3>

              <p className="discussion-card-content">
                {d.content?.length > 140
                  ? d.content.substring(0, 140) + "..."
                  : d.content}
              </p>

              <div className="tag-container">
                {Array.isArray(d.tags) &&
                  d.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`tag ${selectedTag === tag ? "tag-selected" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagClick(tag);
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
              </div>

              <div className="meta-info">
                <span>👤 {d.author?.name || "Unknown"}</span>
                <span>
                  💬{" "}
                  {Array.isArray(d.comments)
                    ? d.comments.length
                    : d.commentsCount ?? 0}{" "}
                  replies
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* See More / See Less */}
      {allDiscussions.length > INITIAL_LIMIT && (
        <button className="see-more-btn" onClick={toggleShowAll}>
          {showAll ? "See Less" : `See More (${allDiscussions.length - INITIAL_LIMIT} more)`}
        </button>
      )}

      <hr className="divider" />

      <div className="discussion-form-card">
        <h3 className="section-title">📝 Start a New Discussion</h3>
        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            type="text"
            placeholder="Post Title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Write your question or topic..."
            className="textarea-field"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            className="input-field"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <button className="post-btn" type="submit" disabled={creating}>
            {creating ? "Posting..." : "Post Discussion"}
          </button>
        </form>
      </div>
    </div>
  );
}
