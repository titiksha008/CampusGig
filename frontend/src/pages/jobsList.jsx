// // JobsList.jsx

// import { useEffect, useState } from "react";
// import api from "../services/api";
// import "./AppStyles.css";

// export default function JobsList({ user, setUser }) {
//   const [jobs, setJobs] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("");
//   const [tick, setTick] = useState(0);
//   const [currentUser, setCurrentUser] = useState(user || null);
//   const [sortOrder, setSortOrder] = useState(""); // "high" or "low"

//   // 🔹 Dropdown recommendation state (renamed to avoid conflicts)
//   const [skillRecommendedJobs, setSkillRecommendedJobs] = useState([]);
//   const [showRecommendations, setShowRecommendations] = useState(false);

//   // Force re-render every 60s
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTick((prev) => prev + 1);
//     }, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch jobs
//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const res = await api.get("/jobs", {
//           params: { search, role: roleFilter },
//         });
//         setJobs(res.data);

//         const uniqueCategories = [
//           ...new Set(res.data.map((job) => job.category?.toLowerCase())),
//         ];
//         setCategories(uniqueCategories);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//       }
//     };
//     fetchJobs();
//   }, [search, roleFilter]);

//   // 🔹 Create skill-based recommendations for dropdown (top 3)
// useEffect(() => {
//   if (currentUser && currentUser.skills && jobs.length > 0) {
//     // 1. Match based on user skills
//     const matched = jobs.filter((job) =>
//       currentUser.skills.some((skill) =>
//         job.title?.toLowerCase().includes(skill.toLowerCase()) ||
//         job.description?.toLowerCase().includes(skill.toLowerCase()) ||
//         job.category?.toLowerCase().includes(skill.toLowerCase())
//       )
//     );

//     // 2. Pick 2-3 top matches (if available)
//     const topMatches = matched.slice(0, 2);

//     // 3. Add one random "explore" job from other categories
//     const otherJobs = jobs.filter(
//       (job) =>
//         !matched.includes(job) &&
//         !topMatches.some((m) => m.category === job.category)
//     );

//     const randomOther =
//       otherJobs.length > 0
//         ? otherJobs[Math.floor(Math.random() * otherJobs.length)]
//         : null;

//     // 4. Merge and ensure unique categories
//     const combined = [...topMatches];
//     if (randomOther) combined.push(randomOther);

//     const uniqueCategoryJobs = Array.from(
//       new Map(combined.map((job) => [job.category, job])).values()
//     );

//     setSkillRecommendedJobs(uniqueCategoryJobs);
//   }
// }, [currentUser, jobs]);

//   // Fetch current user if not provided
//   useEffect(() => {
//     const fetchUser = async () => {
//       if (!currentUser) {
//         try {
//           const res = await api.get("/auth/me", { withCredentials: true });
//           const userData = res.data.user;
//           if (!userData.skills) userData.skills = [];
//           setCurrentUser(userData);
//           if (setUser) setUser(userData);
//         } catch (err) {
//           console.error("Error fetching user:", err);
//         }
//       }
//     };
//     fetchUser();
//   }, [currentUser, setUser]);

//   const handleBid = async (jobId) => {
//     const bidAmount = prompt("Enter your bid amount (₹):");
//     if (!bidAmount) return;

//     try {
//       await api.post(`/jobs/${jobId}/bid`, { bidAmount });

//       const res = await api.get("/auth/me", { withCredentials: true });
//       setCurrentUser(res.data.user);
//       if (setUser) setUser(res.data.user);

//       alert("Bid placed successfully!");
//     } catch (err) {
//       console.error("Error bidding:", err.response?.data || err.message);
//       alert(`Failed to place bid: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const handlePass = async (jobId) => {
//     try {
//       await api.post(`/jobs/${jobId}/pass`);
//       setJobs((prev) => prev.filter((job) => job._id !== jobId));
//       alert("You passed this job.");
//     } catch (err) {
//       console.error("Error passing job:", err.response?.data || err.message);
//       alert(`Failed to pass job: ${err.response?.data?.message || err.message}`);
//     }
//   };

//   const timeLeft = (deadline) => {
//     if (!deadline) return "No deadline";
//     const now = new Date();
//     const end = new Date(deadline);
//     const diffMs = end - now;
//     if (diffMs <= 0) return "Expired";

//     const seconds = Math.floor(diffMs / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);

//     if (days > 0) return `${days}d left`;
//     if (hours > 0) return `${hours}h left`;
//     if (minutes > 0) return `${minutes}m left`;
//     return "Less than a minute left";
//   };

