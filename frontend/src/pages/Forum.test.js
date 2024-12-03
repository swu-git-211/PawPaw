import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Forum from '../pages/Forum';
import '@testing-library/jest-dom'; // For the `toBeInTheDocument` matcher
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock Axios for testing the API call
jest.mock('axios');

// Mock component for CreatePost
jest.mock('../components/CreatePost', () => ({ onAddPost }) => (
  <button onClick={() => onAddPost({ content: 'New Post' })}>Create Post</button>
));

// Render the component with router context
const renderWithRouter = () => {
  render(
    <BrowserRouter>
      <Forum />
    </BrowserRouter>
  );
};

describe('Forum Component', () => {
  it('renders posts correctly', async () => {
    // Mock API response
    axios.get.mockResolvedValue({
      data: {
        success: true,
        posts: [{ _id: 1, content: 'Test Post 1' }, { _id: 2, content: 'Test Post 2' }],
      },
    });

    renderWithRouter();

    // Wait for the posts to appear
    await waitFor(() => expect(screen.getByText('Test Post 1')).toBeInTheDocument());
    expect(screen.getByText('Test Post 2')).toBeInTheDocument();
  });

  it('opens CreatePost dialog when the FAB button is clicked', async () => {
    renderWithRouter();

    // Find the FAB button
    const addButton = screen.getByLabelText('add');

    // Click the button to open the dialog
    fireEvent.click(addButton);

    // Check if the CreatePost dialog opens
    const dialogTitle = screen.getByText('Create a New Post');
    expect(dialogTitle).toBeInTheDocument();
  });

  it('adds a new post when CreatePost button is clicked', async () => {
    // Mock API response
    axios.get.mockResolvedValue({
      data: {
        success: true,
        posts: [{ _id: 1, content: 'Test Post 1' }],
      },
    });

    renderWithRouter();

    // Simulate clicking the "Create Post" button inside the CreatePost component
    fireEvent.click(screen.getByText('Create Post'));

    // Verify that the new post is added to the list
    await waitFor(() => expect(screen.getByText('New Post')).toBeInTheDocument());
  });

  it('closes CreatePost dialog when Cancel button is clicked', async () => {
    renderWithRouter();

    // Find and click the FAB button
    const addButton = screen.getByLabelText('add');
    fireEvent.click(addButton);

    // Click the Cancel button in the dialog
    fireEvent.click(screen.getByText('Cancel'));

    // Verify that the CreatePost dialog is closed
    const dialogTitle = screen.queryByText('Create a New Post');
    expect(dialogTitle).not.toBeInTheDocument();
  });
});
