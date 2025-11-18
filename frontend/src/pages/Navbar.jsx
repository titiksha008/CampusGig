// frontend/src/pages/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import "./AppStyles.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FaComments, FaClipboardList } from "react-icons/fa"; // ⬅️ Imported FaClipboardList for a new icon

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    }
    setUser(null);
    navigate("/login");
  };

  if (loading) return null; // wait for auth check
  const loggedIn = !!user;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          CampusGig
        </Link>
      </div>

      <div className="nav-center">
        <Link to="/jobs">Jobs</Link>
        <Link to="/post-job">Post Job</Link>
        {/* 🚀 NEW DISCUSSION BOARD LINK */}
        <Link to="/discussion" className="nav-link-discussion">
          <FaClipboardList size={18} className="mr-1" /> {/* Use an icon for visual distinction */}
          Discussion
        </Link>
        {loggedIn && <Link to="/accepted-jobs">Accepted Jobs</Link>}
        {loggedIn && <Link to="/my-jobs">My Jobs</Link>}
      </div>

      <div className="nav-right">
        {loggedIn && (
          <Link to="/chat" className="chat-icon-link" title="Chat">
            <FaComments size={30} />
          </Link>
        )}

        {loggedIn ? (
          <div className="profile-dropdown">
            <span className="profile-text">Profile ▾</span>
            <div className="dropdown-content">
              <Link to="/profile">View Profile</Link>
              <Link to={`/portfolio/${user._id}`}>Portfolio</Link>
              <Link to="/mybids">My Bids / Earnings</Link>
              <Link to="/saved-jobs">Saved Jobs</Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-btn">
              Login
            </Link>
            <Link to="/signup" className="nav-btn signup-btn">
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}