//   // Filter out expired jobs
//   const validJobs = jobs.filter(
//     (job) => !job.deadline || new Date(job.deadline) > new Date()
//   );

//   // Normalize skills
//   const normalizeSkill = (skill) =>
//     skill.toLowerCase().trim().replace(/[^a-z0-9]/g, "");

//   // Recommended jobs (main list)
//   const recommendedJobs =
//     currentUser?.skills?.length > 0
//       ? validJobs
//           .map((job) => {
//             if (!job?.skills?.length) return null;

//             const userSkills = currentUser.skills.map(normalizeSkill);
//             const jobSkills = job.skills.map(normalizeSkill);

//             const matchCount = jobSkills.filter((js) =>
//               userSkills.includes(js)
//             ).length;

//             return matchCount > 0 ? { ...job, matchCount } : null;
//           })
//           .filter(Boolean)
//           .sort((a, b) => b.matchCount - a.matchCount)
//       : [];

//   const allJobs = validJobs.filter((job) => !recommendedJobs.includes(job));

//   // Sorting logic
//   const sortJobs = (jobs) => {
//     if (sortOrder === "high") return [...jobs].sort((a, b) => b.price - a.price);
//     if (sortOrder === "low") return [...jobs].sort((a, b) => a.price - b.price);
//     return jobs;
//   };

//   const sortedRecommendedJobs = sortJobs(recommendedJobs);
//   const sortedAllJobs = sortJobs(allJobs);

//   const renderJobCard = (job) => (
//     <li key={job._id} className="job-card">
//       <span className="job-time">{timeLeft(job.deadline)}</span>
//       <h3>{job.title}</h3>
//       <p>{job.description}</p>
//       <p>
//         <strong>Category:</strong> {job.category}
//       </p>
//       <p>
//         <strong>Skills:</strong>{" "}
//         {job.skills && job.skills.length > 0 ? job.skills.join(", ") : "None"}
//       </p>
//       <p>
//         <strong>Pay:</strong> ₹{job.price}
//       </p>
//       <p>
//         <strong>Deadline:</strong>{" "}
//         {job.deadline
//           ? new Date(job.deadline).toLocaleDateString()
//           : "No deadline"}
//       </p>
//       <p>
//         <strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}
//       </p>
//       <div className="job-actions">
//         <button onClick={() => handleBid(job._id)}>Place Bid</button>
//         <button onClick={() => handlePass(job._id)}>Pass</button>
//       </div>
//     </li>
//   );

//   // ✅ JSX Render
//   return (
//     <div className="jobs-list-container">
//       {/* Search and Filter */}
//       <div className="jobs-list-filters">
//         <div className="search-wrapper" style={{ position: "relative", width: "100%" }}>
//           <input
//             type="text"
//             placeholder="Search jobs..."
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               setShowRecommendations(false);
//             }}
//             onFocus={() => {
//               if (skillRecommendedJobs.length > 0) setShowRecommendations(true);
//             }}
//             onBlur={() => setTimeout(() => setShowRecommendations(false), 200)}
//             className="nav-search"
//           />

//           {/* 🔽 Dropdown with skill-based recommendations */}
//           {showRecommendations && (
//             <div
//               className="recommendations-dropdown"
//               style={{
//                 position: "absolute",
//                 top: "100%",
//                 left: 0,
//                 right: 0,
//                 background: "#fff",
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 padding: "8px",
//                 zIndex: 1000,
//                 boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//               }}
//             >
//               <p style={{ fontWeight: "bold", marginBottom: "6px" }}>
//                 Recommended for you:
//               </p>
//               {skillRecommendedJobs.length > 0 ? (
//                 skillRecommendedJobs.map((job) => (
//                   <div
//                     key={job._id}
//                     style={{
//                       padding: "6px 10px",
//                       cursor: "pointer",
//                       borderBottom: "1px solid #eee",
//                     }}
//                     onMouseDown={() => {
//                       setSearch(job.title);
//                       setShowRecommendations(false);
//                     }}
//                   >
//                     <strong>{job.title}</strong> — {job.category}
//                   </div>
//                 ))
//               ) : (
//                 <p>No recommendations yet.</p>
//               )}
//             </div>
//           )}
//         </div>

//         <select
//           value={roleFilter}
//           onChange={(e) => setRoleFilter(e.target.value)}
//           className="nav-filter"
//         >
//           <option value="">All Roles</option>
//           {categories.map((cat, index) => (
//             <option key={index} value={cat}>
//               {cat.charAt(0).toUpperCase() + cat.slice(1)}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Sorting Dropdown */}
//       <div className="sort-container">
//         <label htmlFor="sort">Sort by Price: </label>
//         <select
//           id="sort"
//           value={sortOrder}
//           onChange={(e) => setSortOrder(e.target.value)}
//           className="sort-select"
//         >
//           <option value="">Default</option>
//           <option value="high">High to Low</option>
//           <option value="low">Low to High</option>
//         </select>
//       </div>

