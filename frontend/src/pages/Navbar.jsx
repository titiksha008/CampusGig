// Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import "./AppStyles.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // only if backend uses cookies
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  if (loading) return null;

  const loggedIn = !!user;
  const userId = user?._id || localStorage.getItem("userId"); // ✅ fallback

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">CampusGig</Link>
      </div>

      <div className="nav-center">
        <Link to="/jobs">Jobs</Link>
        {loggedIn && <Link to="/post-job">Post Job</Link>}
        {loggedIn && <Link to="/accepted-jobs">Accepted Jobs</Link>}
        {loggedIn && <Link to="/my-jobs">My Jobs</Link>}
        {loggedIn && userId && (
          <Link to={`/portfolio/${userId}`} className="nav-link">
            Portfolio
          </Link>
        )}
      </div>

      <div className="nav-right">
        {loggedIn && <Link to="/chat">Chat</Link>}
        {loggedIn && <Link to="/profile" className="nav-link">Profile</Link>}
        {!loggedIn ? (
          <>
            <Link to="/login" className="nav-btn">Login</Link>
            <Link to="/signup" className="nav-btn signup-btn">Signup</Link>
          </>
        ) : (
          <button className="nav-btn signup-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
