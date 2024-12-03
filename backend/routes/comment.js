// routes/comment.js
const express = require('express');
const router = express.Router();
const comment = require('../controllers/comment');
const auth = require('../middleware/auth');

// สร้างคอมเมนต์ใหม่ให้กับโพสต์
router.post('/posts/:postId/comment', auth, comment.createComment);
// ดึงคอมเมนต์ทั้งหมดของโพสต์
router.get('/posts/:postId/comments', comment.getCommentsByPost);
// likeคอมเมนต์
router.post('/comments/:commentId/like', auth, comment.likeComment);
// ลบคอมเมนต์
router.delete('/comment/:commentId', auth, comment.deleteComment);




module.exports = router;
