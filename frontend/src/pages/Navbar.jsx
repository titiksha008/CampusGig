import { Link, useNavigate } from "react-router-dom";
import "./AppStyles.css";
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; // ✅ context

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

  if (loading) return null;
  const loggedIn = !!user;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">
          CampusGig
        </Link>
      </div>

      <div className="nav-center">
        <Link to="/">Jobs</Link>
        <Link to="/post-job">Post Job</Link>
      </div>

      <div className="nav-right">
        {loggedIn && (
          <Link to="/profile" className="nav-link">
            Profile
          </Link>
        )}
        {!loggedIn ? (
          <>
            <Link to="/login" className="nav-btn">
              Login
            </Link>
            <Link to="/signup" className="nav-btn signup-btn">
              Signup
            </Link>
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
