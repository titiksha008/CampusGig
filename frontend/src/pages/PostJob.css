import { useState } from "react";
import api from "../services/api"; // axios instance
import "./PostJob.css"; // ✅ external css

export default function PostJob() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    deadline: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to post a job");
        return;
      }

      const res = await api.post("/jobs", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Job posted successfully!");
      setForm({
        title: "",
        description: "",
        category: "",
        price: "",
        deadline: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="post-job-container">
      <h2 className="post-job-title">Post a Job</h2>
      <form className="post-job-form" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Job Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="category"
          placeholder="Category (e.g. Coding, Design)"
          value={form.category}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹)"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          required
        />
        <button type="submit" className="post-job-btn">
          Post Job
        </button>
      </form>
    </div>
  );
}
