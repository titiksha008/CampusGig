<<<<<<< HEAD
=======
// //Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";
// import "./AppStyles.css";

// export default function Login() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post("/auth/login", form); // cookie is set automatically
//       navigate("/dashboard"); // token is already in cookie
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };


//    return (
//     <div className="page-container">
//       <h2>Login</h2>
//       {error && <p className="error-message">{error}</p>}
//       <form onSubmit={handleSubmit} className="form">
//         <input
//           name="email"
//           type="email"
//           placeholder="Email"
//           value={form.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           value={form.password}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }


>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AppStyles.css";
import { useAuth } from "../context/AuthContext"; // ✅ import

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // ✅ use context
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

<<<<<<< HEAD
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
=======
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
<<<<<<< HEAD
      setUser(data.user); // ✅ update context
=======
      setUser(data.user); // ✅ update context so Navbar updates
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="form">
<<<<<<< HEAD
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
=======
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
