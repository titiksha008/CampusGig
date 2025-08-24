// import { Link } from "react-router-dom";
// import "./AppStyles.css";

// export default function Navbar() {
//   return (
//     <nav className="navbar">
//       <div className="nav-left">
//         <Link to="/" className="logo">CampusGig</Link>
//       </div>

//       <div className="nav-center">
//         <Link to="/assign-job" className="nav-link">Assign Job</Link>
//         <Link to="/search-job" className="nav-link">Search Job</Link>
//         <input type="text" placeholder="Search..." className="nav-search" />
//       </div>

//       <div className="nav-right">
//         <Link to="/dashboard" className="nav-link">Profile</Link>
//         <Link to="/login" className="nav-btn">Login</Link>
//         <Link to="/signup" className="nav-btn signup-btn">Signup</Link>
//       </div>
//     </nav>
//   );
// }
import { Link } from "react-router-dom";
import "./AppStyles.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="logo">CampusGig</Link>
      </div>

      <div className="nav-right">
        <Link to="/">Jobs</Link>
        <Link to="/post-job">Post Job</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/profile">Profile</Link> {/* ✅ Added Profile */}
      </div>
    </nav>
  );
}
