// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import Lottie from "lottie-react";
import ProfilePicSelector, { avatarsMap } from "../components/ProfilePicSelector";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ActivityCalendar from "react-activity-calendar";
import Timeline from "../components/Timeline/Timeline";
import api from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [showSelector, setShowSelector] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newTask, setNewTask] = useState({ title: "", status: "" });
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    axios
      .get(`http://localhost:5000/api/portfolio/${user._id}`)
      .then((res) => setPortfolioProjects(res.data.projects || []))
      .catch((err) => console.error("Error fetching portfolio:", err));
  }, [user]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/jobs/me", {
          withCredentials: true,
        });
        setUser(res.data.user);
        setProfilePic(res.data.user.profilePic || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/jobs/activities/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data)
          ? res.data
          : res.data.activities || [];

        const formatted = data.map((a) => ({
          ...a,
          userName: a.user?.name || "Unknown User",
          jobName: a.jobName || a.job?.title || "Untitled Job",
          date: new Date(a.createdAt).toLocaleString(),
          type:
            a.action === "posted"
              ? "green"
              : a.action === "accepted"
              ? "blue"
              : "purple",
        }));

        setActivities(formatted);

        const activityCountByDate = {};
        data.forEach((a) => {
          const date = new Date(a.createdAt).toISOString().split("T")[0];
          activityCountByDate[date] = (activityCountByDate[date] || 0) + 1;
        });

        const calendar = Object.entries(activityCountByDate).map(
          ([date, count]) => ({
            date,
            count,
            level: Math.min(count, 4),
          })
        );

        setCalendarData(calendar);
      } catch (err) {
        console.error("Error fetching activities:", err);
      }
    };

    fetchActivities();
  }, []);

  const badges = [];
  if (user?.jobsPosted >= 5) badges.push("🏅 Job Poster");
  if (user?.jobsAccepted >= 5) badges.push("🎯 Job Acceptor");
  if (user?.jobsCompleted >= 5) badges.push("✅ Job Completer");
  if ((user?.rating || 0) >= 4.5) badges.push("🌟 Top Rated");
  if ((user?.tasksDone?.filter((t) => t.status === "Completed").length || 0) >= 5)
    badges.push("💪 Campus Hero");

  const pieData = [
    { name: "Jobs Posted", value: user?.jobsPosted || 0 },
    { name: "Jobs Accepted", value: user?.jobsAccepted || 0 },
    { name: "Jobs Completed", value: user?.jobsCompleted || 0 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contacts.")) {
      const key = name.split(".")[1];
      setUser({ ...user, contacts: { ...user.contacts, [key]: value } });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setUser({ ...user, skills: [...(user.skills || []), newSkill] });
    setNewSkill("");
  };

  const removeSkill = (idx) => {
    setUser({ ...user, skills: user.skills.filter((_, i) => i !== idx) });
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    setUser({ ...user, tasksDone: [...(user.tasksDone || []), newTask] });
    setNewTask({ title: "", status: "" });
  };

  const removeTask = (idx) => {
    setUser({ ...user, tasksDone: user.tasksDone.filter((_, i) => i !== idx) });
  };

  const saveProfile = () => {
    const payload = {
      ...user,
      profilePic: profilePic || "",
      tasksDone: user.tasksDone || [],
      portfolio: user.portfolio || [],
      skills: user.skills || [],
      contacts: { ...(user.contacts || {}) },
    };

    axios
      .put("http://localhost:5000/api/auth/me", payload, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data.user || res.data);
        setProfilePic(res.data.user?.profilePic || res.data?.profilePic || null);
        setEditMode(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to update profile");
      });
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-box">
          <div className="profile-pic-wrapper">
            {profilePic ? (
              <Lottie
                animationData={avatarsMap[profilePic]}
                loop
                style={{ height: 120 }}
              />
            ) : (
              <img
                src="https://static.vecteezy.com/system/resources/previews/036/280/650/large_2x/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
                alt="Profile"
                className="profile-pic"
              />
            )}
          </div>

          <h2>{user.name || "Your Name"}</h2>
          <p>
            {user.branch || "Branch"} | {user.college || "College"}
          </p>
          <p className="bio">{user.bio || "Your bio goes here..."}</p>

          <button className="edit-profile-btn" onClick={() => setEditMode(!editMode)}>
            {editMode ? "Save / Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* Stats */}
        <div className="stats-card">
          <h3>{user.jobsPosted || 0}</h3>
          <p>Jobs Posted</p>
        </div>
        <div className="stats-card">
          <h3>{user.jobsAccepted || 0}</h3>
          <p>Jobs Accepted</p>
        </div>
        <div className="stats-card">
          <h3>{user.jobsCompleted || 0}</h3>
          <p>Jobs Completed</p>
        </div>
        <div className="stats-card">
          <h3>₹{user.totalEarnings || 0}</h3>
          <p>Total Earnings</p>
        </div>
        <div className="stats-card">
          <h3>{user.rating ? `${user.rating}⭐` : "—⭐"}</h3>
          <p>Rating</p>
        </div>

        {/* Badges */}
        <div className="badges-container">
          <h4>Badges</h4>
          <div className="badges-list">
            {badges.length > 0 ? (
              badges.map((b, idx) => (
                <span key={idx} className="badge">
                  {b}
                </span>
              ))
            ) : (
              <p>No badges yet</p>
            )}
          </div>
        </div>

        <div className="timeline-section">
          <Timeline activities={activities} />
        </div>
      </div>

      {/* Main */}
      <div className="profile-main">
        {!editMode ? (
          <>
            {/* Pie Chart */}
            <div className="profile-section">
              <h3>Profile Insights</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Skills */}
            <div className="profile-section">
              <h3>Skills</h3>
              <div className="skills-list">
                {user.skills?.length
                  ? user.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">
                        {skill}
                      </span>
                    ))
                  : "No skills added yet"}
              </div>
            </div>

            {/* Tasks */}
            <div className="profile-section">
              <h3>Campus Gigs Completed</h3>
              <ul className="task-list">
                {user.tasksDone?.length
                  ? user.tasksDone.map((task, idx) => (
                      <li key={idx}>
                        {task.title} - <b>{task.status}</b>
                      </li>
                    ))
                  : "No tasks completed yet"}
              </ul>
            </div>

            {/* Portfolio */}
            <div className="profile-section">
              <h3>Portfolio</h3>
              <div className="portfolio-grid">
                {portfolioProjects.length > 0 ? (
                  portfolioProjects.map((proj, idx) => (
                    <a
                      key={idx}
                      href={
                        proj.link || `http://localhost:5000${proj.fileUrl}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="portfolio-card"
                    >
                      <p>{proj.title}</p>
                    </a>
                  ))
                ) : (
                  <p>No portfolio added yet.</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="profile-section contacts">
              <h3>Contact</h3>
              <div className="contacts-row">
                {user.contacts?.phone && <p>{user.contacts.phone}</p>}
                <div className="contacts-icons">
                  {user.contacts?.github && (
                    <a
                      href={
                        user.contacts.github.startsWith("http")
                          ? user.contacts.github
                          : `https://${user.contacts.github}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      title="GitHub"
                    >
                      <FaGithub size={24} />
                    </a>
                  )}
                  {user.contacts?.linkedin && (
                    <a
                      href={
                        user.contacts.linkedin.startsWith("http")
                          ? user.contacts.linkedin
                          : `https://${user.contacts.linkedin}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      title="LinkedIn"
                    >
                      <FaLinkedin size={24} />
                    </a>
                  )}
                  {user.contacts?.email && (
                    <a href={`mailto:${user.contacts.email}`} title="Email">
                      <FaEnvelope size={24} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Calendar */}
            <div className="calendar-container">
              <h3 className="calendar-title">Activity Overview</h3>
              {calendarData.length > 0 ? (
                <>
                  <div className="month-labels">
                    {[
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ].map((month, i) => (
                      <span key={i} className="month-label">
                        {month}
                      </span>
                    ))}
                  </div>
                  <ActivityCalendar
                    data={calendarData}
                    labels={{
                      legend: { less: "Less", more: "More" },
                      totalCount: "{{count}} activities in {{year}}",
                    }}
                    theme={{
                      light: [
                        "#f3e8ff",
                        "#d8b4fe",
                        "#c084fc",
                        "#a855f7",
                        "#7e22ce",
                      ],
                      dark: [
                        "#2e1065",
                        "#4c1d95",
                        "#6d28d9",
                        "#8b5cf6",
                        "#c4b5fd",
                      ],
                    }}
                    colorScheme="light"
                    hideColorLegend={false}
                    blockSize={15}
                    blockMargin={4}
                    fontSize={14}
                  />
                </>
              ) : (
                <p className="text-gray-500 italic">No activity data yet</p>
              )}
            </div>
          </>
        ) : (
          <p>Edit mode content here (already in your original file)</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
