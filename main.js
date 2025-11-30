const form = document.getElementById("clean-form");
const codeInput = document.getElementById("code-input");
const taskSelect = document.getElementById("task-select");
const output = document.getElementById("output");
const button = document.getElementById("clean-button");

// Backend endpoint URL
const BACKEND_URL = "https://clean-code-c4mn.onrender.com/api/clean";

// Handle form submission: user clicks "Clean My Code"
form.addEventListener("submit", async (event) => {
  event.preventDefault(); // prevent page refresh

  // Get code from textarea
  const code = codeInput.value.trim();
  // Get selected task: "optimize", "format", "debug", or "all"
  const task = taskSelect.value;

  // If code is empty, show quick error highlight and stop
  if (!code) {
    codeInput.classList.add("error");
    setTimeout(() => codeInput.classList.remove("error"), 1500);
    return;
  }

  // UI: show loading state on button + output
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "Cleaning...";
  output.value = "Processing your code...";

  try {
    // Send POST request to backend with code + task as JSON
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, task }),
    });

    if (!response.ok) {
      // If server responded with 4xx / 5xx
      output.value = "Server error. Please try again.";
      return;
    }

    // Parse JSON response from backend: { cleanedCode: "..." }
    const data = await response.json();

    // Place cleaned code into the "AI Cleaned Code" textarea
    output.value = data.cleanedCode || "No cleaned code returned.";
  } catch (err) {
    // Network or fetch error
    console.error("Network error:", err);
    output.value = "Network error. Please try again.";
  } finally {
    // Restore button to normal state
    button.disabled = false;
    button.textContent = originalText;
  }
});