//       {/* Recommended Jobs */}
//       <h2>Recommended Jobs</h2>
//       {sortedRecommendedJobs.length === 0 ? (
//         <p>No recommended jobs based on your skills.</p>
//       ) : (
//         <ul className="jobs-list">
//           {sortedRecommendedJobs.map((job) => (
//             <li key={job._id}>{renderJobCard(job)}</li>
//           ))}
//         </ul>
//       )}

//       {/* All Jobs */}
//       <h2>All Jobs</h2>
//       {sortedAllJobs.length === 0 ? (
//         <p>No other jobs available right now.</p>
//       ) : (
//         <ul className="jobs-list">
//           {sortedAllJobs.map((job) => (
//             <li key={job._id}>{renderJobCard(job)}</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
// JobsList.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "./AppStyles.css";

export default function JobsList({ user, setUser }) {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortOrder, setSortOrder] = useState(""); // "high" or "low"
  const [currentUser, setCurrentUser] = useState(user || null);

  // Dropdown recommendations
  const [skillRecommendedJobs, setSkillRecommendedJobs] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const lastShownRef = useRef([]);

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs", { params: {} });
        const validJobs = res.data.filter(
          (job) => !job.deadline || new Date(job.deadline) > new Date()
        );
        setJobs(validJobs);

        const uniqueCategories = [
          ...new Set(validJobs.map((job) => job.category).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, []);

  // Fetch current user if not provided
  useEffect(() => {
    const fetchUser = async () => {
      if (!currentUser) {
        try {
          const res = await api.get("/auth/me", { withCredentials: true });
          const userData = res.data.user;
          if (!userData.skills) userData.skills = [];
          setCurrentUser(userData);
          if (setUser) setUser(userData);
        } catch (err) {
          console.error("Error fetching user:", err);
        }
      }
    };
    fetchUser();
  }, [currentUser, setUser]);

  // Normalize text helper
  const normalize = (s) => s?.toString().toLowerCase().trim() ?? "";

  // Generate recommendations
  const getRecommendations = () => {
    if (!currentUser || jobs.length === 0) {
      setSkillRecommendedJobs([]);
      return;
    }

    // Skill-based matches
    const matched = jobs.filter((job) =>
      currentUser.skills.some((skill) => {
        const s = normalize(skill);
        return (
          normalize(job.title).includes(s) ||
          normalize(job.description).includes(s) ||
          normalize(job.category).includes(s)
        );
      })
    );

    // Deduplicate
    const uniqueById = (arr) =>
      Array.from(new Map(arr.map((j) => [j._id, j])).values());

    const topMatches = uniqueById(matched).slice(0, 2);

    // Random "explore" jobs
    const nonMatched = jobs.filter((j) => !matched.includes(j));
    const pickRandom = (arr) => (arr.length === 0 ? null : arr[Math.floor(Math.random() * arr.length)]);
    const randomOther = pickRandom(nonMatched);

    const combined = [...topMatches];
    if (randomOther) combined.push(randomOther);

    // Ensure at least 3 jobs
    const finalList = [...combined];
    let fillIndex = 0;
    while (finalList.length < 3 && fillIndex < jobs.length) {
      const candidate = jobs[fillIndex++];
      if (!finalList.some((j) => j._id === candidate._id)) finalList.push(candidate);
    }

    // Avoid showing the exact same set twice
    const last = lastShownRef.current || [];
    const isSame =
      last.length === finalList.length &&
      last.every((l, i) => l._id === finalList[i]._id);
    if (isSame) {
      const alternatives = jobs.filter((j) => !finalList.includes(j));
      if (alternatives.length > 0) finalList[0] = pickRandom(alternatives);
    }

    lastShownRef.current = finalList;
    setSkillRecommendedJobs(finalList);
  };

  // Click recommendation → filter search
  const handleClickSuggestion = (job) => {
    setSearch(job.title || "");
    setShowRecommendations(false);
  };

  // Bid & Pass
  const handleBid = async (jobId) => {
    const bidAmount = prompt("Enter your bid amount (₹):");
    if (!bidAmount) return;

    try {
      await api.post(`/jobs/${jobId}/bid`, { bidAmount });
      const res = await api.get("/auth/me", { withCredentials: true });
      setCurrentUser(res.data.user);
      if (setUser) setUser(res.data.user);
      alert("Bid placed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to place bid");
    }
  };

  const handlePass = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/pass`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      alert("You passed this job.");
    } catch (err) {
      console.error(err);
      alert("Failed to pass job");
    }
  };

  // Time left helper
  const timeLeft = (deadline) => {
    if (!deadline) return "No deadline";
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    if (minutes > 0) return `${minutes}m left`;
    return "Less than a minute left";
  };

  // Main recommended jobs (sorted by skill match)
  const normalizeSkill = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  const recommendedJobs =
    currentUser?.skills?.length > 0
      ? jobs
          .map((job) => {
            if (!job.skills?.length) return null;
            const userSkills = currentUser.skills.map(normalizeSkill);
            const jobSkills = job.skills.map(normalizeSkill);
            const matchCount = jobSkills.filter((js) => userSkills.includes(js)).length;
            return matchCount > 0 ? { ...job, matchCount } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b.matchCount - a.matchCount)
      : [];

  const allJobs = jobs.filter((job) => !recommendedJobs.includes(job));

  const sortJobs = (arr) => {
    if (sortOrder === "high") return [...arr].sort((a, b) => b.price - a.price);
    if (sortOrder === "low") return [...arr].sort((a, b) => a.price - b.price);
    return arr;
  };

  const sortedRecommendedJobs = sortJobs(recommendedJobs);
  const sortedAllJobs = sortJobs(allJobs);

  const renderJobCard = (job) => (
    <li key={job._id} className="job-card">
      <span className="job-time">{timeLeft(job.deadline)}</span>
      <h3>{job.title}</h3>
      <p>{job.description}</p>
      <p><strong>Category:</strong> {job.category}</p>
      <p><strong>Skills:</strong> {job.skills?.join(", ") || "None"}</p>
      <p><strong>Pay:</strong> ₹{job.price}</p>
      <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}</p>
      <p><strong>Posted by:</strong> {job.postedBy?.name || "Anonymous"}</p>
      <div className="job-actions">
        <button onClick={() => handleBid(job._id)}>Place Bid</button>
        <button onClick={() => handlePass(job._id)}>Pass</button>
      </div>
    </li>
  );

  // Filtered by search
  const filteredJobs = search
    ? jobs.filter((job) =>
        [job.title, job.description, job.category]
          .some((field) => field?.toLowerCase().includes(search.toLowerCase()))
      )
    : null;

  return (
    <div className="jobs-list-container">
      {/* Search + Dropdown */}
      <div className="jobs-list-filters">
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => {
              getRecommendations();
              setShowRecommendations(true);
            }}
            onBlur={() => setTimeout(() => setShowRecommendations(false), 200)}
            className="nav-search"
          />
          {showRecommendations && skillRecommendedJobs.length > 0 && (
            <div className="recommendations-dropdown" style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "#fff", border: "1px solid #ccc",
              borderRadius: "8px", padding: "8px", zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              <p style={{ fontWeight: "bold", marginBottom: "6px" }}>Recommended for you:</p>
              {skillRecommendedJobs.map((job, idx) => (
                <div key={job._id} onMouseDown={() => handleClickSuggestion(job)}
                     style={{ padding: "8px 10px", cursor: "pointer", borderBottom: idx < skillRecommendedJobs.length - 1 ? "1px solid #eee" : "none" }}>
                  <strong>{job.title}</strong> — <span style={{ color: "#666" }}>{job.category}</span>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {job.price ? `₹${job.price}` : ""} {job.deadline ? ` • ${timeLeft(job.deadline)}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="nav-filter">
          <option value="">All Roles</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>{cat?.charAt(0).toUpperCase() + cat?.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Sorting */}
      <div className="sort-container">
        <label htmlFor="sort">Sort by Price: </label>
        <select id="sort" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
          <option value="">Default</option>
          <option value="high">High to Low</option>
          <option value="low">Low to High</option>
        </select>
      </div>

      {/* Render Jobs */}
      {filteredJobs ? (
        <>
          <h2>Search Result</h2>
          {filteredJobs.length > 0 ? <ul className="jobs-list">{filteredJobs.map(renderJobCard)}</ul> :
            <p>No jobs found for “{search}”.</p>}
        </>
      ) : (
        <>
          <h2>Recommended Jobs</h2>
          {sortedRecommendedJobs.length > 0 ? <ul className="jobs-list">{sortedRecommendedJobs.map(renderJobCard)}</ul> :
            <p>No recommended jobs.</p>}

          <h2>All Jobs</h2>
          {sortedAllJobs.length > 0 ? <ul className="jobs-list">{sortedAllJobs.map(renderJobCard)}</ul> :
            <p>No other jobs available right now.</p>}
        </>
      )}
    </div>
  );
}
