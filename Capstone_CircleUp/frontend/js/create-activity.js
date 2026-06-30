document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const form = document.getElementById("create-form");
  const alertBox = document.getElementById("alert");
  const submitBtn = document.getElementById("submit-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const dateInput = document.getElementById("date");

  function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.add("show");
  }

  function hideError() {
    alertBox.classList.remove("show");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();

    const isoDate = localDateTimeInputToIso(dateInput.value);

    if (!isoDate || new Date(isoDate) <= new Date()) {
      showError("Activity date and time must be in the future.");
      return;
    }

    const payload = {
      title: document.getElementById("title").value.trim(),
      description: document.getElementById("description").value.trim() || null,
      category: document.getElementById("category").value.trim(),
      location: document.getElementById("location").value.trim(),
      date: isoDate,
      max_participants: parseInt(document.getElementById("max_participants").value, 10),
    };

    if (!(payload.max_participants > 0)) {
      showError("Max participants must be greater than zero.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Creating…";

    try {
      const created = await CircleUpAPI.createActivity(payload);
      window.location.href = `activity-detail.html?id=${created.id}`;
    } catch (err) {
      if (err.status === 401) {
        Auth.clearToken();
        window.location.href = "login.html";
        return;
      }
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = "Create activity";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await CircleUpAPI.logout();
    } catch (_) {}
    Auth.clearToken();
    window.location.href = "login.html";
  });
});