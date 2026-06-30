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

    document.getElementById("view-approved-count").textContent = activity.approved_count;
    document.getElementById("view-pending-count").textContent = activity.pending_request_count;
    document.getElementById("view-request-status").textContent =
      activity.user_request_status ? activity.user_request_status : "Not requested";
    document.getElementById("view-contact").textContent =
      activity.contact_phone || "Visible after approval.";

    ownerBannerSlot.innerHTML = isOwner
      ? `<div class="owner-banner">You created this activity.</div>`
      : "";

    const canEdit = isOwner && activity.status !== "cancelled" && activity.status !== "completed";
    ownerActions.style.display = isOwner ? "flex" : "none";
    document.getElementById("edit-btn").style.display = canEdit ? "inline-flex" : "none";
    document.getElementById("cancel-activity-btn").style.display =
      isOwner && activity.status !== "cancelled" ? "inline-flex" : "none";

    const requestActions = document.getElementById("request-actions");
    const joinButton = document.getElementById("join-activity-btn");
    const statusNote = document.getElementById("request-status-note");
    const requestPanel = document.getElementById("owner-requests-panel");

    if (isOwner) {
      requestActions.style.display = "none";
      requestPanel.style.display = activity.pending_requests.length ? "block" : "none";
      renderPendingRequests(activity.pending_requests);
    } else {
      requestPanel.style.display = "none";
      statusNote.textContent = "";
      if (activity.status === "open") {
        if (!activity.user_request_status) {
          requestActions.style.display = "flex";
          joinButton.style.display = "inline-flex";
          statusNote.textContent = "You can request to join this activity.";
        } else {
          requestActions.style.display = "flex";
          joinButton.style.display = "none";
          if (activity.user_request_status === "pending") {
            statusNote.textContent = "Your join request is pending approval.";
          } else if (activity.user_request_status === "approved") {
            statusNote.textContent = "You are approved to join this activity.";
          } else if (activity.user_request_status === "rejected") {
            statusNote.textContent = "Your request was rejected.";
          }
        }
      } else {
        requestActions.style.display = "flex";
        joinButton.style.display = "none";
        if (activity.status === "full") {
          statusNote.textContent = "This activity is already full.";
        } else if (activity.status === "cancelled") {
          statusNote.textContent = "This activity has been cancelled.";
        } else if (activity.status === "completed") {
          statusNote.textContent = "This activity has already completed.";
        }
      }
    }

    viewCard.style.display = "block";
    editCard.style.display = "none";
  }

  function renderPendingRequests(requests) {
    const list = document.getElementById("pending-requests-list");
    list.innerHTML = "";

    if (!requests.length) {
      list.innerHTML = `<p class="empty-state">No requests yet.</p>`;
      return;
    }

    requests.forEach((request) => {
      const requestCard = document.createElement("div");
      requestCard.className = "request-card";
      requestCard.innerHTML = `
        <div class="request-card-top">
          <div>
            <strong>${escapeHtml(request.requester_name)}</strong>
            <div class="request-meta">${formatDateTime(request.created_at)}</div>
          </div>
          <span class="status-badge status-${request.status}">${escapeHtml(request.status)}</span>
        </div>
        <div class="request-details">
          <div><strong>Phone</strong>: ${escapeHtml(request.requester_phone || "Not provided")}</div>
        </div>
      `;

      if (request.status === "pending") {
        const actions = document.createElement("div");
        actions.className = "request-actions";
        const approveBtn = document.createElement("button");
        approveBtn.type = "button";
        approveBtn.className = "btn btn-compact";
        approveBtn.textContent = "Approve";
        approveBtn.addEventListener("click", async () => {
          try {
            await CircleUpAPI.approveParticipationRequest(request.id);
            showSuccess("Request approved.");
            await loadActivity();
          } catch (err) {
            showError(err.message);
          }
        });

        const rejectBtn = document.createElement("button");
        rejectBtn.type = "button";
        rejectBtn.className = "btn-secondary btn-compact";
        rejectBtn.textContent = "Reject";
        rejectBtn.addEventListener("click", async () => {
          try {
            await CircleUpAPI.rejectParticipationRequest(request.id);
            showSuccess("Request rejected.");
            await loadActivity();
          } catch (err) {
            showError(err.message);
          }
        });

        actions.appendChild(approveBtn);
        actions.appendChild(rejectBtn);
        requestCard.appendChild(actions);
      }

      list.appendChild(requestCard);
    });
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

  document.getElementById("join-activity-btn").addEventListener("click", async () => {
    hideAlerts();
    try {
      await CircleUpAPI.requestParticipation(activityId);
      showSuccess("Your join request has been sent.");
      await loadActivity();
    } catch (err) {
      if (err.status === 400 || err.status === 403) {
        showError(err.message);
      } else {
        showError("Could not send join request. Please try again.");
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