
// import { Link } from "react-router-dom";
// import "./AppStyles.css";

// export default function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="nav-left">
//         <Link to="/" className="logo">CampusGig</Link>
//       </div>

//       <div className="nav-right">
//         <Link to="/">Jobs</Link>
//         <Link to="/post-job">Post Job</Link>
//         <Link to="/login">Login</Link>
//         <Link to="/signup">Signup</Link>
//         <Link to="/profile">Profile</Link> {/* ✅ Added Profile */}
//       </div>
//     </nav>
//   );
// }

import { Link } from "react-router-dom";
import "./AppStyles.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Left Logo */}
      <div className="nav-left">
        <Link to="/" className="logo">CampusGig</Link>
      </div>

      {/* Right Links */}
      <div className="nav-right">
        <Link to="/jobs" className="nav-link">Jobs</Link>
        <Link to="/post-job" className="nav-link">Post Job</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/signup" className="nav-link signup-btn">Signup</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
      </div>
    </nav>
  );
}
