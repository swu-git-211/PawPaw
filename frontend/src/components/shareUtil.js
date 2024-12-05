// components/shareUtil.js
export const shareContent = async ({ title, text, url }) => {
  if (navigator.share && window.location.protocol === 'https:') {
      try {
          await navigator.share({ title, text, url });
          console.log('Content shared successfully!');
      } catch (error) {
          console.error('Error sharing content:', error);
      }
  } else {
      // ใช้ Clipboard เมื่อไม่รองรับ `navigator.share()`
      try {
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard! Sharing is only available via HTTPS.');
      } catch (error) {
          console.error('Failed to copy link:', error);
      }
  }
};
