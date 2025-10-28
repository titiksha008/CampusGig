// src/pages/MyJobs.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import { FaStar } from "react-icons/fa";
import "./AppStyles.css";
import RatingComponent from "../Components/RatingComponent"; // adjust path if needed

const MyJobs = ({ onProfileUpdate }) => {
  const { user, loading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [ratingData, setRatingData] = useState({}); // track stars and comment for each job
  const navigate = useNavigate();

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/my");
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching my jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchJobs();
  }, [user]);

  // Handle Rating Submit
  const handleRatingSubmit = async (assignedJobId) => {
    const { stars, comment } = ratingData[assignedJobId] || {};
    if (!stars || stars < 1) {
      alert("Please select a star rating before submitting!");
      return;
    }

    try {
      await api.post(`/jobs/${assignedJobId}/rate`, { rating: stars, review: comment });
      alert("Thank you for your feedback!");
      fetchJobs();
      if (onProfileUpdate) onProfileUpdate();
      setRatingData((prev) => ({ ...prev, [assignedJobId]: { stars: 0, comment: "" } }));
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Failed to submit rating. Please try again.");
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
                  <p>
                    Posted on{" "}
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
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
                </div>

                {/* View Bids Button */}
                <div style={{ marginTop: "10px" }}>
                  <button
                    className="btn-accept"
                    onClick={() => navigate(`/jobs/${job._id}/bids`)}
                  >
                    View Bids
                  </button>
                </div>

                {/* Professional Rating Section */}
                {job.acceptedBy && job.status === "completed" && (
                  <div className="rating-card">
                    <h4 className="rating-header">⭐ Rate Completed Work</h4>
                    <div className="stars-wrapper">
                      {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1;
                        return (
                          <FaStar
                            key={ratingValue}
                            className="star-icon"
                            size={28}
                            color={
                              ratingValue <= (ratingData[job.assignedJobId]?.hover || ratingData[job.assignedJobId]?.stars)
                                ? "#facc15"
                                : "#e5e7eb"
                            }
                            onClick={() =>
                              setRatingData((prev) => ({
                                ...prev,
                                [job.assignedJobId]: {
                                  ...prev[job.assignedJobId],
                                  stars: ratingValue,
                                },
                              }))
                            }
                            onMouseEnter={() =>
                              setRatingData((prev) => ({
                                ...prev,
                                [job.assignedJobId]: {
                                  ...prev[job.assignedJobId],
                                  hover: ratingValue,
                                },
                              }))
                            }
                            onMouseLeave={() =>
                              setRatingData((prev) => ({
                                ...prev,
                                [job.assignedJobId]: {
                                  ...prev[job.assignedJobId],
                                  hover: null,
                                },
                              }))
                            }
                          />
                        );
                      })}
                    </div>

                    <textarea
                      className="rating-textarea"
                      placeholder="Write a short review..."
                      value={ratingData[job.assignedJobId]?.comment || ""}
                      onChange={(e) =>
                        setRatingData((prev) => ({
                          ...prev,
                          [job.assignedJobId]: {
                            ...prev[job.assignedJobId],
                            comment: e.target.value,
                          },
                        }))
                      }
                    />

                    <button
                      className="rating-btn"
                      onClick={() => handleRatingSubmit(job.assignedJobId)}
                    >
                      Submit Rating
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyJobs;
