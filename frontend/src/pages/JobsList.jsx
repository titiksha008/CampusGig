
// import { useEffect, useState } from "react";
// import api from "../services/api"; 
// import "./AppStyles.css";

// export default function JobsList() {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await api.get("/jobs");
//         setJobs(res.data);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       }
//     };
//     fetchJobs();
//   }, []);

//  const handleAccept = async (jobId) => {
//   try {
//     await api.post(`/jobs/${jobId}/accept`);
//     alert("Job accepted successfully!");
//     setJobs(prev => prev.filter(job => job._id !== jobId));
//   } catch (err) {
//     alert("Failed to accept job.");
//   }
// };

// const handlePass = async (jobId) => {
//   try {
//     await api.post(`/jobs/${jobId}/pass`);
//     alert("Job passed successfully!");
//     setJobs(prev => prev.filter(job => job._id !== jobId));
//   } catch (err) {
//     alert("Failed to pass job.");
//   }
// };


//   return (
//     <div className="jobs-list">
//       <h2>Available Jobs</h2>
//       {jobs.length === 0 ? (
//         <p>No jobs posted yet.</p>
//       ) : (
//         <ul>
//           {jobs.map((job) => (
//             <li key={job._id} className="job-card">
//               <h3>{job.title}</h3>
//               <p>{job.description}</p>
//               <p><strong>Category:</strong> {job.category}</p>
//               <p><strong>Pay:</strong> ₹{job.price}</p>
//               <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
//               <p><strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}</p>

//               {/* ✅ Accept / Pass buttons */}
//              <div className="job-actions">
//   <button onClick={() => handleAccept(job._id)}>Accept</button>
//   <button onClick={() => handlePass(job._id)}>Pass</button>
// </div>

//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
//jobList.jsx

// import { useEffect, useState } from "react";
// import api from "../services/api"; 
// import "./AppStyles.css";

// export default function JobsList() {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await api.get("/jobs");
//         setJobs(res.data);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       }
//     };
//     fetchJobs();
//   }, []);

// const handleAccept = async (jobId) => {
//   try {
//     await api.post(`/jobs/${jobId}/accept`);
//     alert("Job accepted successfully!");
//     setJobs(prev => prev.filter(job => job._id !== jobId));
//   } catch (err) {
//     alert("Failed to accept job.");
//   }
// };

// const handlePass = async (jobId) => {
//   try {
//     await api.post(`/jobs/${jobId}/pass`);
//     alert("Job passed successfully!");
//     setJobs(prev => prev.filter(job => job._id !== jobId));
//   } catch (err) {
//     alert("Failed to pass job.");
//   }
// };


//   return (
//     <div className="jobs-list">
//       <h2>Available Jobs</h2>
//       {jobs.length === 0 ? (
//         <p>No jobs posted yet.</p>
//       ) : (
//         <ul>
//           {jobs.map((job) => (
//             <li key={job._id} className="job-card">
//               <h3>{job.title}</h3>
//               <p>{job.description}</p>
//               <p><strong>Category:</strong> {job.category}</p>
//               <p><strong>Pay:</strong> ₹{job.price}</p>
//               <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
//               <p><strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}</p>

//               {/* ✅ Accept / Pass buttons */}
//              <div className="job-actions">
//   <button onClick={() => handleAccept(job._id)}>Accept</button>
//   <button onClick={() => handlePass(job._id)}>Pass</button>
// </div>

//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import api from "../services/api"; 
// import "./AppStyles.css";

// export default function JobsList() {
//   const [jobs, setJobs] = useState([]);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");

//   // useEffect(() => {
//   //   const fetchJobs = async () => {
//   //     try {
//   //       const res = await api.get("/jobs", {
//   //         params: {
//   //           search,
//   //           role: roleFilter,
//   //         }
//   //       });
//   //       setJobs(res.data);
//   //     } catch (err) {
//   //       console.error("Error fetching jobs:", err);
//   //     }
//   //   };
//   //   fetchJobs();
//   // }, [search, roleFilter]);

//   useEffect(() => {
//   const fetchJobs = async () => {
//     try {
//       // ✅ include both search and role in query params
//       const res = await axios.get("http://localhost:5000/api/jobs", {
//         params: { search, role },
//       });
//       setJobs(res.data);
//     } catch (error) {
//       console.error("Error fetching jobs:", error);
//     }
//   };

//   fetchJobs();
// }, [search, role]); // ✅ re-fetch when either search or role changes


//   const handleAccept = async (jobId) => {
//     try {
//       await api.put(`/jobs/${jobId}/accept`);
//       alert("Job accepted successfully!");
//       setJobs(prev => prev.filter(job => job._id !== jobId));
//     } catch (err) {
//       alert("Failed to accept job.");
//     }
//   };

