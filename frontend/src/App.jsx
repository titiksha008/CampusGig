<<<<<<< HEAD
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
=======
// //frontend

// //app.jsx
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider , useAuth } from "./context/AuthContext";
// import Signup from "./pages/Signup.jsx";
// import Login from "./pages/Login.jsx";
// import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard"; // import accepted jobs dashboard
// import Dashboard from "./pages/Dashboard.jsx";
// import Navbar from "./pages/Navbar.jsx"; // ✅ import Navbar
// import Profile from "./pages/Profile";
// import JobsList from "./pages/jobsList";
// import PostJob from "./pages/PostJobs.jsx"; 
// import ChatWidget from "./components/ChatWidget.jsx";
// import UserChat from "./components/UserChat.jsx";

// // inside Routes

// export default function App() {
//     // ✅ Step 2: get the current user from AuthContext
//   const { user, loading } = useAuth();
//   const currentUserId = user?._id; // adjust if your user object uses 'id' instead of '_id'

//   if (loading) return <div>Loading...</div>; // optional: wait for auth to load


//   return (
//         <AuthProvider>
//     <BrowserRouter>
//       {/* ✅ Navbar at the top */}
//       <Navbar />  

//       <div style={{ paddingTop: "80px" }}>
//   <Routes>
//     <Route path="/" element={<JobsList />} />
//     <Route path="/accepted-jobs" element={<AcceptedJobsDashboard />} /> Accepted jobs dashboard
//     <Route path="/post-job" element={<PostJob />} />
//     <Route path="/profile" element={<Profile />} />
//     <Route path="/signup" element={<Signup />} />
//     <Route path="/login" element={<Login />} />
//     <Route path="/dashboard" element={<Dashboard />} />
//     <Route
//       path="/chat/:posterId/:jobId/:acceptedUserId"
//       element={<UserChat currentUserId={currentUserId} />}
//     />
//     {/* <Route path="/" element={<h1 style={{ textAlign: "center", marginTop: "40px", color: "#7c3aed" }}>Welcome to CampusGig</h1>} /> */}
    
//   </Routes>
// </div>
//     <ChatWidget /> {/* ✅ appears on all screens */}
//     </BrowserRouter>
//     </AuthProvider>
//   );
// }


// frontend/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing.jsx"; // ✅ Import the landing page
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard";
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./pages/Navbar.jsx";
import Profile from "./pages/Profile";
import JobsList from "./pages/jobsList";
import PostJob from "./pages/PostJobs.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import UserChat from "./components/UserChat.jsx";
import ChatList from "./components/ChatList.jsx";
import MyJobs from "./pages/MyJobs.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar always visible */}
        <Navbar />

        <div style={{ paddingTop: "64px" }}>
          <Routes>
            <Route path="/" element={<Landing />} />           {/* Landing page */}
            <Route path="/jobs" element={<JobsList />} />     {/* Jobs list page */}
            <Route path="/accepted-jobs" element={<AcceptedJobsDashboard />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/chat" element={<ChatList />} />  {/* ✅ Add this */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Full-page chat route */}
            <Route
              path="/chat/:posterId/:jobId/:acceptedUserId"
              element={<UserChatWrapper />}
            />
          </Routes>
        </div>

        {/* Chat widget appears on all screens */}
        <ChatWidget />
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      </BrowserRouter>
    </AuthProvider>
  );
}
<<<<<<< HEAD
=======

// Wrapper component to safely get currentUserId from AuthContext
function UserChatWrapper() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return <UserChat currentUserId={user?._id} />;
}
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
