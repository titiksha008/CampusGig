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

//   // ✅ handle when a student accepts a job
//   const handleAccept = async (jobId) => {
//     try {
//       // Call backend API to mark job as accepted (you’ll add this route in backend)
//       await api.post(`/jobs/${jobId}/accept`);
//       alert("You have accepted this job!");
//     } catch (err) {
//       console.error("Error accepting job:", err);
//       alert("Failed to accept job.");
//     }
//   };

//   // ✅ handle when a student passes a job
//   const handlePass = (jobId) => {
//     alert(`You passed on job ${jobId}`);
//     // (Optional) update frontend to hide/remove the job from the list
//     setJobs(jobs.filter((job) => job._id !== jobId));
//   };

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

//               {/* ✅ Accept / Pass Buttons */}
//               <div className="job-actions">
//                 <button 
//                   className="accept-btn" 
//                   onClick={() => handleAccept(job._id)}
//                 >
//                   Accept
//                 </button>
//                 <button 
//                   className="pass-btn" 
//                   onClick={() => handlePass(job._id)}
//                 >
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

import { useEffect, useState } from "react";
import api from "../services/api"; 
import "./AppStyles.css";

export default function JobsList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

 const handleAccept = async (jobId) => {
  try {
    await api.post(`/jobs/${jobId}/accept`);
    alert("Job accepted successfully!");
    setJobs(prev => prev.filter(job => job._id !== jobId));
  } catch (err) {
    alert("Failed to accept job.");
  }
};

const handlePass = async (jobId) => {
  try {
    await api.post(`/jobs/${jobId}/pass`);
    alert("Job passed successfully!");
    setJobs(prev => prev.filter(job => job._id !== jobId));
  } catch (err) {
    alert("Failed to pass job.");
  }
};


  return (
    <div className="jobs-list">
      <h2>Available Jobs</h2>
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
              <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
              <p><strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}</p>

              {/* ✅ Accept / Pass buttons */}
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
