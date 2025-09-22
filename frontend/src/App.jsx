import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import api from "./services/api";

// Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyJobs from "./pages/MyJobs";
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import Profile from "./pages/Profile";
import JobsList from "./pages/JobsList";
import PostJob from "./pages/PostJob";
import AcceptedJobs from "./pages/AcceptedJobs";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar user={user} />

        <div style={{ paddingTop: "80px" }}>
          <Routes>
            <Route path="/" element={<JobsList user={user} setUser={setUser} />} />
            <Route path="/accepted-jobs" element={<AcceptedJobs user={user} />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/post-job" element={<PostJob user={user} setUser={setUser} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/signup" element={<Signup setUser={setUser} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
