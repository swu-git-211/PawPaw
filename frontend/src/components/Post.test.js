import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Post from './Post';  // Import the Post component
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the shareContent utility
jest.mock('./shareUtil', () => ({
  shareContent: jest.fn(),
}));

// Mock axios for API calls
jest.mock('axios');

describe('Post Component', () => {
  const post = {
    _id: '1',
    content: 'This is a test post!',
    likes: [],
  };

  const mockUserId = 'user123';
  const mockToken = 'mock-token';

  beforeEach(() => {
    // Mock localStorage
    localStorage.setItem('userId', mockUserId);
    localStorage.setItem('token', mockToken);

    // Mock axios response for comments
    axios.get.mockResolvedValue({
      data: {
        comments: [{ _id: '1', content: 'This is a comment', userId: { username: 'Test User' }, createdAt: '2023-12-01' }],
      },
    });

    axios.post.mockResolvedValue({
      data: { success: true, likes: [mockUserId] },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders post and comment section correctly', async () => {
    render(
      <Router>
        <Post post={post} />
      </Router>
    );

    // Check if post content is rendered
    expect(screen.getByText(/This is a test post!/)).toBeInTheDocument();

    // Wait for comments to be fetched and rendered
    await waitFor(() => screen.getByText(/This is a comment/));
    expect(screen.getByText(/This is a comment/)).toBeInTheDocument();
  });

  test('likes the post', async () => {
    render(
      <Router>
        <Post post={post} />
      </Router>
    );

    // Check if the like button is rendered (assuming it's implemented as a button or icon)
    const likeButton = screen.getByRole('button', { name: /like/i });
    expect(likeButton).toBeInTheDocument();

    // Simulate a like action
    fireEvent.click(likeButton);

    // Wait for the axios post to be called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `http://localhost:5000/pawpaw/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    // Verify the like count was updated
    expect(screen.getByText(/1 like/)).toBeInTheDocument(); // assuming the post's like count is displayed as text
  });

  test('submits a comment', async () => {
    render(
      <Router>
        <Post post={post} />
      </Router>
    );

    // Wait for the comment input field to be rendered
    const commentInput = screen.getByRole('textbox');
    expect(commentInput).toBeInTheDocument();

    // Simulate typing and submitting a comment
    fireEvent.change(commentInput, { target: { value: 'This is a new comment!' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Mocking API response for a new comment
    axios.post.mockResolvedValueOnce({
      data: { success: true, comment: { _id: '2', content: 'This is a new comment!', userId: { username: 'Test User' }, createdAt: '2023-12-01' } },
    });

    await waitFor(() => {
      expect(screen.getByText('This is a new comment!')).toBeInTheDocument();
    });
  });

  test('handles comment submission failure', async () => {
    render(
      <Router>
        <Post post={post} />
      </Router>
    );

    // Simulate typing and submitting a comment
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'This is a new comment!' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Mock a failed comment submission
    axios.post.mockRejectedValueOnce(new Error('Failed to submit comment'));

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit comment/i)).toBeInTheDocument();
    });
  });

  test('handles like post failure', async () => {
    render(
      <Router>
        <Post post={post} />
      </Router>
    );

    // Mock failure for liking a post
    axios.post.mockRejectedValueOnce(new Error('Failed to like the post'));

    const likeButton = screen.getByRole('button', { name: /like/i });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to like the post/i)).toBeInTheDocument();
    });
  });

  test('shares the post', async () => {
    render(
      <Router>
        <Post post={post} />
      </Router>
    );

    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(require('./shareUtil').shareContent).toHaveBeenCalled();
    });
  });
});
