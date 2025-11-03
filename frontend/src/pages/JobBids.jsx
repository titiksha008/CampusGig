import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { selectWinningBid, getJobById, completePayment } from "../services/jobs";
import "./AppStyles.css";

export default function JobBids() {
  const { jobId } = useParams();

  const [bids, setBids] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payoutRef, setPayoutRef] = useState("");

  const refresh = useCallback(async () => {
    const [jobRes, bidsRes] = await Promise.all([
      getJobById(jobId),
      api.get(`/jobs/${jobId}/bids`)
    ]);
    setJob(jobRes.data);
    setBids(bidsRes.data || []);
  }, [jobId]);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("Error fetching bids/job:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const handleSelectBidAndPay = async (bidId) => {
    try {
      setPaying(true);

      // creates/returns a Razorpay order; also marks this bid accepted
      const { data } = await selectWinningBid(jobId, bidId);
      const { payment } = data; // { orderId, keyId, amount, currency, jobId }

      if (!payment) {
        alert("Payment order was not created.");
        return;
      }
      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Refresh the page.");
        return;
      }

     const rzp = new window.Razorpay({
  key: payment.keyId,
  order_id: payment.orderId,
  amount: payment.amount, // paise
  currency: payment.currency || "INR",
  name: "CampusGig",
  description: "Escrow charge to job poster",
  handler: async () => {
    // webhook will update DB -> refresh UI shortly after
    setTimeout(async () => {
      try { await refresh(); } catch {}
    }, 2500);
    alert("Payment initiated. Awaiting confirmation…");
  },
  theme: { color: "#2563eb" },
});

// 🧩 ADD THIS SECTION just before rzp.open()
rzp.on("payment.failed", (resp) => {
  const err = resp?.error || {};
  console.error("Razorpay payment.failed:", resp);
  alert(
    `Payment Failed\n` +
    `code: ${err.code || "-"}\n` +
    `reason: ${err.reason || "-"}\n` +
    `description: ${err.description || "-"}`
  );
});

// 👇 finally open the Razorpay checkout
rzp.open();

      rzp.open();
    } catch (err) {
      console.error("Error starting payment:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || err.message || "Failed to start payment");
    } finally {
      setPaying(false);
    }
  };

  const handleCompleteAndRelease = async () => {
    try {
      if (!payoutRef.trim()) {
        if (!confirm("No payout reference entered. Proceed anyway?")) return;
      }
      await completePayment(jobId, payoutRef.trim());
      setPayoutRef("");
      await refresh();
      alert("Job marked completed & payout recorded");
    } catch (err) {
      console.error("Complete-payment error:", err?.response?.data || err.message);
      alert(err?.response?.data?.message || err.message || "Failed to complete");
    }
  };

  if (loading) return <p>Loading bids…</p>;
  if (!job) return <p>Job not found.</p>;

  const isPaid = job?.payment?.status === "PAID";
  const isCompleted = job?.status === "COMPLETED";

  return (
    <div className="jobs-list">
      <h2>Job Bids</h2>

      {/* Job summary */}
      <div className="job-card">
        <h3>{job.title}</h3>
        <p>{job.description}</p>
        <p><strong>Budget:</strong> ₹{job.price}</p>
        <p>
          <strong>Deadline:</strong>{" "}
          {job.deadline ? new Date(job.deadline).toLocaleDateString() : "No deadline"}
        </p>
        <p><strong>Status:</strong> {job.status}</p>
        <p>
          <strong>Payment:</strong>{" "}
          {job.payment?.status || "NONE"}{job.payment?.heldAmount ? ` (₹${(job.payment.heldAmount/100).toFixed(2)})` : ""}
        </p>
      </div>

      {/* If not paid yet, show bids with Select & Pay / Pay Now */}
      {!isPaid && (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Bids</h3>
          {bids.length === 0 ? (
            <p>No bids yet for this job.</p>
          ) : (
            <ul>
              {bids.map((bid) => (
                <li key={bid._id} className="job-card">
                  <p><strong>Student:</strong> {bid.student?.name} ({bid.student?.email})</p>
                  <p><strong>Bid Amount:</strong> ₹{bid.bidAmount}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {bid.status === "pending" ? "⏳ Pending" : bid.status}
                  </p>

                  <div className="job-buttons">
                    <button
                      className="btn-portfolio"
                      onClick={() => window.location.assign(`/portfolio/${bid.student?._id}`)}
                    >
                      View Portfolio
                    </button>

                    {/* 🔽 Button shows for both pending & accepted (until payment captured) */}
                    {!isPaid && (bid.status === "pending" || bid.status === "accepted") && (
                      <button
                        className="btn-accept"
                        disabled={paying}
                        onClick={() => handleSelectBidAndPay(bid._id)}
                      >
                        {paying ? "Processing…" : (bid.status === "pending" ? "Select Bid & Pay" : "Pay Now")}
                      </button>
                    )}

                    {bid.status === "accepted" && (
                      <span style={{ color: "green", fontWeight: "bold", marginLeft: 12 }}>
                        ✅ Selected {isPaid ? "(paid)" : "(awaiting payment)"}
                      </span>
                    )}
                    {bid.status === "rejected" && (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        ❌ Rejected
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* After payment captured, allow completion & payout recording */}
      {isPaid && !isCompleted && (
        <>
          <h3 style={{ marginTop: "1.5rem" }}>Release payout</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Payout reference (UTR / note)"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
            />
            <button className="btn-primary" onClick={handleCompleteAndRelease}>
              Complete & Release
            </button>
          </div>
        </>
      )}

      {isCompleted && (
        <div style={{ marginTop: "1rem", color: "green", fontWeight: "bold" }}>
          ✅ Job completed & payout recorded
        </div>
      )}
    </div>
  );
}
