const express = require('express');
const { razorpay } = require('../config/razorpayClient');
const Job = require('../models/Job');
// adjust if your auth middleware file/name differs:
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/jobs/:id/accept
router.post('/jobs/:id/accept', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'OPEN') return res.status(400).json({ error: 'Job is not open' });

    // who accepted (worker)
    job.acceptedBy = req.user._id;
    job.status = 'ACCEPTED';
    job.acceptedAt = new Date();

    // fees (example 10% platform fee)
    const platformFee = Math.round(job.amount * 0.10);
    const workerPayout = job.amount - platformFee;

    const order = await razorpay.orders.create({
      amount: job.amount,          // paise
      currency: job.currency,      // 'INR'
      receipt: `job_${job._id}`,
      partial_payment: false,
    });

    job.payment = {
      orderId: order.id,
      heldAmount: job.amount,
      platformFee,
      workerPayout,
      status: 'PENDING',
    };
    await job.save();

    res.json({
      orderId: order.id,
      amount: job.amount,
      currency: job.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      jobId: job._id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Accept/payment init failed' });
  }
});

module.exports = router;
