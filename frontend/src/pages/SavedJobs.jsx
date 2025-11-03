//src/pages/SavedJobs.jsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./SavedJobs.css";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
const res = await api.get("/api/users/saved-jobs");

        setJobs(res.data);
      } catch (err) {
        console.error("Error fetching saved jobs", err);
      }
    };
    fetchSavedJobs();
  }, []);

  return (
    <div className="saved-jobs-container">
      <h2>⭐ Saved Jobs</h2>
      {jobs.length === 0 ? (
        <p>You haven’t saved any jobs yet.</p>
      ) : (
        <div className="saved-jobs-list">
          {jobs.map((job) => (
            <div key={job._id} className="saved-job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p><strong>Budget:</strong> ₹{job.budget}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
