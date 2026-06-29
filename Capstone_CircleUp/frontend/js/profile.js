document.addEventListener("DOMContentLoaded", () => {
  const alertBox = document.getElementById("alert");
  const successBox = document.getElementById("success");
  const form = document.getElementById("profile-form");
  const loadingMsg = document.getElementById("loading-msg");
  const saveBtn = document.getElementById("save-btn");
  const logoutBtn = document.getElementById("logout-btn");

  function showError(message) {
    successBox.classList.remove("show");
    alertBox.textContent = message;
    alertBox.classList.add("show");
  }

  function showSuccess(message) {
    alertBox.classList.remove("show");
    successBox.textContent = message;
    successBox.classList.add("show");
    setTimeout(() => successBox.classList.remove("show"), 3000);
  }

  function populateForm(user) {
    document.getElementById("display-name").textContent = user.name;
    document.getElementById("display-email").textContent = user.email;
    document.getElementById("avatar-initial").textContent = user.name.charAt(0).toUpperCase();

    document.getElementById("name").value = user.name || "";
    document.getElementById("phone_number").value = user.phone_number || "";
    document.getElementById("city").value = user.city || "";
    document.getElementById("bio").value = user.bio || "";

    loadingMsg.style.display = "none";
    form.style.display = "block";
  }

  async function loadProfile() {
    try {
      const user = await CircleUpAPI.getCurrentUser();
      populateForm(user);
    } catch (err) {
      if (err.status === 401) {
        Auth.clearToken();
        window.location.href = "login.html";
        return;
      }
      loadingMsg.textContent = "Couldn't load your profile.";
      showError(err.message);
    }
  }

  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }
  loadProfile();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    alertBox.classList.remove("show");

    const payload = {
      name: document.getElementById("name").value.trim(),
      phone_number: document.getElementById("phone_number").value.trim() || null,
      city: document.getElementById("city").value.trim() || null,
      bio: document.getElementById("bio").value.trim() || null,
    };

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    try {
      const updated = await CircleUpAPI.updateProfile(payload);
      populateForm(updated);
      showSuccess("Profile updated.");
    } catch (err) {
      showError(err.message);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save changes";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await CircleUpAPI.logout();
    } catch (_) {
      // Logout is a client-side action for stateless JWTs regardless.
    }
    Auth.clearToken();
    window.location.href = "login.html";
  });
});