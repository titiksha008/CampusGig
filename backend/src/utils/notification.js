import User from "../models/User.js";
import Jobs from "../models/Jobs.js";
import AssignedJob from "../models/AssignedJob.js";
import { sendEmail } from "./email.js";
import * as smsModule from "./sms.js";
import * as notificationTemplatesModule from "./notificationTemplates.js";

// Accept various export shapes
const sendSMS = smsModule.sendSMS || smsModule.default || null;
const notificationTemplates =
  notificationTemplatesModule.notificationTemplates ||
  notificationTemplatesModule.default ||
  notificationTemplatesModule;

// Ensure we have the right model name
const JobModel = Jobs;
console.log("🔍 Job Model check:", {
  hasModel: !!JobModel,
  modelName: JobModel?.modelName,
  collection: JobModel?.collection?.name
});

/** Notify poster when a job is created */
export async function notifyNewJob(job) {
  try {
    const posterId = job.posterId || job.poster || job.postedBy;
    const poster = posterId ? await User.findById(posterId).select("name email") : null;
    if (!poster?.email) return;

    const subjectPoster = "Your job is posted — CampusGig";
    const textPoster = `Hi ${poster.name || ""},\n\nYour job "${job.title || "Untitled"}" is live.\nOpen CampusGig: http://localhost:5173/jobs/${job._id}`;
    const htmlPoster = `<p>Hi ${poster.name || ""},</p>
      <p>Your job "<strong>${job.title || "Untitled"}</strong>" has been posted successfully.</p>
      <p><a href="http://localhost:5173/jobs/${job._id}">View job</a></p>`;

    console.log("📧 notifyNewJob -> sending to poster", poster.email);
    await sendEmail(poster.email, subjectPoster, textPoster, htmlPoster);

    // Broadcast to all users
    try {
      const users = await User.find({ email: { $exists: true, $ne: null } }).select("name email");
      const recipients = users.filter(u => u.email && String(u._id) !== String(posterId));
      if (recipients.length === 0) {
        console.log("📧 notifyNewJob -> no other users to notify");
        return;
      }

      const postDate = new Date().toLocaleString();
      const subjectAll = `New job posted: ${job.title || "Untitled"}`;
      const htmlAll = `<p>Hi,</p>
        <p>A new job "<strong>${job.title || "Untitled"}</strong>" was posted on <strong>${postDate}</strong> by <strong>${poster.name || "Someone"}</strong>.</p>
        <p>Job details: <a href="http://localhost:5173/jobs/${job._id}">View job</a></p>
        <p>If you'd like to see similar jobs, open CampusGig.</p>`;
      const textAll = `A new job "${job.title || "Untitled"}" was posted on ${postDate} by ${poster.name || "Someone"}. View: http://localhost:5173/jobs/${job._id}`;

      const sendPromises = recipients.map(r => {
        console.log("📧 notifyNewJob -> queueing broadcast to", r.email);
        return sendEmail(r.email, subjectAll, textAll, htmlAll);
      });

      const results = await Promise.allSettled(sendPromises);
      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.filter(r => r.status === "rejected").length;
      console.log(`📧 notifyNewJob broadcast finished: ${ok} succeeded, ${fail} failed (total ${results.length})`);
    } catch (broadcastErr) {
      console.error("notifyNewJob broadcast error:", broadcastErr);
    }
  } catch (err) {
    console.error("notifyNewJob error:", err);
  }
}

/** Notify job poster when a new bid is placed */
export async function notifyNewBid(bid, job) {
  try {
    const posterId = job.posterId || job.poster || job.postedBy;
    const poster = posterId ? await User.findById(posterId).select("name email") : null;
    const bidderId = bid.userId || bid.student;
    const bidder = bidderId ? await User.findById(bidderId).select("name email") : null;
    if (!poster?.email) return;

    const snippet = (bid.message || bid.bidMessage || "").slice(0, 300);
    const subject = "New bid on your job — CampusGig";
    const text = `${bidder?.name || "Someone"} placed a bid on "${job.title || ""}":\n\n${snippet}\n\nOpen CampusGig: http://localhost:5173/jobs/${job._id}`;
    const html = `<p>Hi ${poster.name || ""},</p>
      <p><strong>${bidder?.name || "Someone"}</strong> placed a bid on your job "<strong>${job.title || ""}</strong>".</p>
      <blockquote>${snippet}</blockquote>
      <p><a href="http://localhost:5173/jobs/${job._id}">View job & bids</a></p>`;

    console.log("📧 notifyNewBid -> sending to", poster.email);
    await sendEmail(poster.email, subject, text, html);
  } catch (err) {
    console.error("notifyNewBid error:", err);
  }
}

