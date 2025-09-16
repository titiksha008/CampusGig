//frontend

//app.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
// import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard"; // import accepted jobs dashboard
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./pages/Navbar.jsx"; // ✅ import Navbar
import Profile from "./pages/Profile";
import JobsList from "./pages/jobsList";
import PostJob from "./pages/PostJobs.jsx"; 


// inside Routes

export default function App() {
  return (
        <AuthProvider>
    <BrowserRouter>
      {/* ✅ Navbar at the top */}
      <Navbar />  

      <div style={{ paddingTop: "80px" }}>
  <Routes>
    <Route path="/" element={<JobsList />} />
    {/* <Route path="/accepted" element={<AcceptedJobsDashboard />} /> Accepted jobs dashboard */}
    <Route path="/post-job" element={<PostJob />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<Dashboard />} />
    {/* <Route path="/" element={<h1 style={{ textAlign: "center", marginTop: "40px", color: "#7c3aed" }}>Welcome to CampusGig</h1>} /> */}
    
  </Routes>
</div>

    </BrowserRouter>
    </AuthProvider>
  );
}