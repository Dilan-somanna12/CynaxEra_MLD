// Send only the current page's main URL to the background script
chrome.runtime.sendMessage({
  type: 'PAGE_URL',
  url: window.location.href
});
