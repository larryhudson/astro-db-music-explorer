// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get("apiToken", (data) => {
    console.log({ apiTokenData: data });
    const isAuthenticated = !!data.apiToken;
    if (!isAuthenticated) {
      chrome.browserAction.setPopup({
        popup: "authentication.html",
      });
    }
  });
});
