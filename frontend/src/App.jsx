// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import JobsList from "./pages/JobsList";
// import Dashboard from "./pages/Dashboard";
// import Navbar from "./pages/Navbar"; 
//   import PostJob from "./pages/PostJob";
//   import Profile from "./pages/Profile";

// export default function App() {
//   return (
//     <BrowserRouter>
//       {/* ✅ Navbar at the top */}
//       <Navbar />  

//       <div style={{ paddingTop: "80px" }}>



// <Routes>
//  <Route path="/" element={<JobsList />} />   {/* Home shows jobs */}
//         <Route path="/post-job" element={<PostJob />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/profile" element={<Profile />} />
//   <Route path="/" element={<h1 style={{ textAlign: "center", marginTop: "40px", color: "#7c3aed" }}>Welcome to CampusGig</h1>} />

// </Routes>

// </div>

//     </BrowserRouter>
//   );
// }



import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import JobsList from "./pages/JobsList";
// import AcceptedJobsDashboard from "./pages/AcceptedJobsDashboard"; // import accepted jobs dashboard
import Dashboard from "./pages/Dashboard";
import Navbar from "./pages/Navbar"; 
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      {/* Navbar at the top */}
      <Navbar />  

      <div style={{ paddingTop: "80px" }}>
        <Routes>
          <Route path="/" element={<JobsList />} />   {/* Home shows jobs */}
          {/* <Route path="/accepted" element={<AcceptedJobsDashboard />} /> Accepted jobs dashboard */}
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

          {/* Remove or comment out the duplicate root route below */}
          {/*
          <Route path="/" element={<h1 style={{ textAlign: "center", marginTop: "40px", color: "#7c3aed" }}>Welcome to CampusGig</h1>} />
          */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
