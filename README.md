# PawPaw: Community Pet Forum

## About the Project

**PawPaw** is a community platform designed for pet lovers to connect, share, and engage with each other. Whether you're a dog lover, cat enthusiast, or simply enjoy cute pet photos, PawPaw offers a space for you to share posts, discuss ideas, and build connections with other pet owners.

---

## Features

### Homepage
- Displays general news and blogs about pets.
- Allows users to explore and navigate to blog posts or other sections of the site.

### Forum
- Allows users to view posts without logging in.
- Registered users can:
  - Create posts with images and text.
  - Like and comment on posts.

### Profile Page
- Displays user information and all posts created by the user.
- Allows users to edit their profile, including updating their bio, profile picture, and pet information.

### Authentication
- Users can register or log in to access profile features and interact fully in the forum.

---

## Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Hosting**: AWS EC2 with Nginx

---

## Deployment Details

The platform is deployed on **AWS EC2**, using:
- **Nginx** as a reverse proxy server to handle static files and API requests.
- **Static uploads** for profile pictures and post images hosted on the same server.

---

## How to Run Locally

### Prerequisites
1. Node.js and npm installed on your machine.
2. MongoDB Atlas account (or local MongoDB instance).
3. Clone the repository:
   ```bash
   git clone https://github.com/swu-git-211/pawpaw.git

### Backend Setup
1. Navigate to the backend folder:
    ```bash
   cd pawpaw/backend
2. Install dependencies:
    ```bash
    npm install
3. Create a .env file with the following variables:
    ```bash
    PORT=5000
    MONGO_URI=<Your MongoDB Atlas URI>
    JWT_SECRET=<Your JWT Secret>
4. Start the backend server:
    ```bash
    npm start

### Frontend Setup
1. Navigate to the frontend folder:
    ```bash
    cd pawpaw/frontend
2. Install dependencies:
    ```bash
    npm install
3. Create a .env file with the following variable:
    ```bash
    REACT_APP_API_URL=http://localhost:5000
4. Start the React application:
    ```bash
    npm start

### How to Use
1. **Homepage:** Browse through blogs and navigate to interesting content.
2. **Forum:**
- View posts without logging in.
- Log in to like, comment, or create new posts.
3. **Profile:**
- View your profile details and posts.
- Edit your profile information, including profile picture and bio.

### Future Enhancements
- Add notifications for post interactions.
- Support for multiple languages.
- Implement advanced search and filtering in the forum.


Feel free to clone, explore, and contribute to the PawPaw project!

