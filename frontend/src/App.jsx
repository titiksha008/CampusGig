import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
// import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard"; 
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar";
import Profile from "./pages/Profile";
import JobsList from "./pages/JobsList";
import PostJob from "./pages/PostJob";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ✅ Navbar at the top */}
        <Navbar />

        <div style={{ paddingTop: "80px" }}>
          <Routes>
            <Route path="/" element={<JobsList />} />
            {/* <Route path="/accepted" element={<AcceptedJobsDashboard />} /> */}
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
