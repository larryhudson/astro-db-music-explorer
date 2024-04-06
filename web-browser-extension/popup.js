// popup.js
document.getElementById("startPathwayBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "startPathway" });
  });
});

document.getElementById("stopPathwayBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "stopPathway" });
  });
});

chrome.storage.sync.get("apiToken", (data) => {
  const apiToken = data.apiToken;
  document.getElementById("apiToken").textContent = apiToken;
});