//   const handlePass = async (jobId) => {
//     try {
//       await api.post(`/jobs/${jobId}/pass`);
//       alert("Job passed successfully!");
//       setJobs(prev => prev.filter(job => job._id !== jobId));
//     } catch (err) {
//       alert("Failed to pass job.");
//     }
//   };

//   return (
//     <div className="jobs-list">
//       <h2>Available Jobs</h2>

//       {/* Search Bar */}
//       <input
//         type="text"
//         placeholder="Search jobs..."
//         value={search}
//         onChange={e => setSearch(e.target.value)}
//       />

//       {/* Role Filter Dropdown */}
//       <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
//         <option value="">All Roles</option>
//         <option value="developer">Developer</option>
//         <option value="designer">Designer</option>
//         <option value="marketing">Marketing</option>
//         {/* Add more role options as needed */}
//       </select>

//       {jobs.length === 0 ? (
//         <p>No jobs posted yet.</p>
//       ) : (
//         <ul>
//           {jobs.map((job) => (
//             <li key={job._id} className="job-card">
//               <h3>{job.title}</h3>
//               <p>{job.description}</p>
//               <p><strong>Category:</strong> {job.category}</p>
//               <p><strong>Pay:</strong> ₹{job.price}</p>
//               <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
//               <p><strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}</p>

//               {/* Accept / Pass buttons */}
//               <div className="job-actions">
//                 <button onClick={() => handleAccept(job._id)}>Accept</button>
//                 <button onClick={() => handlePass(job._id)}>Pass</button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }




// import { useEffect, useState } from "react";
// import api from "../services/api";
// import "./AppStyles.css";

// export default function JobsList() {
//   const [jobs, setJobs] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");

//   // Fetch jobs whenever search or roleFilter changes
//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await api.get("/jobs", {
//           params: {
//             search: search,
//             role: roleFilter, // send selected category to backend
//           }
//         });
//         setJobs(res.data);

//         // ✅ Collect unique categories dynamically
//         const uniqueCategories = [
//           ...new Set(res.data.map((job) => job.category?.toLowerCase()))
//         ];
//         setCategories(uniqueCategories);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       }
//     };
//     fetchJobs();
//   }, [search, roleFilter]);

//   const handleAccept = async (jobId) => {
//     try {
//       await api.put(`/jobs/${jobId}/accept`);
//       alert("Job accepted successfully!");
//       setJobs((prev) => prev.filter((job) => job._id !== jobId));
//     } catch (err) {
//       alert("Failed to accept job.");
//     }
//   };

//   const handlePass = async (jobId) => {
//     try {
//       await api.post(`/jobs/${jobId}/pass`);
//       alert("Job passed successfully!");
//       setJobs((prev) => prev.filter((job) => job._id !== jobId));
//     } catch (err) {
//       alert("Failed to pass job.");
//     }
//   };

//   return (
//     <div className="jobs-list">
//       <h2>Available Jobs</h2>

//       {/* Search Bar */}
//       <input
//         type="text"
//         placeholder="Search jobs..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* Dynamic Role Filter Dropdown */}
//       <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
//         <option value="">All Roles</option>
//         {categories.map((cat, index) => (
//           <option key={index} value={cat}>
//             {cat.charAt(0).toUpperCase() + cat.slice(1)}
//           </option>
//         ))}
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
//                 {new Date(job.deadline).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}
//               </p>

//               {/* Accept / Pass buttons */}
//               <div className="job-actions">
//                 <button onClick={() => handleAccept(job._id)}>Accept</button>
//                 <button onClick={() => handlePass(job._id)}>Pass</button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }




import { useEffect, useState } from "react";
import api from "../services/api";
import "./AppStyles.css";

export default function JobsList() {
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
            role: roleFilter, // send selected category to backend
          }
        });
        setJobs(res.data);

        // ✅ Collect unique categories dynamically
        const uniqueCategories = [
          ...new Set(res.data.map((job) => job.category?.toLowerCase()))
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, [search, roleFilter]);

  const handleAccept = async (jobId) => {
    try {
      await api.put(`/jobs/${jobId}/accept`);
      alert("Job accepted successfully!");
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      alert("Failed to accept job.");
    }
  };

  const handlePass = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/pass`);
      alert("Job passed successfully!");
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      alert("Failed to pass job.");
    }
  };

  return (
    <div className="jobs-list">
      <h2>Available Jobs</h2>

      {/* ✅ Search Bar + Filter Container */}
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

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <ul>
          {jobs.map((job) => (
            <li key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p>
                <strong>Category:</strong> {job.category}
              </p>
              <p>
                <strong>Pay:</strong> ₹{job.price}
              </p>
              <p>
                <strong>Deadline:</strong>{" "}
                {new Date(job.deadline).toLocaleDateString()}
              </p>
              <p>
                <strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}
              </p>

              {/* Accept / Pass buttons */}
              <div className="job-actions">
                <button onClick={() => handleAccept(job._id)}>Accept</button>
                <button onClick={() => handlePass(job._id)}>Pass</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



