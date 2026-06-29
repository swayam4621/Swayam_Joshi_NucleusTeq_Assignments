document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const alertBox = document.getElementById("alert");
  const submitBtn = document.getElementById("submit-btn");

  if (Auth.isLoggedIn()) {
    window.location.href = "activities.html";
    return;
  }

  function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.add("show");
  }

  function hideError() {
    alertBox.classList.remove("show");
    alertBox.textContent = "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in…";

    try {
      const result = await CircleUpAPI.login(email, password);
      Auth.setToken(result.access_token);
      window.location.href = "activities.html";
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Log in";
    }
  });
});