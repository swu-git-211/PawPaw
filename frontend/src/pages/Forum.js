import React, { useState, useEffect } from 'react';
import { Box, Fab, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post';
import axios from 'axios';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [openCreatePost, setOpenCreatePost] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/pawpaw/all`);
        if (response.data.success) {
          // เรียงโพสต์จากล่าสุดไปเก่าสุด
          const sortedPosts = response.data.posts.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setPosts(sortedPosts); // ตั้งค่าโพสต์ที่เรียงแล้ว
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };

    fetchPosts();
  }, []);

  // Function for adding a new post
  // เพิ่มโพสต์ใหม่และตั้งไว้ด้านบน
  const handleAddPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]); // ใส่โพสต์ใหม่ที่ด้านบน
    setOpenCreatePost(false); // ปิด popup
  };

  return (
    <Box sx={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
  
    {/* CreatePost Component at the top with wider width */}
    <Box sx={{ width: '100%', maxWidth: '900px', mb: 2 }}> {/* Adjust width here */}
      <CreatePost onAddPost={handleAddPost} />
    </Box>

    {/* Posts Section */}
    <Box sx={{ width: '100%', maxWidth: '800px' }}>
      {posts.map((post, index) => (
        <Post key={post._id || index} post={post} />
      ))}
    </Box>

    {/* FAB Button for CreatePost */}
    <Fab
      color="primary"
      aria-label="add"
      onClick={() => setOpenCreatePost(true)} // Open CreatePost dialog when clicked
      sx={{ position: 'fixed', bottom: 20, right: 20 }}
    >
      <AddIcon />
    </Fab>

    {/* CreatePost Dialog */}
    <Dialog open={openCreatePost} onClose={() => setOpenCreatePost(false)}>
      <DialogTitle>Create a New Post</DialogTitle>
      <DialogContent>
        <CreatePost onAddPost={handleAddPost} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenCreatePost(false)} color="primary">Cancel</Button>
      </DialogActions>
    </Dialog>
  </Box>
  );
};

export default Forum;
