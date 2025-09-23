// // src/pages/MyJobs.jsx
// import { useEffect, useState } from "react";
// import api from "../services/api";
// import Navbar from "./Navbar";
// import { useAuth } from "../context/AuthContext";

// const MyJobs = ({ onProfileUpdate }) => {
//   const { user, loading } = useAuth();
//   const [jobs, setJobs] = useState([]);
//   const [jobsLoading, setJobsLoading] = useState(true);

//   useEffect(() => {
//     if (!loading && user) {
//       fetchJobs();
//     }
//   }, [loading, user]);

//   const fetchJobs = async () => {
//     try {
//       const res = await api.get("/jobs/my"); // fetch jobs of current user
//       setJobs(res.data);
//     } catch (err) {
//       console.error("Error fetching jobs:", err);
//     } finally {
//       setJobsLoading(false);
//     }
//   };

//   // Handle rating a job
//   const handleRate = async (jobId) => {
//     try {
//       const rating = parseInt(prompt("Enter rating (1-5):"));
//       const review = prompt("Write a review (optional):");

//       if (!rating || rating < 1 || rating > 5) {
//         alert("Invalid rating. Please enter 1-5.");
//         return;
//       }

//       await api.put(`/jobs/${jobId}/rate`, { rating, review });
//       fetchJobs(); // refresh jobs
//       if (onProfileUpdate) onProfileUpdate(); // refresh profile stats
//     } catch (err) {
//       console.error("Failed to rate job:", err);
//       alert("Error rating job.");
//     }
//   };

//   if (jobsLoading) return <p>Loading jobs...</p>;

//   return (
//     <div>
//       <Navbar />
//       <div className="jobs-list p-6">
//         <h2 className="text-2xl font-bold mb-4">My Jobs</h2>

//         {jobs.length === 0 ? (
//           <p>No jobs posted yet.</p>
//         ) : (
//           <div className="job-grid grid gap-4">
//             {jobs.map((job) => (
//               <div
//                 key={job._id}
//                 className="job-card p-4 border rounded-lg shadow bg-white"
//               >
//                 <h3 className="text-lg font-semibold">{job.title}</h3>
//                 <p className="text-gray-700">{job.description}</p>
//                 <p className="mt-2 text-sm">
//                   <strong>Status:</strong>{" "}
//                   {job.status === "pending"
//                     ? "Not yet accepted"
//                     : job.status === "accepted"
//                     ? `Accepted by ${job.acceptedBy?.name || "someone"}`
//                     : job.status === "completed"
//                     ? "Completed"
//                     : job.status === "rated"
//                     ? "Rated (Completed)"
//                     : "Unknown"}
//                 </p>

//                 {/* ⭐️ Rate button */}
//                 {job.status === "completed" && (
//                   <button
//                     className="btn-complete mt-2 px-3 py-1 bg-blue-500 text-white rounded"
//                     onClick={() => handleRate(job._id)}
//                   >
//                     Rate Work
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyJobs;
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

const MyJobs = ({ onProfileUpdate }) => {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      fetchJobs();
    }
  }, [loading, user]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await api.get("/jobs/my"); // fetch jobs for this user
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  const handleRate = async (assignedJobId) => {
    try {
      const rating = parseFloat(prompt("Enter rating (1-5)"));
      const review = prompt("Enter review");

      if (!rating || rating < 1 || rating > 5) {
        return alert("Invalid rating. Must be between 1 and 5.");
      }

      await api.put(`/jobs/${assignedJobId}/rate`, { rating, review });
      fetchJobs(); // refresh jobs list
      if (onProfileUpdate) onProfileUpdate(); // refresh profile stats
      alert("Job rated successfully!");
    } catch (err) {
      console.error("Error rating job:", err);
      alert(err.response?.data?.message || "Error rating job. Please try again.");
    }
  };

  if (jobsLoading) return <p>Loading jobs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <Navbar />
      <div className="jobs-list">
        <h2>My Jobs</h2>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          <div className="job-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                <h3>{job.title}</h3>
                <p>{job.description}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  {job.status === "pending"
                    ? "Not yet accepted"
                    : job.status === "accepted"
                    ? `Accepted by ${job.acceptedBy?.name || "someone"}`
                    : job.status === "completed"
                    ? "Completed"
                    : job.status === "rated"
                    ? "Rated (Completed)"
                    : "Unknown"}
                </p>

                {job.status === "completed" && job.assignedJobId && (
                  <button
                    className="btn-complete"
                    onClick={() => handleRate(job.assignedJobId)}
                  >
                    Rate Work
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
