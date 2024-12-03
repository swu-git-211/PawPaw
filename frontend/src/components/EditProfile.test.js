// EditProfile.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfile from './EditProfile';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('EditProfile Component', () => {
  const mockUser = {
    phone: '1234567890',
    birthday: '1990-01-01',
    bio: 'Hello, I am a pet lover!',
    petTypes: ['Cat', 'Dog'],
    showEmail: true,
    profileImage: '/images/user1.jpg',
  };

  const onSave = jest.fn();

  it('should render form with user data', () => {
    render(<EditProfile user={mockUser} onSave={onSave} />);

    // Check if fields are prefilled with user data
    expect(screen.getByLabelText(/Phone/i).value).toBe(mockUser.phone);
    expect(screen.getByLabelText(/Birthday/i).value).toBe(mockUser.birthday);
    expect(screen.getByLabelText(/Bio/i).value).toBe(mockUser.bio);

    // Check if petTypes dropdown contains the correct options
    expect(screen.getByText('Cat')).toBeInTheDocument();
    expect(screen.getByText('Dog')).toBeInTheDocument();

    // Check if 'Show Email' checkbox is checked
    expect(screen.getByLabelText(/Show Email on Profile/i)).toBeChecked();
  });

  it('should update state when user changes inputs', () => {
    render(<EditProfile user={mockUser} onSave={onSave} />);

    // Change phone number
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '9876543210' } });
    expect(screen.getByLabelText(/Phone/i).value).toBe('9876543210');

    // Change birthday
    fireEvent.change(screen.getByLabelText(/Birthday/i), { target: { value: '2000-01-01' } });
    expect(screen.getByLabelText(/Birthday/i).value).toBe('2000-01-01');
  });

  it('should update petTypes correctly when multiple options are selected', () => {
    render(<EditProfile user={mockUser} onSave={onSave} />);

    // Select 'Rabbit' and 'Turtle' pet types
    fireEvent.mouseDown(screen.getByLabelText(/Pet Types/i));
    fireEvent.click(screen.getByText('Rabbit'));
    fireEvent.click(screen.getByText('Turtle'));

    // Check if petTypes state has been updated
    expect(screen.getByLabelText(/Pet Types/i)).toHaveValue(['Cat', 'Dog', 'Rabbit', 'Turtle']);
  });

  it('should call onSave and make the correct API request on save', async () => {
    render(<EditProfile user={mockUser} onSave={onSave} />);

    const updatedUser = {
      phone: '9876543210',
      birthday: '2000-01-01',
      bio: 'Updated bio',
      petTypes: ['Cat', 'Rabbit'],
      showEmail: false,
    };

    // Change form fields
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: updatedUser.phone } });
    fireEvent.change(screen.getByLabelText(/Birthday/i), { target: { value: updatedUser.birthday } });
    fireEvent.change(screen.getByLabelText(/Bio/i), { target: { value: updatedUser.bio } });
    fireEvent.click(screen.getByLabelText(/Show Email on Profile/i));

    // Simulate save button click
    fireEvent.click(screen.getByText(/Save Changes/i));

    // Mock the API response
    axios.put.mockResolvedValueOnce({ data: { data: updatedUser } });

    // Wait for the form submission to complete
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(updatedUser));

    // Check if the API request was called with the correct data
    expect(axios.put).toHaveBeenCalledWith('http://localhost:5000/pawpaw/user/profile', expect.objectContaining({
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    }), expect.any(Object));
  });

  it('should handle image upload', async () => {
    render(<EditProfile user={mockUser} onSave={onSave} />);

    // Simulate image file input
    const file = new Blob(['image'], { type: 'image/jpeg' });
    Object.defineProperty(file, 'name', { value: 'profile.jpg' });
    fireEvent.change(screen.getByLabelText(/Profile Image/i), { target: { files: [file] } });

    // Check if file was added to the state
    expect(screen.getByLabelText(/Profile Image/i).files[0].name).toBe('profile.jpg');
  });

  it('should display an alert when profile update fails', async () => {
    render(<EditProfile user={mockUser} onSave={onSave} />);

    // Simulate save button click
    fireEvent.click(screen.getByText(/Save Changes/i));

    // Mock failed API response
    axios.put.mockRejectedValueOnce(new Error('Failed to update profile'));

    // Wait for error alert
    await waitFor(() => expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument());
  });
});
