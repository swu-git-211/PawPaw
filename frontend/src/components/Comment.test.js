import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Comment from './Comment';
import axios from 'axios';
import '@testing-library/jest-dom';
import { shareContent } from './shareUtil';

// Mock axios and localStorage
jest.mock('axios');
jest.mock('./shareUtil', () => ({
  shareContent: jest.fn(),
}));

const mockComments = [
  { _id: '1', content: 'Great post!', userId: { username: 'user1' }, likes: [] },
  { _id: '2', content: 'Nice post!', userId: { username: 'user2' }, likes: [] }
];

describe('Comment Component', () => {
  beforeEach(() => {
    // Mock localStorage for user authentication
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('userId', 'mock-user-id');
  });

  it('should fetch and render comments when the component is loaded', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, comments: mockComments } });

    render(<Comment postId="123" initialComments={mockComments} />);

    expect(await screen.findByText('Great post!')).toBeInTheDocument();
    expect(screen.getByText('Nice post!')).toBeInTheDocument();
  });

  it('should log error if userId is not found in localStorage', () => {
    localStorage.removeItem('userId');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<Comment postId="123" initialComments={mockComments} />);

    expect(consoleSpy).toHaveBeenCalledWith('User ID is not set in localStorage');
  });

  it('should submit a reply when a user writes and submits a reply', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });
    axios.get.mockResolvedValueOnce({ data: { success: true, comments: mockComments } });

    render(<Comment postId="123" initialComments={mockComments} />);

    const replyButton = screen.getByTestId('reply-button-1');
    fireEvent.click(replyButton);

    const replyInput = screen.getByPlaceholderText('Write a reply...');
    fireEvent.change(replyInput, { target: { value: 'Nice reply!' } });

    const submitReplyButton = screen.getByText('Reply');
    fireEvent.click(submitReplyButton);

    await waitFor(() => expect(screen.getByText('Nice reply!')).toBeInTheDocument());
  });

  it('should handle sharing a comment', () => {
    const comment = { _id: '1', content: 'Great post!', userId: { username: 'user1' } };

    render(<Comment postId="123" initialComments={mockComments} />);

    const shareButton = screen.getByTestId('share-button-1');
    fireEvent.click(shareButton);

    expect(shareContent).toHaveBeenCalledWith({
      title: 'Check out this comment by user1',
      text: 'Great post!',
      url: `${window.location.origin}/posts/123#comment-1`
    });
  });

  it('should like a comment when the like button is clicked', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true, likes: ['user1', 'user2'] } });

    render(<Comment postId="123" initialComments={mockComments} />);

    const likeButton = screen.getByTestId('like-button-1');
    fireEvent.click(likeButton);

    await waitFor(() => expect(screen.getByText('2 likes')).toBeInTheDocument());
  });

  it('should toggle the reply input visibility when the reply button is clicked', () => {
    render(<Comment postId="123" initialComments={mockComments} />);

    const replyButton = screen.getByTestId('reply-button-1');
    fireEvent.click(replyButton);

    const replyInput = screen.getByPlaceholderText('Write a reply...');
    expect(replyInput).toBeInTheDocument();

    fireEvent.click(replyButton);
    expect(replyInput).not.toBeInTheDocument();
  });

  it('should handle comment deletion', async () => {
    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    render(<Comment postId="123" initialComments={mockComments} />);

    const deleteButton = screen.getByTestId('delete-button-1');
    fireEvent.click(deleteButton);

    await waitFor(() => expect(screen.queryByText('Great post!')).not.toBeInTheDocument());
  });
});
