import { reportWebVitals } from './reportWebVitals';

// Mocking the web-vitals import
jest.mock('web-vitals', () => ({
  getCLS: jest.fn(),
  getFID: jest.fn(),
  getFCP: jest.fn(),
  getLCP: jest.fn(),
  getTTFB: jest.fn(),
}));

describe('reportWebVitals.js', () => {
  it('should call web-vitals functions with the onPerfEntry callback', async () => {
    const mockOnPerfEntry = jest.fn();

    // Calling reportWebVitals to check if it triggers the web-vitals functions
    reportWebVitals(mockOnPerfEntry);

    // Importing web-vitals module asynchronously as done in the original code
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

    // Check if the web-vitals functions were called
    expect(getCLS).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(getFID).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(getFCP).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(getLCP).toHaveBeenCalledWith(mockOnPerfEntry);
    expect(getTTFB).toHaveBeenCalledWith(mockOnPerfEntry);

    // Ensure that onPerfEntry was passed as the argument to each metric
    expect(mockOnPerfEntry).toHaveBeenCalled();
  });
});
