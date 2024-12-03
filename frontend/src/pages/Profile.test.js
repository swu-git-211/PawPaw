// Profile.test.js
import { render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

describe('Profile Component', () => {
  const mockProfileData = {
    phone: '1234567890',
    birthday: '1990-01-01',
    bio: 'Pet lover',
    petTypes: ['Cat', 'Dog'],
    showEmail: true,
    profileImage: '/images/user1.jpg',
  };

  const mockPosts = [
    {
      _id: '1',
      content: 'My first post',
      images: [{ url: '/images/post1.jpg' }],
    },
    {
      _id: '2',
      content: 'Another post',
      images: [{ url: '/images/post2.jpg' }],
    },
  ];

  it('should display loading initially', () => {
    render(<Profile />);

    // Check for some loading indicator, for example, "loading..." text
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display profile data once loaded', async () => {
    // Mock the axios response for profile and posts
    axios.get.mockResolvedValueOnce({
      data: { data: mockProfileData },
    });

    axios.get.mockResolvedValueOnce({
      data: { posts: mockPosts },
    });

    render(<Profile />);

    // Wait for the profile data to be fetched and displayed
    await waitFor(() => screen.getByText('Phone:'));

    // Check if the profile fields are correctly rendered
    expect(screen.getByText(`Phone: ${mockProfileData.phone}`)).toBeInTheDocument();
    expect(screen.getByText(`Birthday: ${mockProfileData.birthday}`)).toBeInTheDocument();
    expect(screen.getByText(`Bio: ${mockProfileData.bio}`)).toBeInTheDocument();
    expect(screen.getByText(`Pets: ${mockProfileData.petTypes.join(', ')}`)).toBeInTheDocument();
    expect(screen.getByText(`Show Email: Yes`)).toBeInTheDocument();

    // Check if the profile image is rendered
    expect(screen.getByAltText('Profile')).toHaveAttribute('src', `http://localhost:5000${mockProfileData.profileImage}`);
  });

  it('should display user posts if available', async () => {
    // Mock the axios response for profile and posts
    axios.get.mockResolvedValueOnce({
      data: { data: mockProfileData },
    });

    axios.get.mockResolvedValueOnce({
      data: { posts: mockPosts },
    });

    render(<Profile />);

    // Wait for the posts to load and be displayed
    await waitFor(() => screen.getByText('Posts'));

    // Check if the posts are rendered correctly
    expect(screen.getByText('My first post')).toBeInTheDocument();
    expect(screen.getByText('Another post')).toBeInTheDocument();

    // Check if the images are rendered correctly for the posts
    expect(screen.getAllByAltText(/Post/).length).toBe(2);
  });

  it('should display a message when no posts are available', async () => {
    // Mock the axios response for profile data only
    axios.get.mockResolvedValueOnce({
      data: { data: mockProfileData },
    });

    // Mock empty posts response
    axios.get.mockResolvedValueOnce({
      data: { posts: [] },
    });

    render(<Profile />);

    // Wait for the posts section to render
    await waitFor(() => screen.getByText('Posts'));

    // Check if the correct message is displayed when there are no posts
    expect(screen.getByText('No posts available. Try posting something about your pet!')).toBeInTheDocument();
  });

  it('should handle error when fetching profile data fails', async () => {
    // Mock axios to return an error for the profile fetch
    axios.get.mockRejectedValueOnce(new Error('Error fetching profile data'));

    render(<Profile />);

    // Wait for the error to be handled and check if an error message appears
    await waitFor(() => screen.getByText('Error fetching profile data'));

    // Check for error message or fallback UI
    expect(screen.getByText('Error fetching profile data')).toBeInTheDocument();
  });

  it('should handle error when fetching posts fails', async () => {
    // Mock axios to return an error for the posts fetch
    axios.get.mockResolvedValueOnce({
      data: { data: mockProfileData },
    });
    axios.get.mockRejectedValueOnce(new Error('Error fetching user posts'));

    render(<Profile />);

    // Wait for the posts section to load
    await waitFor(() => screen.getByText('Posts'));

    // Check if the error message appears for posts
    expect(screen.getByText('Error fetching user posts')).toBeInTheDocument();
  });
});
