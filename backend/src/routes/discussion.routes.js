import express from "express";
import DiscussionPost from "../models/DiscussionPost.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * ------------------- GET All Discussions -------------------
 * Query params:
 *   page, limit, search, tag, sortBy
 * sortBy options: recent, views, comments
 */
router.get("/", auth, async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", tag = "", sortBy = "recent" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (tag) filter.tags = tag;

    // Sorting logic
    let sort = { createdAt: -1 }; // default: recent
    if (sortBy === "views") sort = { views: -1 };
    if (sortBy === "comments") sort = { "commentsCount": -1 };

    // Aggregate to compute commentsCount for sorting by comments
    const discussions = await DiscussionPost.aggregate([
      { $match: filter },
      {
        $addFields: {
          commentsCount: { $size: { $ifNull: ["$comments", []] } }
        }
      },
      { $sort: sort },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    // Populate author and comments.user
    await DiscussionPost.populate(discussions, [
      { path: "author", select: "name email" },
      { path: "comments.user", select: "name email" }
    ]);

    const total = await DiscussionPost.countDocuments(filter);

    res.json({
      discussions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    });

  } catch (err) {
    console.error("Error fetching discussions:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- CREATE New Discussion -------------------
 */
router.post("/", auth, async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content are required" });

    const newPost = await DiscussionPost.create({
      title,
      content,
      tags,
      author: req.user._id,
    });

    await newPost.populate("author", "name email");

    res.status(201).json(newPost);

  } catch (err) {
    console.error("Error creating discussion:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- GET Single Discussion -------------------
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await DiscussionPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .lean();

    if (!post) return res.status(404).json({ message: "Discussion not found" });

    res.json(post);

  } catch (err) {
    console.error("Error fetching discussion:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ------------------- ADD Comment / Reply -------------------
 */
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required" });

    const post = await DiscussionPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Discussion not found" });

    const newComment = { user: req.user._id, text };
    post.comments.push(newComment);
    await post.save();

    const addedComment = post.comments[post.comments.length - 1];
    await DiscussionPost.populate(addedComment, { path: "user", select: "name email" });

    res.status(201).json({ message: "Comment added", comment: addedComment });

  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
