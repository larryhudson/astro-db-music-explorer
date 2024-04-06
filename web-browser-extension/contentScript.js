// contentScript.js
let pathwayData = [];
let isTrackingPathway = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startPathway") {
    startTrackingPathway();
  } else if (request.action === "stopPathway") {
    stopTrackingPathway();
  }
});

function startTrackingPathway() {
  isTrackingPathway = true;
  addNavigationEventListeners();
}

function stopTrackingPathway() {
  isTrackingPathway = false;
  removeNavigationEventListeners();
  uploadPathwayDataToApi();
}

function addNavigationEventListeners() {
  window.addEventListener("click", handleNavigation);
}

function removeNavigationEventListeners() {
  window.removeEventListener("click", handleNavigation);
}

function handleNavigation(event) {
  if (isTrackingPathway && event.target.tagName === "A") {
    const url = event.target.href;
    const title = document.title;
    const timestamp = new Date().getTime();
    pathwayData.push({ url, title, timestamp });
  }
}

function uploadPathwayDataToApi() {
  chrome.storage.sync.get("apiToken", async (data) => {
    const apiToken = data.apiToken;
    const apiEndpoint = "https://your-api.com/pathways";

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({ pathwayData }),
      });

      if (response.ok) {
        console.log("Pathway data uploaded successfully");
      } else {
        console.error("Failed to upload pathway data");
      }
    } catch (error) {
      console.error("Error uploading pathway data:", error);
    }
  });
}
