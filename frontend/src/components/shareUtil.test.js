import { shareContent } from './shareUtil';

describe('shareContent', () => {
  beforeAll(() => {
    // Mock navigator.share and navigator.clipboard.writeText
    global.navigator.share = jest.fn();
    global.navigator.clipboard = {
      writeText: jest.fn(),
    };
  });

  afterEach(() => {
    // Reset mocks after each test
    jest.clearAllMocks();
  });

  it('should call navigator.share when it is supported', async () => {
    // Arrange
    const mockData = {
      title: 'Test Title',
      text: 'Test Text',
      url: 'https://example.com',
    };
    
    // Simulate the case where navigator.share is available
    global.navigator.share.mockResolvedValueOnce();

    // Act
    await shareContent(mockData);

    // Assert
    expect(global.navigator.share).toHaveBeenCalledWith(mockData);
    expect(global.navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it('should copy link to clipboard when navigator.share is not available', async () => {
    // Arrange
    const mockData = {
      title: 'Test Title',
      text: 'Test Text',
      url: 'https://example.com',
    };
    
    // Simulate the case where navigator.share is not available
    global.navigator.share = undefined;
    global.navigator.clipboard.writeText.mockResolvedValueOnce();

    // Act
    await shareContent(mockData);

    // Assert
    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith(mockData.url);
    expect(global.navigator.share).not.toHaveBeenCalled();
  });

  it('should alert when clipboard.writeText fails', async () => {
    // Arrange
    const mockData = {
      title: 'Test Title',
      text: 'Test Text',
      url: 'https://example.com',
    };

    // Simulate the case where clipboard.writeText fails
    global.navigator.share = undefined;
    global.navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Failed to write to clipboard'));

    // Mock the alert function to check if it gets called
    global.alert = jest.fn();

    // Act
    await shareContent(mockData);

    // Assert
    expect(global.alert).toHaveBeenCalledWith('Link copied to clipboard!');
  });
});
