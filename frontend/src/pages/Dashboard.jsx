<<<<<<< HEAD
=======
//pages/Dashboard.jsx
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
import { useEffect, useState } from "react";
import api from "../services/api";
import "./AppStyles.css";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me") // cookies sent automatically
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container">
      <h2>Dashboard</h2>
      {loading ? (
        <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
      ) : user ? (
        <div className="dashboard-info">
          <strong>Name:</strong> {user.name} <br />
          <strong>Email:</strong> {user.email} <br />
        </div>
      ) : (
        <p className="error-message">You are not logged in.</p>
      )}
<<<<<<< HEAD
    </div>
  );
}
=======
    </div>
  );
}
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
