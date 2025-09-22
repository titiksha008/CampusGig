// // src/pages/JobsList.jsx
// import { useEffect, useState } from "react";
// import api from "../services/api";
// import "./AppStyles.css";

// export default function JobsList() {
//   const [jobs, setJobs] = useState([]);
//   const [search, setSearch] = useState("");
//   const [role, setRole] = useState("");

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await api.get("/jobs", {
//           params: { search, role }
//         });
//         setJobs(res.data);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       }
//     };
//     fetchJobs();
//   }, [search, role]);

// const handleAccept = async (jobId) => {
//   try {
//     const res = await api.put(`/jobs/${jobId}/accept`);

//     // ✅ remove job instantly from state
//     setJobs((prev) => prev.filter((j) => j._id !== jobId));

//     // ✅ update user’s accepted job count
//     if (setUser) {
//       const userRes = await api.get("/auth/me");
//       setUser(userRes.data.user);
//     }

//     alert("Job accepted successfully!");
//   } catch (err) {
//     console.error("Error accepting job:", err.response?.data || err.message);
//     alert(`Failed to accept job: ${err.response?.data?.message || err.message}`);
//   }
// };


//   const handlePass = async (jobId) => {
//     try {
//       await api.post(`/jobs/${jobId}/pass`);
//       // ✅ remove job instantly from state
//       setJobs((prev) => prev.filter((j) => j._id !== jobId));
//       alert("You passed this job.");
//     } catch (err) {
//       console.error("Error passing job:", err.response?.data || err.message);
//       alert(`Failed to pass job: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   return (
//     <div className="jobs-list">
//       <h2>Available Jobs</h2>
//       <input
//         type="text"
//         placeholder="Search jobs..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />
//       <select value={role} onChange={(e) => setRole(e.target.value)}>
//         <option value="">All Roles</option>
//         <option value="coding">Coding</option>
//         <option value="design">Design</option>
//         <option value="writing">Writing</option>
//       </select>

//       {jobs.length === 0 ? (
//         <p>No jobs posted yet.</p>
//       ) : (
//         <ul>
//           {jobs.map((job) => (
//             <li key={job._id} className="job-card">
//               <h3>{job.title}</h3>
//               <p>{job.description}</p>
//               <p>
//                 <strong>Category:</strong> {job.category}
//               </p>
//               <p>
//                 <strong>Pay:</strong> ₹{job.price}
//               </p>
//               <p>
//                 <strong>Deadline:</strong>{" "}
//                 {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
//               </p>
//               <p>
//                 <strong>Posted by:</strong> {job.postedBy?.name}
//               </p>

//               <div className="job-actions">
//                 <button className="nav-btn signup-btn" onClick={() => handleAccept(job._id)}>
//                   Accept
//                 </button>
//                 <button className="nav-btn" onClick={() => handlePass(job._id)}>
//                   Pass
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
// src/pages/JobsList.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AppStyles.css";

export default function JobsList({ user, setUser }) {   // ✅ accept props
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs", { params: { search, role } });
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, [search, role]);

  const handleAccept = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/accept`);

      // ✅ remove job instantly
      setJobs((prev) => prev.filter((j) => j._id !== jobId));

      // ✅ update user’s accepted job count
      if (setUser) {
        const userRes = await api.get("/auth/me", { withCredentials: true });
        setUser(userRes.data.user);
      }

      alert("Job accepted successfully!");
    } catch (err) {
      console.error("Error accepting job:", err.response?.data || err.message);
      alert(`Failed to accept job: ${err.response?.data?.message || err.message}`);
    }
  };

  const handlePass = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/pass`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      alert("You passed this job.");
    } catch (err) {
      console.error("Error passing job:", err.response?.data || err.message);
      alert(`Failed to pass job: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="jobs-list">
      <h2>Available Jobs</h2>
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

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p><strong>Category:</strong> {job.category}</p>
              <p><strong>Pay:</strong> ₹{job.price}</p>
              <p>
                <strong>Deadline:</strong>{" "}
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
              </p>
              <p><strong>Posted by:</strong> {job.postedBy?.name}</p>

              <div className="job-actions">
                <button className="nav-btn signup-btn" onClick={() => handleAccept(job._id)}>
                  Accept
                </button>
                <button className="nav-btn" onClick={() => handlePass(job._id)}>
                  Pass
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
