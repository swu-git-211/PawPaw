// DeleteButton.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteButton from './DeleteButton';

describe('DeleteButton Component', () => {
  it('should open the menu when the more icon is clicked', () => {
    render(<DeleteButton onDelete={jest.fn()} />);

    // Click the more button to open the menu
    const moreButton = screen.getByLabelText('more');
    fireEvent.click(moreButton);

    // The menu should be open
    expect(screen.getByText('Delete Post')).toBeInTheDocument();
  });

  it('should open the confirmation dialog when "Delete Post" is clicked', () => {
    render(<DeleteButton onDelete={jest.fn()} />);

    // Click the more button to open the menu
    const moreButton = screen.getByLabelText('more');
    fireEvent.click(moreButton);

    // Click on "Delete Post" in the menu
    const deleteMenuItem = screen.getByText('Delete Post');
    fireEvent.click(deleteMenuItem);

    // The dialog should be open
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this post?')).toBeInTheDocument();
  });

  it('should close the dialog when "Cancel" is clicked', () => {
    render(<DeleteButton onDelete={jest.fn()} />);

    // Click the more button to open the menu
    const moreButton = screen.getByLabelText('more');
    fireEvent.click(moreButton);

    // Click "Delete Post" to open the confirmation dialog
    fireEvent.click(screen.getByText('Delete Post'));

    // Click "Cancel" to close the dialog
    fireEvent.click(screen.getByText('Cancel'));

    // The dialog should be closed
    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
  });

  it('should call onDelete and close the dialog when "Delete" is clicked', async () => {
    const mockDelete = jest.fn();

    render(<DeleteButton onDelete={mockDelete} />);

    // Click the more button to open the menu
    const moreButton = screen.getByLabelText('more');
    fireEvent.click(moreButton);

    // Click "Delete Post" to open the confirmation dialog
    fireEvent.click(screen.getByText('Delete Post'));

    // Click "Delete" to confirm
    fireEvent.click(screen.getByText('Delete'));

    // Check if the delete function was called
    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    // The dialog should be closed after deletion
    expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
  });
});
