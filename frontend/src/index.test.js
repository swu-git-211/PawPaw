import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Mocking reportWebVitals
jest.mock('./reportWebVitals', () => jest.fn());

describe('Index.js Rendering', () => {
  it('renders App component inside BrowserRouter', () => {
    // Create a root element and render App inside BrowserRouter
    const div = document.createElement('div');
    ReactDOM.render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
      div
    );

    // Check if App is rendering
    expect(div.querySelector('div')).toBeInTheDocument();
  });

  it('calls reportWebVitals', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Ensure that reportWebVitals is called
    expect(reportWebVitals).toHaveBeenCalled();
  });

  it('should render App correctly', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Verify that App renders by checking for something specific, for example, the Home page
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });
});
