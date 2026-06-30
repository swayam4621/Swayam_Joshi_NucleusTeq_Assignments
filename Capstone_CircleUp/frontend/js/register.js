document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
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

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (password.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account…";

    try {
      await CircleUpAPI.register({ name, email, password });
      const loginResult = await CircleUpAPI.login(email, password);
      Auth.setToken(loginResult.access_token);
      window.location.href = "activities.html";
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
    }
  });
});