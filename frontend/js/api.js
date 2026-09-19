const API_BASE = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Request failed");
  }

  return data;
}

function showMessage(message, type = "info") {
  const element = document.getElementById("message");
  if (!element) return;
  element.className = `alert alert-${type}`;
  element.textContent = message;
  element.classList.remove("d-none");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await request("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("registerName").value,
          email: document.getElementById("registerEmail").value,
          password: document.getElementById("registerPassword").value
        })
      });
      showMessage("Registration successful. You can now log in.", "success");
      event.target.reset();
    } catch (error) {
      showMessage(error.message, "danger");
    }
  });

  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: document.getElementById("loginEmail").value,
          password: document.getElementById("loginPassword").value
        })
      });
      localStorage.setItem("scholarshipToken", data.token);
      localStorage.setItem("scholarshipUser", JSON.stringify(data.user));
      showMessage(`Welcome, ${data.user.name}.`, "success");
      event.target.reset();
    } catch (error) {
      showMessage(error.message, "danger");
    }
  });
});
