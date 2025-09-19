import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import JobsList from "./pages/JobsList";
import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
import api from "./services/api";   // ✅ for fetching current user

export default function App() {
  const [user, setUser] = useState(null);

  // ✅ Fetch user profile once when app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        console.log("No user logged in");
      }
    };
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      {/* ✅ Navbar at the top */}
      <Navbar user={user} />

      <div style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<JobsList setUser={setUser} />} />
          <Route path="/accepted" element={<AcceptedJobsDashboard />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/welcome"
            element={
              <h1 style={{ textAlign: "center", marginTop: "40px", color: "#7c3aed" }}>
                Welcome to CampusGig
              </h1>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
