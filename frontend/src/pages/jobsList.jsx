<<<<<<< HEAD
// src/pages/JobsList.jsx
=======
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AppStyles.css";

<<<<<<< HEAD
export default function JobsList({ user, setUser }) {   // ✅ accept props
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs", { params: { search, role } });
        setJobs(res.data);
=======
export default function JobsList({ setUser }) {  // ✅ accept setUser prop
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Fetch jobs whenever search or roleFilter changes
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs", {
          params: {
            search: search,
            role: roleFilter,
          },
        });
        setJobs(res.data);

        // Collect unique categories dynamically
        const uniqueCategories = [
          ...new Set(res.data.map((job) => job.category?.toLowerCase())),
        ];
        setCategories(uniqueCategories);
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
<<<<<<< HEAD
  }, [search, role]);
=======
  }, [search, roleFilter]);
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6

  const handleAccept = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/accept`);

<<<<<<< HEAD
      // ✅ remove job instantly
      setJobs((prev) => prev.filter((j) => j._id !== jobId));

      // ✅ update user’s accepted job count
=======
      // Remove the accepted job instantly
      setJobs((prev) => prev.filter((job) => job._id !== jobId));

      // ✅ Update user after accepting job
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      if (setUser) {
        const userRes = await api.get("/auth/me", { withCredentials: true });
        setUser(userRes.data.user);
      }

      alert("Job accepted successfully!");
    } catch (err) {
      console.error("Error accepting job:", err.response?.data || err.message);
<<<<<<< HEAD
      alert(`Failed to accept job: ${err.response?.data?.message || err.message}`);
=======
      alert(
        `Failed to accept job: ${err.response?.data?.message || err.message}`
      );
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    }
  };

  const handlePass = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/pass`);
<<<<<<< HEAD
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      alert("You passed this job.");
    } catch (err) {
      console.error("Error passing job:", err.response?.data || err.message);
      alert(`Failed to pass job: ${err.response?.data?.message || err.message}`);
=======
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      alert("You passed this job.");
    } catch (err) {
      console.error("Error passing job:", err.response?.data || err.message);
      alert(
        `Failed to pass job: ${err.response?.data?.message || err.message}`
      );
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    }
  };

  return (
    <div className="jobs-list">
      <h2>Available Jobs</h2>
<<<<<<< HEAD
      <input
        type="text"
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">All Roles</option>
        <option value="coding">Coding</option>
        <option value="design">Design</option>
        <option value="writing">Writing</option>
      </select>
=======

      {/* Search + Filter */}
      <div className="jobs-filters">
        <input
          type="text"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="nav-search"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="nav-filter"
        >
          <option value="">All Roles</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
<<<<<<< HEAD
              <p><strong>Category:</strong> {job.category}</p>
              <p><strong>Pay:</strong> ₹{job.price}</p>
=======
              <p>
                <strong>Category:</strong> {job.category}
              </p>
              <p>
                <strong>Pay:</strong> ₹{job.price}
              </p>
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
              <p>
                <strong>Deadline:</strong>{" "}
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
              </p>
<<<<<<< HEAD
              <p><strong>Posted by:</strong> {job.postedBy?.name}</p>

              <div className="job-actions">
                <button className="nav-btn signup-btn" onClick={() => handleAccept(job._id)}>
                  Accept
                </button>
                <button className="nav-btn" onClick={() => handlePass(job._id)}>
                  Pass
                </button>
=======
              <p>
                <strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}
              </p>

              <div className="job-actions">
                <button onClick={() => handleAccept(job._id)}>Accept</button>
                <button onClick={() => handlePass(job._id)}>Pass</button>
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