/** Notify both parties when a bid is accepted */
export async function notifyJobAccepted(job, acceptedUserId) {
  try {
    const posterId = job.posterId || job.postedBy || job.poster;
    const poster = posterId ? await User.findById(posterId).select("name email") : null;
    const accepted = acceptedUserId ? await User.findById(acceptedUserId).select("name email") : null;

    if (accepted?.email) {
      console.log("📧 notifyJobAccepted -> sending acceptance to", accepted.email);
      await sendEmail(
        accepted.email,
        "Your bid was accepted — CampusGig",
        `Your bid for "${job.title}" was accepted. Open CampusGig: http://localhost:5173/jobs/${job._id}`,
        `<p>Hi ${accepted.name || ""},</p>
         <p>Your bid on "<strong>${job.title || ""}</strong>" was accepted. Please coordinate with the poster to proceed.</p>
         <p><a href="http://localhost:5173/jobs/${job._id}">Open job</a></p>`
      );
    }

    if (poster?.email) {
      console.log("📧 notifyJobAccepted -> confirming to poster", poster.email);
      await sendEmail(
        poster.email,
        "You accepted a bid — CampusGig",
        `You accepted a bid on "${job.title}". The selected user has been notified.`,
        `<p>Hi ${poster.name || ""},</p><p>You accepted a bid on "<strong>${job.title || ""}</strong>". The selected user was notified.</p>`
      );
    }
  } catch (err) {
    console.error("notifyJobAccepted error:", err);
  }
}

/** Notify recipient when chat message arrives */
export async function notifyChatMessage({ senderId, recipientId, jobId, text }) {
  try {
    console.log("🔍 Looking up job:", jobId);

    const [sender, recipient] = await Promise.all([
      senderId ? User.findById(senderId).select("name email") : null,
      recipientId ? User.findById(recipientId).select("name email") : null
    ]);

    if (!recipient?.email || sender?.email === recipient.email) return;

    let finalJob = null;
    try {
      if (jobId) finalJob = await JobModel.findById(jobId).select("title description");
    } catch {}

    const snippet = (text || "").slice(0, 200);
    const jobTitle = finalJob?.title || "a job";
    const timeStr = new Date().toLocaleString();
    const subject = `${sender?.name || "Someone"} sent you a message about "${jobTitle}" — CampusGig`;
    const mailText = `${sender?.name || "Someone"} sent you a message about "${jobTitle}" on ${timeStr}:\n\n"${snippet}"\n\nOpen CampusGig to reply: http://localhost:5173/chat/${jobId}`;
    const mailHtml = `<p>Hi ${recipient.name || ""},</p>
      <p><strong>${sender?.name || "Someone"}</strong> sent you a message about job "<strong>${jobTitle}</strong>" on <strong>${timeStr}</strong>:</p>
      <blockquote>${snippet}</blockquote>
      <p><a href="http://localhost:5173/chat/${jobId}">Open conversation</a></p>`;

    await sendEmail(recipient.email, subject, mailText, mailHtml);
  } catch (err) {
    console.error("Error sending chat notification:", err);
  }
}

/**
 * Notify when an AssignedJob is marked completed
 */
