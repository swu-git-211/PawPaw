import React from 'react';
import { render, fireEvent, screen, act, waitFor } from '@testing-library/react';
import LikeButton from './LikeButton';
import '@testing-library/jest-dom';

// Mocking localStorage for testing token retrieval
beforeAll(() => {
  global.localStorage = {
    getItem: jest.fn(() => 'mock-token'),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
});

global.alert = jest.fn();  // Mock alert function

describe('LikeButton Component', () => {
  it('renders correctly with initial liked state and like count', () => {
    const onLikeMock = jest.fn();
    render(<LikeButton likedByUser={false} likeCount={5} onLike={onLikeMock} />);

    // Check if the like count is displayed
    expect(screen.getByText('5 Likes')).toBeInTheDocument();
    // Check that the heart icon is the unliked version
    expect(screen.getByRole('button')).toHaveClass('MuiIconButton-root');
  });

  it('toggles the like state and updates the like count when clicked', async () => {
    const onLikeMock = jest.fn(() => Promise.resolve(true));  // Mock the like API to return success
    render(<LikeButton likedByUser={false} likeCount={5} onLike={onLikeMock} />);

    const likeButton = screen.getByRole('button');
    
    // Initially, the user is not liked, so the button should show an empty heart
    expect(likeButton).toContainHTML('<svg');

    // Simulate click to like the post
    await act(async () => {
      fireEvent.click(likeButton);
    });

    // Wait for like count to update
    await waitFor(() => {
      expect(screen.getByText('6 Likes')).toBeInTheDocument();  // Ensure the like count is updated
      expect(likeButton.querySelector('svg')).toHaveAttribute('fill', 'rgb(244, 67, 54)');  // red color
    });
    expect(onLikeMock).toHaveBeenCalledTimes(1);  // Ensure onLike is called once
  });

  it('toggles the like state back to unliked when clicked again', async () => {
    const onLikeMock = jest.fn(() => Promise.resolve(true));  // Mock the like API to return success
    render(<LikeButton likedByUser={true} likeCount={6} onLike={onLikeMock} />);

    const likeButton = screen.getByRole('button');
    
    // Initially, the user is liked, so the button should show a filled heart
    expect(likeButton).toContainHTML('<svg');
    
    // Simulate click to unlike the post
    await act(async () => {
      fireEvent.click(likeButton);
    });

    // Wait for like count to update
    await waitFor(() => {
      expect(screen.getByText('5 Likes')).toBeInTheDocument();  // Ensure the like count is updated
      expect(likeButton.querySelector('svg')).toHaveAttribute('fill', 'none');  // empty heart
    });
    expect(onLikeMock).toHaveBeenCalledTimes(1);  // Ensure onLike is called once
  });
});
