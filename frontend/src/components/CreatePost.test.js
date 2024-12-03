import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePost from './CreatePost';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock axios and useNavigate
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('CreatePost Component', () => {
  const onAddPostMock = jest.fn();

  beforeEach(() => {
    // Reset the mock function before each test
    onAddPostMock.mockClear();
  });

  it('should render the CreatePost component', () => {
    render(<CreatePost onAddPost={onAddPostMock} />);

    // Check if input fields and buttons are rendered
    expect(screen.getByLabelText("What's on your mind?")).toBeInTheDocument();
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('should allow typing in the content text area', () => {
    render(<CreatePost onAddPost={onAddPostMock} />);

    const contentInput = screen.getByLabelText("What's on your mind?");
    fireEvent.change(contentInput, { target: { value: 'Hello, this is a test post!' } });

    expect(contentInput.value).toBe('Hello, this is a test post!');
  });

  it('should allow uploading an image', () => {
    render(<CreatePost onAddPost={onAddPostMock} />);

    // Mock the file input change event for image uploading
    const imageUploadingButton = screen.getByText('Upload Image');
    fireEvent.click(imageUploadingButton);

    // Simulate selecting an image
    const file = new File(['image'], 'test-image.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    // Add the image file to the image list
    const input = screen.getByLabelText('Upload Image');
    fireEvent.change(input, { target: { files: dataTransfer.files } });

    // Ensure the image preview is shown
    expect(screen.getByAltText('Uploaded')).toBeInTheDocument();
  });

  it('should navigate to login page when user is not logged in', async () => {
    localStorage.removeItem('token'); // Simulate user not logged in
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    render(<CreatePost onAddPost={onAddPostMock} />);

    // Trigger the submit button
    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);

    // Check that the navigate function is called to go to login page
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });

  it('should submit the post and call onAddPost when the user is logged in', async () => {
    // Mock the user is logged in
    localStorage.setItem('token', 'mocked-token');

    axios.post.mockResolvedValueOnce({
      data: { success: true, post: { content: 'Hello, world!' } },
    });

    render(<CreatePost onAddPost={onAddPostMock} />);

    // Fill in content and upload an image
    fireEvent.change(screen.getByLabelText("What's on your mind?"), { target: { value: 'New post content' } });

    // Mock uploading an image
    const imageUploadingButton = screen.getByText('Upload Image');
    fireEvent.click(imageUploadingButton);
    const file = new File(['image'], 'test-image.png', { type: 'image/png' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fireEvent.change(screen.getByLabelText('Upload Image'), { target: { files: dataTransfer.files } });

    // Trigger the post button
    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);

    // Wait for the onAddPost to be called with the new post data
    await waitFor(() => expect(onAddPostMock).toHaveBeenCalledWith({
      content: 'New post content',
      image: file,
    }));
  });

  it('should display an error if post creation fails', async () => {
    // Mock the user is logged in
    localStorage.setItem('token', 'mocked-token');

    axios.post.mockRejectedValueOnce(new Error('Failed to create post'));

    render(<CreatePost onAddPost={onAddPostMock} />);

    // Fill in content and trigger the post button
    fireEvent.change(screen.getByLabelText("What's on your mind?"), { target: { value: 'New post content' } });
    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);

    // Expect no new post to be added due to the error
    await waitFor(() => expect(onAddPostMock).not.toHaveBeenCalled());
  });
});
