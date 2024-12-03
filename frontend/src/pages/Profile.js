import React, { useState, useEffect } from 'react';
import { Box, Fab, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import CreatePost from '../components/CreatePost';
import Post from '../components/Post'; // นำ component Post มาใช้เพื่อแสดงโพสต์ในหน้าโปรไฟล์
import EditProfile from '../components/EditProfile'; // นำ EditProfile มาใช้เพื่อแก้ไขข้อมูลโปรไฟล์

const Profile = () => {
  const [user, setUser] = useState({
    _id: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
  });
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [openCreatePost, setOpenCreatePost] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // สถานะเพื่อบอกว่าอยู่ในโหมดแก้ไขหรือไม่

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      alert('You are not logged in. Please log in first.');
      navigate('/login');
      return;
    }

    // ดึงข้อมูลโปรไฟล์ผู้ใช้
    axios
      .get('http://localhost:5000/pawpaw/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        setUser(response.data); // กำหนดข้อมูลที่ได้รับจาก API มาให้กับ state user
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        alert('Failed to load user profile. Please try again.');
        navigate('/login');
      });

    // ดึงโพสต์ของผู้ใช้
    axios
      .get(`http://localhost:5000/pawpaw/posts/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log('Posts Response:', response.data.posts); // Log the response to verify structure
        setPosts(response.data.posts); // ดึง posts จาก response.data.posts
      })
      .catch((error) => {
        console.error('Error fetching user posts:', error);
      });
  }, [navigate]);

  // Function for adding a new post
  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
    setOpenCreatePost(false); // Close the CreatePost popup after adding
  };

  // ฟังก์ชันสำหรับเปิด/ปิดโหมดแก้ไข
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // ฟังก์ชันสำหรับบันทึกการแก้ไขโปรไฟล์
  const handleSave = (updatedUser) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  // ตรวจสอบข้อมูลผู้ใช้และโพสต์
  if (!user) {
    return null; // ไม่แสดงอะไรถ้ายังไม่มีข้อมูลผู้ใช้หรือยังไม่ได้ล็อกอิน
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        {!isEditing ? (
          <>
            <div style={styles.profileHeader}>
            <img
              src={user.profileImage || '/default-profile.jpg'}
              alt="Profile"
              style={styles.profileImage}
            />
              <h2>{user.username}</h2>
            </div>
            <div style={styles.aboutSection}>
              <h3>About Me</h3>
              {user.showEmail && <p><strong>Email:</strong> {user.email}</p>}
              <p><strong>Phone:</strong> {user.phone}</p>
              <p><strong>Bio:</strong> {user.bio}</p>
              <p><strong>Birthday:</strong> {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'Not provided'}</p>
              <p><strong>Pet Types:</strong> {user.petTypes ? user.petTypes.join(', ') : 'No pets added'}</p>
            </div>
            <button style={styles.editButton} onClick={toggleEditMode}>
              Edit Profile
            </button>
          </>
        ) : (
          // ถ้าอยู่ในโหมดแก้ไข ให้แสดง EditProfile component
          <EditProfile user={user} onSave={handleSave} onCancel={toggleEditMode} />
        )}
      </div>

      <div style={styles.posts}>
        <div style={styles.postsHeader}>
          <h3 style={styles.postsTitle}>Posts</h3>
        </div>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <Post key={post._id} post={post} /> // ใช้ Component Post ในการแสดงโพสต์
          ))
        ) : (
          <p>No posts available. Try posting something about your pet!</p>
        )}
      </div>

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
      
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: '#FFFFF',
    minHeight: '100vh',
    color: '#0F6EDE',
    fontFamily: "'Roboto', sans-serif",
  },
  profileHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  profileImage: {
    borderRadius: '50%',
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    border: '4px solid #3CCCCD',
  },
  aboutSection: {
    marginTop: '20px',
    backgroundColor: '#F2E96E',
    borderRadius: '8px',
    padding: '15px',
    color: '#0F6EDE',
  },
  editButton: {
    marginTop: '20px',
    backgroundColor: '#3CCCCD',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  editButtonHover: {
    backgroundColor: '#0F6EDE',
  },
  posts: {
    width: '65%',
    paddingLeft: '20px',
  },
  postsHeader: {
    width: '100%', // ทำให้แถบสีครอบคลุมความกว้างของส่วนโพสต์
    backgroundColor: '#BB7CDB', // สีพื้นหลัง
    padding: '10px 0', // เพิ่มพื้นที่ด้านบนและล่าง
    textAlign: 'center', // จัดคำว่า Posts ให้อยู่ตรงกลาง
    borderRadius: '8px', // ขอบมน
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // เพิ่มเงา
    marginBottom: '20px', // เพิ่มระยะห่างจากโพสต์ด้านล่าง
  },
  postsTitle: {
    margin: 0, // ลบระยะขอบของ h3
    color: '#FFFFFF', // สีตัวอักษร
    fontFamily: "'Roboto', sans-serif", // ฟอนต์
    fontSize: '24px', // ขนาดตัวอักษร
    fontWeight: 'bold', // ตัวหนา
  },
  fab: {
    backgroundColor: '#0F6EDE',
    color: '#fff',
  },
};

export default Profile;
