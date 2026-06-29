document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const loadingMsg = document.getElementById("loading-msg");
  const alertBox = document.getElementById("alert");
  const logoutBtn = document.getElementById("logout-btn");

  const tabs = {
    created: document.getElementById("tab-created"),
    joined: document.getElementById("tab-joined"),
    pending: document.getElementById("tab-pending"),
  };
  const panels = {
    created: document.getElementById("created-panel"),
    joined: document.getElementById("joined-panel"),
    pending: document.getElementById("pending-panel"),
  };

  const createdGrid = document.getElementById("created-grid");
  const createdEmpty = document.getElementById("created-empty");

  function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.add("show");
  }

  function switchTab(name) {
    Object.keys(tabs).forEach((key) => {
      tabs[key].classList.toggle("active", key === name);
      panels[key].style.display = key === name ? "block" : "none";
    });
  }

  Object.keys(tabs).forEach((key) => {
    tabs[key].addEventListener("click", () => switchTab(key));
  });

  function renderCreated(activities) {
    createdGrid.innerHTML = "";

    if (activities.length === 0) {
      createdGrid.style.display = "none";
      createdEmpty.style.display = "block";
      return;
    }

    createdEmpty.style.display = "none";
    createdGrid.style.display = "grid";

    activities.forEach((activity) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <div class="card-top">
          <h3>${escapeHtml(activity.title)}</h3>
          ${statusBadgeHtml(activity.status)}
        </div>
        <div class="meta-row">
          <span>📍 ${escapeHtml(activity.location)}</span>
          <span>🗓️ ${formatDateTime(activity.date)}</span>
          <span>👥 Up to ${activity.max_participants} participants</span>
        </div>
      `;
      card.addEventListener("click", () => {
        window.location.href = `activity-detail.html?id=${activity.id}`;
      });
      createdGrid.appendChild(card);
    });
  }

  async function loadCreatedActivities() {
    loadingMsg.style.display = "block";
    try {
      const [allActivities, currentUser] = await Promise.all([
        CircleUpAPI.listActivities(),
        CircleUpAPI.getCurrentUser(),
      ]);
      const mine = allActivities.filter((a) => a.creator_id === currentUser.id);
      renderCreated(mine);
    } catch (err) {
      if (err.status === 401) {
        Auth.clearToken();
        window.location.href = "login.html";
        return;
      }
      showError(err.message);
    } finally {
      loadingMsg.style.display = "none";
    }
  }

  logoutBtn.addEventListener("click", async () => {
    try {
      await CircleUpAPI.logout();
    } catch (_) {}
    Auth.clearToken();
    window.location.href = "login.html";
  });

  loadCreatedActivities();
});