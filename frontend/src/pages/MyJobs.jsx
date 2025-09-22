import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

const MyJobs = () => {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [rating, setRating] = useState({}); // track rating input for each job

  useEffect(() => {
    if (!user) return;

    const fetchMyJobs = async () => {
      try {
        const res = await api.get("/jobs/my");
        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching my jobs:", err);
      } finally {
        setJobsLoading(false);
      }
    };
    fetchMyJobs();
  }, [user]);

  const handleRate = async (jobId) => {
    try {
      if (!rating[jobId]) return alert("Please enter a rating between 1-5");
      const res = await api.post(`/jobs/${jobId}/rate`, { rating: Number(rating[jobId]) });
      alert("Rating submitted successfully!");
      // refresh jobs list
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, acceptedBy: { ...job.acceptedBy }, status: "rated" } : job
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to submit rating");
    }
  };

  if (loading || jobsLoading)
    return <p className="text-center mt-6">Loading your jobs...</p>;

  return (
    <div>
      <Navbar />
      <div className="my-jobs-container">
        <h2>My Posted Jobs</h2>
        {jobs.length === 0 ? (
          <p>You haven’t posted any jobs yet.</p>
        ) : (
          <ul className="my-jobs-list">
            {jobs.map((job) => (
              <li key={job._id} className="my-job-card">
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.description}</p>
                  <p>Posted on {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  {job.acceptedBy ? (
                    <span className={`job-status accepted`}>
                      {job.status === "completed" || job.status === "rated"
                        ? "Completed by " + job.acceptedBy.name
                        : "Accepted by " + job.acceptedBy.name}
                    </span>
                  ) : (
                    <span className="job-status pending">Not yet accepted</span>
                  )}
                  {/* Rating input */}
                  {job.acceptedBy && job.status === "completed" && (
                    <div style={{ marginTop: "8px" }}>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        placeholder="Rate 1-5"
                        value={rating[job._id] || ""}
                        onChange={(e) =>
                          setRating({ ...rating, [job._id]: e.target.value })
                        }
                        style={{ padding: "4px 6px", width: "60px", marginRight: "8px" }}
                      />
                      <button
                        onClick={() => handleRate(job._id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          background: "#7c3aed",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
