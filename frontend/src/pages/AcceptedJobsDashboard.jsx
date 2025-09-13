import { useEffect, useState } from "react";
import api from "../services/api"; 
import "./AppStyles.css";

export default function AcceptedJobsDashboard() {
  const [acceptedJobs, setAcceptedJobs] = useState([]);

  useEffect(() => {
    const fetchAcceptedJobs = async () => {
      try {
        const res = await api.get("/jobs/accepted");
        setAcceptedJobs(res.data);
      } catch (err) {
        console.error("Error fetching accepted jobs:", err);
      }
    };
    fetchAcceptedJobs();
  }, []);

  return (
    <div className="accepted-jobs-list">
      <h2>Accepted Jobs</h2>
      {acceptedJobs.length === 0 ? (
        <p>No accepted jobs yet.</p>
      ) : (
        <ul>
          {acceptedJobs.map((job) => (
            <li key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p>{job.description}</p>
              <p><strong>Category:</strong> {job.category}</p>
              <p><strong>Pay:</strong> ₹{job.price}</p>
              <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
              <p><strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}