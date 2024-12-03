import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { jwtDecode } from 'jwt-decode';

// Mocking the necessary libraries
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

// Mock localStorage
beforeEach(() => {
  localStorage.clear();
});

describe('App Component', () => {

  it('renders correctly without user logged in', () => {
    render(
      <Router>
        <App />
      </Router>
    );

    // Check if Home page is rendered by default
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Forum')).not.toBeInTheDocument();
  });

  it('renders correctly when logged in', async () => {
    localStorage.setItem('token', 'mock-token');
    jwtDecode.mockReturnValueOnce({ exp: Date.now() / 1000 + 3600 }); // Mocking valid token with future expiration

    render(
      <Router>
        <App />
      </Router>
    );

    // Simulate the effect of having a valid token in localStorage
    await waitFor(() => {
      expect(screen.queryByText('Profile')).toBeInTheDocument();
      expect(screen.queryByText('Forum')).toBeInTheDocument();
    });
  });

  it('logs out when token is removed', async () => {
    localStorage.setItem('token', 'mock-token');
    jwtDecode.mockReturnValueOnce({ exp: Date.now() / 1000 + 3600 }); // Valid token
    render(
      <Router>
        <App />
      </Router>
    );

    // Simulate logout by removing token
    localStorage.removeItem('token');

    // Re-render and check if the user is logged out
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
      expect(screen.queryByText('Forum')).not.toBeInTheDocument();
    });
  });

  it('alerts user when session expires', async () => {
    // Set a mock expired token
    localStorage.setItem('token', 'mock-expired-token');
    jwtDecode.mockReturnValueOnce({ exp: Date.now() / 1000 - 3600 }); // Expired token

    // Spy on `alert` to check if it's called
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <Router>
        <App />
      </Router>
    );

    // Check if alert was called with 'Session expired' message
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Session expired. You have been logged out.');
    });

    alertSpy.mockRestore();
  });

  it('renders login page when user navigates to /login route', () => {
    render(
      <Router>
        <App />
      </Router>
    );

    // Check if Login page renders when the user navigates to "/login"
    fireEvent.click(screen.getByText(/login/i));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders profile page when user is logged in and navigates to /profile', async () => {
    localStorage.setItem('token', 'mock-token');
    jwtDecode.mockReturnValueOnce({ exp: Date.now() / 1000 + 3600 });

    render(
      <Router>
        <App />
      </Router>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText('Profile')); // Simulate navigating to Profile page
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
  });

  it('navigates to the home page by default', () => {
    render(
      <Router>
        <App />
      </Router>
    );

    // Check if Home is shown by default
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
