import React, { useState, useEffect, memo } from 'react';
import { TextField, Button, Typography, IconButton, Box } from '@mui/material';
import ReviewsIcon from '@mui/icons-material/Reviews';
import IosShareIcon from '@mui/icons-material/IosShare';
import LikeButton from './LikeButton';
import { shareContent } from './shareUtil';
import DeleteButton from './DeleteButton';
import axios from 'axios';

const Comment = ({ postId, initialComments }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplyFields, setShowReplyFields] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://3.214.235.164/pawpaw/posts/${postId}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  // Fetch comments when component mounts
  useEffect(() => {
    if (!initialComments) {
      fetchComments();
    }

    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
      console.log("Loaded User ID in Comment:", userId);
    } else {
      console.error("User ID is not set in localStorage");
    }
    // eslint-disable-next-line
  }, [initialComments]);

  // Handle submitting a reply to a comment
  const handleReplySubmit = async (commentId) => {
    const replyContent = replyInputs[commentId];
    if (replyContent && replyContent.trim() !== '') {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please log in to reply.');
          return;
        }

        // Sending reply to the backend
        const response = await axios.post(
          `http://3.214.235.164/pawpaw/posts/${postId}/comment`,
          {
            content: replyContent,
            parentCommentId: commentId, // Specify parentCommentId to indicate it's a reply
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          // Fetch comments again to get the updated list
          await fetchComments();

          // Clear the reply input field
          setReplyInputs((prevState) => ({
            ...prevState,
            [commentId]: '', // Clear reply input field
          }));
        }
      } catch (error) {
        console.error('Failed to create reply:', error);
      }
    }
  };

  const handleShareComment = (comment) => {
    shareContent({
      title: `Check out this comment by ${comment.userId?.username}`,
      text: comment.content,
      url: `${window.location.origin}/posts/${postId}#comment-${comment._id}`,
    });
  };

  // Handle like or unlike a comment
  const handleLikeComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to like this comment.');
      return false;
    }
    try {
      const response = await axios.post(
        `http://3.214.235.164/pawpaw/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        console.log("comment.likes:", comments.likes);
        console.log("Current User ID:", currentUserId);

        // Update likes in frontend
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId ? { ...comment, likes: response.data.likes } : comment
          )
        );
        fetchComments();
        return true;
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
    return false;
  };

  // Toggle reply input field visibility
  const toggleReplyField = (commentId) => {
    setShowReplyFields((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to delete the comment.');
        return;
      }
  
      const response = await axios.delete(`http://3.214.235.164/pawpaw/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.success) {
        alert('Comment deleted successfully.');
        // ทำการลบคอมเมนต์จาก UI (เช่น รีเฟรชหน้า หรือแสดงผลการลบ)
      } else {
        alert('Failed to delete comment.');
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert('Failed to delete comment');
    }
  };
  

  // Memoized comment card component
  const CommentCard = memo(({ comment }) => {
    return (
      <div
        style={{
          marginTop: '1rem',
          padding: '10px',
          border: '1px solid #e0e0e0',
          borderRadius: '5px',
          position: 'relative', // Add position relative to the container for better layout
        }}
      >
        {/* Delete button at top-right corner */}
        {currentUserId && comment.userId && currentUserId.toString() === comment.userId._id?.toString() && (
          <Box sx={{ position: 'absolute', top: '8px', right: '8px', zIndex: 100 }}>

            <DeleteButton onDelete={() => handleDeleteComment(comment._id)} />
              
          </Box>
        )}

        {/* Username, Date, and Time */}
        <Typography variant="subtitle2" color="textSecondary">
          {comment.userId?.username ? comment.userId.username : 'Unknown'} •{' '}
          {new Date(comment.createdAt).toLocaleDateString()} •{' '}
          {new Date(comment.createdAt).toLocaleTimeString()}
        </Typography>

        {/* Content */}
        <Typography variant="body1" sx={{ marginBottom: '0.5rem' }}>
          {comment.content}
        </Typography>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LikeButton
            likedByUser={currentUserId ? comment.likes.includes(currentUserId) : false}
            onLike={() => handleLikeComment(comment._id)}
            likeCount={comment.likes.length}
          />
          <IconButton
            aria-label="reply"
            onClick={() => toggleReplyField(comment._id)}
            style={{ marginLeft: '0.5rem' }}
          >
            <ReviewsIcon />
          </IconButton>
          <IconButton aria-label="share" onClick={() => handleShareComment(comment)}>
            <IosShareIcon />
          </IconButton>
        </div>

        {/* Reply input field */}
        {showReplyFields[comment._id] && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '1rem',
              marginTop: '1rem',
            }}
          >
            <TextField
              label="Write a reply..."
              variant="outlined"
              value={replyInputs[comment._id] || ''}
              onChange={(e) =>
                setReplyInputs((prevState) => ({
                  ...prevState,
                  [comment._id]: e.target.value,
                }))
              }
              size="small"
              sx={{ flexGrow: 1, marginRight: '0.5rem' }}
              autoFocus
            />
            <Button variant="contained" color="primary" onClick={() => handleReplySubmit(comment._id)}>
              Reply
            </Button>
          </div>
        )}

        {/* Display replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginLeft: '2rem', marginTop: '1rem' }}>
            {comment.replies.map((reply) => (
              <CommentCard key={reply._id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <div>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <React.Fragment key={comment._id}>
            <CommentCard comment={comment} />
          </React.Fragment>
        ))
      ) : (
        <Typography variant="body1" sx={{ marginTop: '1rem' }}>
          No comments available.
        </Typography>
      )}
    </div>
  );
};

export default Comment;