export async function notifyJobCompleted(assignedJob) {
  const results = [];
  try {
    const jobId = assignedJob.job?._id || assignedJob.job || assignedJob.jobId;
    let job = assignedJob.job && assignedJob.job.title ? assignedJob.job : null;
    let student = assignedJob.student && assignedJob.student.email ? assignedJob.student : null;

    if (!job && jobId) {
      job = await JobModel.findById(jobId).select("title postedBy").lean();
    }

    if (!student && assignedJob.student) {
      student = await User.findById(assignedJob.student).select("name email").lean();
    }

    let poster = null;
    if (job?.postedBy) {
      poster = await User.findById(job.postedBy).select("name email").lean();
    }

    const jobTitle = job?.title || assignedJob.jobTitle || "Untitled Job";
    const toJobUrl = jobId ? `http://localhost:5173/jobs/${jobId}` : "http://localhost:5173/jobs";

    if (student?.email) {
      try {
        await sendEmail(
          student.email,
          `Job "${jobTitle}" marked as completed — CampusGig`,
          `Hi ${student.name || ""},\n\nThe job "${jobTitle}" has been marked as completed. Thank you for your work!\n\nView details: ${toJobUrl}`,
          `<p>Hi ${student.name || ""},</p><p>The job "<strong>${jobTitle}</strong>" has been marked as <strong>completed</strong>.</p><p><a href="${toJobUrl}">View Job Details</a></p>`
        );
        results.push({ to: student.email, ok: true });
      } catch (err) {
        results.push({ to: student.email, ok: false, error: err.message || String(err) });
      }
    }

    if (poster?.email) {
      try {
        await sendEmail(
          poster.email,
          `Action Required: Rate completed job "${jobTitle}" — CampusGig`,
          `Hi ${poster.name || ""},\n\nThe job "${jobTitle}" has been marked as completed by ${student?.name || "the student"}.\n\nPlease review their work and provide a rating.\n\nRate now: ${toJobUrl}`,
          `<p>Hi ${poster.name || ""},</p><p>The job "<strong>${jobTitle}</strong>" has been marked as <strong>completed</strong> by ${student?.name || "the student"}.</p><p><a href="${toJobUrl}">Rate Now</a></p>`
        );
        results.push({ to: poster.email, ok: true });
      } catch (err) {
        results.push({ to: poster.email, ok: false, error: err.message || String(err) });
      }
    }

    return { success: results.length > 0 && results.every(r => r.ok), results };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Notify when a job is rated
 */
export async function notifyJobRated(assignedJob) {
  try {
    const jobId = assignedJob.job || assignedJob.jobId;
    console.log("📨 Processing rating notification for job:", jobId);

    const [job, student] = await Promise.all([
      jobId ? JobModel.findById(jobId).select("title postedBy").lean() : null,
      (assignedJob.student && assignedJob.student.email)
        ? Promise.resolve(assignedJob.student)
        : assignedJob.student
        ? User.findById(assignedJob.student).select("name email rating").lean()
        : null
    ]);

    const poster = job?.postedBy ? await User.findById(job.postedBy).select("name email").lean() : null;
    const jobTitle = job?.title || assignedJob.jobTitle || "Untitled Job";
    const rating = assignedJob.rating ?? "N/A";
    const review = assignedJob.review ?? "";

    const notifications = [];

    if (student?.email) {
      console.log("📧 Sending rating notification to student:", student.email);
      notifications.push(
        sendEmail(
          student.email,
          `You received a rating for "${jobTitle}" — CampusGig`,
          `Hi ${student.name || ""},\n\nYou received a rating of ${rating} for "${jobTitle}".\n\nReview: ${
            review || "No review provided"
          }\n\nYour updated overall rating: ${student.rating ?? "N/A"}\n\nView details: http://localhost:5173/jobs/${jobId}`,
          `<p>Hi ${student.name || ""},</p>
           <p>You received a rating of <strong>${rating}</strong> for "<strong>${jobTitle}</strong>".</p>
           ${review ? `<p>Review:<blockquote>${review}</blockquote></p>` : "<p>No review provided.</p>"}
           <p>Your updated overall rating: <strong>${student.rating ?? "N/A"}</strong></p>
           <p><a href="http://localhost:5173/jobs/${jobId}">View Job Details</a></p>`
        )
      );
    }

    if (poster?.email) {
      console.log("📧 Sending rating confirmation to poster:", poster.email);
      notifications.push(
        sendEmail(
          poster.email,
          `Rating submitted for "${jobTitle}" — CampusGig`,
          `Hi ${poster.name || ""},\n\nYour rating of ${rating} for "${jobTitle}" has been recorded and sent to ${
            student?.name || "the student"
          }.\n\nThank you for providing feedback!\n\nView job: http://localhost:5173/jobs/${jobId}`,
          `<p>Hi ${poster.name || ""},</p>
           <p>Your rating of <strong>${rating}</strong> for "<strong>${jobTitle}</strong>" has been recorded and sent to ${
             student?.name || "the student"
           }.</p>
           <p>Thank you for providing feedback!</p>
           <p><a href="http://localhost:5173/jobs/${jobId}">View Job Details</a></p>`
        )
      );
    }

    if (notifications.length > 0) {
      await Promise.all(notifications).catch(err => {
        console.error("❌ Error sending rating notifications:", err);
        throw err;
      });
    }
  } catch (err) {
    console.error("❌ notifyJobRated error:", err);
    throw err;
  }
}

/**
 * Send notification to a user (email + SMS)
 */
export async function sendNotification(userEmail, userPhone, type, data) {
  try {
    if (!userEmail && !userPhone) {
      console.log("⚠ Notification skipped: No email or phone provided");
      return;
    }

    if (userEmail && !/^\S+@\S+\.\S+$/.test(userEmail)) {
      console.warn(`⚠ Invalid email skipped: ${userEmail}`);
      userEmail = null;
    }

    if (userPhone && !/^\d{10}$/.test(userPhone)) {
      console.warn(`⚠ Invalid phone skipped: ${userPhone}`);
      userPhone = null;
    }

    if (!userEmail && !userPhone) return;

    const templateFactory = notificationTemplates[type];
    if (!templateFactory) {
      console.error("❌ Invalid notification type:", type);
      return;
    }

    const template = templateFactory(
      data?.jobTitle,
      data?.userName,
      data?.bidAmount || data?.studentName
    );

    if (userEmail) {
      console.log(`📧 sendNotification -> sending email to ${userEmail}`);
      await sendEmail(userEmail, template.subject, template.text || template.html, template.html);
    }

    if (userPhone && typeof sendSMS === "function") {
      console.log(`📱 sendNotification -> sending SMS to ${userPhone}`);
      try {
        await sendSMS(userPhone, template.sms);
      } catch (smsErr) {
        console.error("SMS send error:", smsErr);
      }
    }

    console.log(`✅ Notification processed for ${userEmail || userPhone}`);
  } catch (error) {
    console.error("❌ Notification error:", error);
  }
}
