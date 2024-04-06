// authentication.js
document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(
      "http://localhost:4321/auth/browser-extension",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      },
    );

    if (response.ok) {
      const { sessionKeyValue } = await response.json();
      chrome.storage.sync.set({ apiToken: sessionKeyValue });
      window.close();
    } else {
      showAuthenticationError("Authentication failed");
    }
  } catch (error) {
    showAuthenticationError(error.message);
  }
});

function showAuthenticationError(message) {
  const errorElement = document.getElementById("authError");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}
