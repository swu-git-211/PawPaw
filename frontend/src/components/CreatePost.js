import React, { useState } from 'react';
import { Card, CardContent, CardActions, Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ImageUploading from 'react-images-uploading';
import axios from 'axios';

const CreatePost = ({ onAddPost }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleImageChange = (imageList) => {
    setImages(imageList); // เก็บรูปที่เลือก
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to create a post');
      navigate('/login');

      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (images.length > 0) {
        formData.append('image', images[0].file); // ส่งไฟล์แรกในอาร์เรย์
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/create`, 
        formData, 
        { 
          headers: { 
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${token}` 
          }
        }
      );

      if (response.data.success) {
        const newPost = response.data.post;
        onAddPost(newPost); // อัปเดต post ใหม่
        setContent('');
        setImages([]);
      }
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };
  
  return (
    <Card sx={{ maxWidth: 600, margin: '20px auto' }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Create a Post
        </Typography>
        <TextField
          label="What's on your mind?"
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          sx={{ marginBottom: '16px' }}
        />
        
        {/* ใช้ react-images-uploading สำหรับอัปโหลดรูป */}
        <ImageUploading
          value={images}
          onChange={handleImageChange}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({ imageList, onImageUpload }) => (
            <>
              <Button variant="outlined" onClick={onImageUpload}>
                Upload Image
              </Button>
              {imageList.length > 0 && (
                <img src={imageList[0].data_url} alt="Uploaded" width="100" />
              )}
            </>
          )}
        </ImageUploading>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleSubmit}
        >
          Post
        </Button>
      </CardActions>
    </Card>
  );
};

export default CreatePost;
