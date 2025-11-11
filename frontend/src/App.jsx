// frontend/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Navbar from "./pages/Navbar.jsx";
import Profile from "./pages/Profile.jsx";
import JobsList from "./pages/jobsList.jsx";
import PostJob from "./pages/PostJobs.jsx";
import MyJobs from "./pages/MyJobs.jsx";
import JobBids from "./pages/JobBids.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import MyBids from "./pages/MyBids.jsx";
import SavedJobs from "./pages/SavedJobs.jsx";
import ActivityTimelinePage from "./components/Timeline/ActivityTimelinePage.jsx";

// Components
import ChatWidget from "./components/ChatWidget.jsx";
import UserChat from "./components/UserChat.jsx";
import ChatList from "./components/ChatList.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar visible on all pages */}
        <Navbar />

        {/* Main Routes */}
        <div style={{ paddingTop: "64px" }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* Job Pages */}
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/my-jobs" element={<MyJobs />} />
            <Route path="/mybids" element={<MyBids />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/jobs/:jobId/bids" element={<JobBids />} />
            <Route path="/accepted-jobs" element={<AcceptedJobsDashboard />} />

            {/* Profile & Portfolio */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:userId" element={<Portfolio />} />

            {/* Chat */}
            <Route path="/chat" element={<ChatList />} />
            <Route
              path="/chat/:posterId/:jobId/:acceptedUserId"
              element={<UserChatWrapper />}
            />

            {/* Activity Timeline */}
            <Route path="/activities" element={<ActivityTimelinePage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        {/* Global Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

        {/* Floating Chat Widget */}
        <ChatWidget />
      </BrowserRouter>
    </AuthProvider>
  );
}

// Wrapper to pass current user safely
function UserChatWrapper() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return <UserChat currentUserId={user?._id} />;
}
