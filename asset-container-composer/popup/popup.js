document.getElementById('openComposer').addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('composer/index.html')
  });
  window.close();
});
