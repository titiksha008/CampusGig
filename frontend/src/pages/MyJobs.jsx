
import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";

const MyJobs = ({ onProfileUpdate }) => {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState({}); // store ratings per job

  useEffect(() => {
    if (!loading && user) {
      fetchJobs();
    }
  }, [loading, user]);

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await api.get("/jobs/my");
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
      const ratingVal = rating[assignedJobId];
      if (!ratingVal || ratingVal < 1 || ratingVal > 5) {
        return alert("Please enter a rating between 1–5");
      }

      await api.post(`/jobs/${assignedJobId}/rate`, { rating: Number(ratingVal) });
      alert("Rating submitted successfully!");
      fetchJobs();
      if (onProfileUpdate) onProfileUpdate();

      setRating((prev) => ({ ...prev, [assignedJobId]: "" }));
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

                {/* ⭐ Rating input only when completed */}
                {job.status === "completed" && job.assignedJobId && (
                  <div style={{ marginTop: "8px" }}>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      placeholder="Rate 1-5"
                      value={rating[job.assignedJobId] || ""}
                      onChange={(e) =>
                        setRating({ ...rating, [job.assignedJobId]: e.target.value })
                      }
                      style={{ padding: "4px 6px", width: "60px", marginRight: "8px" }}
                    />
                    <button
                      onClick={() => handleRate(job.assignedJobId)}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
