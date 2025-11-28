const textarea = document.querySelector('.action-form textarea');
const button = document.querySelector('.button');

button.addEventListener('click', () => { //checks for empty textarea on button click
    if(textarea.value.trim() === '') {
        textarea.classList.add('error');
        setTimeout(() => {
            textarea.classList.remove('error');
            
        }, 2000); // Remove error class after 2 seconds

    } else {
        textarea.classList.remove('error');
    }
});

// Grab elements from your existing HTML
const form = document.getElementById("clean-form");
const codeInput = document.getElementById("code-input");
const taskSelect = document.getElementById("task-select");
const output = document.getElementById("output");

// While testing locally on Windows, your backend URL is:
const BACKEND_URL = "https://clean-code-c4mn.onrender.com/api/clean"; // change later when you deploy

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // stop page from refreshing

  const code = codeInput.value;
  const task = taskSelect.value;

  if (!code.trim()) {
    output.textContent = "Please paste some code first.";
    return;
  }

  // Show loading text
  output.textContent = "Cleaning your code with AI...";

  try {
    const response = await fetch(`${BACKEND_URL}/api/clean`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // we send both code and task; backend can use task as a hint
      body: JSON.stringify({ code, task }),
    });

    const data = await response.json();

    if (!response.ok) {
      output.textContent = data.error || "Server error occurred.";
      return;
    }

    output.textContent = data.cleanedCode;
  } catch (error) {
    console.error(error);
    output.textContent =
      "Could not reach the CleanCode server. Is it running on port 3000?";
  }
});