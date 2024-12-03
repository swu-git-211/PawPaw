// controllers/comment.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// ฟังก์ชันสร้างคอมเมนต์
// In comment.js (controller)
exports.createComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const userId = req.user.userId;
    console.log('username', req.user.username)
    console.log('User ID:', req.user.userId,);
    // Check if user information is available
    if (!req.user || !req.user.userId || !req.user.username) {
      return res.status(400).json({ success: false, message: 'User information is missing' });
    }

    const newComment = new Comment({
      content,
      postId: req.params.postId,
      userId,
      parentCommentId: parentCommentId || null, // Set to null if not provided (i.e., a top-level comment)
    });

    const savedComment = await newComment.save();
    res.status(201).json({ success: true, comment: savedComment });
  } catch (error) {
    console.error('Failed to create comment:', error);
    res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
};

exports.getCommentsByPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // ดึงข้อมูล Comment และ populate userId เพื่อให้ได้ username
    const comments = await Comment.find({ postId, parentCommentId: null })
      .populate('userId', 'username') // Populate userId with only the username field
      .lean();

    // ใช้ recursive function ในการดึงข้อมูล replies
    const fetchReplies = async (comment) => {
      const replies = await Comment.find({ parentCommentId: comment._id })
        .populate('userId', 'username')
        .lean();

      for (let reply of replies) {
        reply.replies = await fetchReplies(reply);
      }

      return replies;
    };

    for (let comment of comments) {
      comment.replies = await fetchReplies(comment);
    }

    res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error('Failed to get comments:', error);
    res.status(500).json({ success: false, message: 'Failed to get comments' });
  }
};

// Like or unlike a comment
exports.likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    if (!commentId) {
      return res.status(400).json({ success: false, message: 'Comment ID is required' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    let action;
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId); // Unlike
      action = 'Unlike';
    } else {
      comment.likes.push(userId); // Like
      action = 'Like';
    }

    console.log("Updated likes in backend:", comment.likes);

    await comment.save();
    res.status(200).json({ success: true, action, likes: comment.likes, likeCount: comment.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to like comment', error });
  }
};

//ลบคอมเมนต์
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params; // ดึง commentId จาก URL
    const comment = await Comment.findById(commentId); // ค้นหาคอมเมนต์จากฐานข้อมูล

    // ตรวจสอบว่าคอมเมนต์นี้มีอยู่ในฐานข้อมูลหรือไม่
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // ตรวจสอบว่า userId ของคอมเมนต์ตรงกับ userId ของผู้ที่กำลังล็อกอินหรือไม่
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this comment' });
    }

    // ใช้ findByIdAndDelete หรือ deleteOne เพื่อทำการลบคอมเมนต์
    await Comment.findByIdAndDelete(commentId); // หรือใช้ comment.deleteOne()

    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment', error });
  }
};
