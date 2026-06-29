document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const activityId = params.get("id");

  if (!activityId) {
    window.location.href = "activities.html";
    return;
  }

  const loadingMsg = document.getElementById("loading-msg");
  const viewCard = document.getElementById("view-card");
  const editCard = document.getElementById("edit-card");
  const alertBox = document.getElementById("alert");
  const successBox = document.getElementById("success");
  const ownerActions = document.getElementById("owner-actions");
  const ownerBannerSlot = document.getElementById("owner-banner-slot");
  const logoutBtn = document.getElementById("logout-btn");
  const cancelModal = document.getElementById("cancel-modal");

  let currentActivity = null;
  let currentUserId = null;

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

  function renderView(activity, isOwner) {
    document.getElementById("view-title").textContent = activity.title;
    document.getElementById("view-status-badge").innerHTML = statusBadgeHtml(activity.status);
    document.getElementById("view-description").textContent =
      activity.description || "No description provided.";
    document.getElementById("view-category").textContent = activity.category;
    document.getElementById("view-location").textContent = activity.location;
    document.getElementById("view-date").textContent = formatDateTime(activity.date);
    document.getElementById("view-max").textContent = activity.max_participants;

    ownerBannerSlot.innerHTML = isOwner
      ? `<div class="owner-banner">You created this activity.</div>`
      : "";

    const canEdit = isOwner && activity.status !== "cancelled" && activity.status !== "completed";
    ownerActions.style.display = isOwner ? "flex" : "none";
    document.getElementById("edit-btn").style.display = canEdit ? "inline-flex" : "none";
    document.getElementById("cancel-activity-btn").style.display =
      isOwner && activity.status !== "cancelled" ? "inline-flex" : "none";

    viewCard.style.display = "block";
    editCard.style.display = "none";
  }

  function populateEditForm(activity) {
    document.getElementById("edit-title").value = activity.title;
    document.getElementById("edit-description").value = activity.description || "";
    document.getElementById("edit-category").value = activity.category;
    document.getElementById("edit-location").value = activity.location;
    document.getElementById("edit-date").value = isoToLocalDateTimeInput(activity.date);
    document.getElementById("edit-max").value = activity.max_participants;
  }

  async function loadActivity() {
    loadingMsg.style.display = "block";
    viewCard.style.display = "none";
    editCard.style.display = "none";

    try {
      const [activity, user] = await Promise.all([
        CircleUpAPI.getActivity(activityId),
        CircleUpAPI.getCurrentUser(),
      ]);
      currentActivity = activity;
      currentUserId = user.id;
      renderView(activity, user.id === activity.creator_id);
    } catch (err) {
      if (err.status === 401) {
        Auth.clearToken();
        window.location.href = "login.html";
        return;
      }
      if (err.status === 404) {
        loadingMsg.textContent = "This activity doesn't exist or was removed.";
        return;
      }
      showError(err.message);
    } finally {
      loadingMsg.style.display = "none";
    }
  }

  document.getElementById("edit-btn").addEventListener("click", () => {
    populateEditForm(currentActivity);
    viewCard.style.display = "none";
    editCard.style.display = "block";
  });

  document.getElementById("cancel-edit-btn").addEventListener("click", () => {
    editCard.style.display = "none";
    viewCard.style.display = "block";
  });

  document.getElementById("edit-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    hideAlerts();

    const isoDate = localDateTimeInputToIso(document.getElementById("edit-date").value);
    if (!isoDate || new Date(isoDate) <= new Date()) {
      showError("Activity date and time must be in the future.");
      return;
    }

    const maxParticipants = parseInt(document.getElementById("edit-max").value, 10);
    if (!(maxParticipants > 0)) {
      showError("Max participants must be greater than zero.");
      return;
    }

    const payload = {
      title: document.getElementById("edit-title").value.trim(),
      description: document.getElementById("edit-description").value.trim() || null,
      category: document.getElementById("edit-category").value.trim(),
      location: document.getElementById("edit-location").value.trim(),
      date: isoDate,
      max_participants: maxParticipants,
    };

    const saveBtn = document.getElementById("save-edit-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    try {
      const updated = await CircleUpAPI.updateActivity(activityId, payload);
      currentActivity = updated;
      renderView(updated, true);
      showSuccess("Activity updated.");
    } catch (err) {
      if (err.status === 403) {
        showError("You can only edit activities you created.");
      } else {
        showError(err.message);
      }
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save changes";
    }
  });

  document.getElementById("cancel-activity-btn").addEventListener("click", () => {
    cancelModal.classList.add("show");
  });
  document.getElementById("modal-dismiss-btn").addEventListener("click", () => {
    cancelModal.classList.remove("show");
  });
  document.getElementById("modal-confirm-btn").addEventListener("click", async () => {
    cancelModal.classList.remove("show");
    try {
      const updated = await CircleUpAPI.cancelActivity(activityId);
      currentActivity = updated;
      renderView(updated, true);
      showSuccess("Activity cancelled.");
    } catch (err) {
      if (err.status === 403) {
        showError("You can only cancel activities you created.");
      } else {
        showError(err.message);
      }
    }
  });

  function hideAlerts() {
    alertBox.classList.remove("show");
    successBox.classList.remove("show");
  }

  logoutBtn.addEventListener("click", async () => {
    try {
      await CircleUpAPI.logout();
    } catch (_) {}
    Auth.clearToken();
    window.location.href = "login.html";
  });

  loadActivity();
});