document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const grid = document.getElementById("activity-grid");
  const emptyState = document.getElementById("empty-state");
  const loadingMsg = document.getElementById("loading-msg");
  const alertBox = document.getElementById("alert");
  const filterForm = document.getElementById("filter-form");
  const clearBtn = document.getElementById("clear-filters-btn");
  const logoutBtn = document.getElementById("logout-btn");

  function showError(message) {
    alertBox.textContent = message;
    alertBox.classList.add("show");
  }

  function hideError() {
    alertBox.classList.remove("show");
  }

  function renderActivities(activities) {
    grid.innerHTML = "";

    if (activities.length === 0) {
      grid.style.display = "none";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    grid.style.display = "grid";

    activities.forEach((activity) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <div class="card-top">
          <h3>${escapeHtml(activity.title)}</h3>
          ${statusBadgeHtml(activity.status)}
        </div>
        <div class="meta-row">
          <span> ${escapeHtml(activity.location)}</span>
          <span> ${formatDateTime(activity.date)}</span>
          <span> ${escapeHtml(activity.category)}</span>
          <span> Up to ${activity.max_participants} participants</span>
        </div>
      `;
      card.addEventListener("click", () => {
        window.location.href = `activity-detail.html?id=${activity.id}`;
      });
      grid.appendChild(card);
    });
  }

  async function loadActivities(filters = {}) {
    hideError();
    loadingMsg.style.display = "block";
    grid.style.display = "none";
    emptyState.style.display = "none";

    try {
      const activities = await CircleUpAPI.listActivities(filters);
      renderActivities(activities);
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

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const category = document.getElementById("filter-category").value.trim();
    const location = document.getElementById("filter-location").value.trim();
    const sort = document.getElementById("filter-sort").value;
    loadActivities({
      category: category || undefined,
      location: location || undefined,
      sort,
    });
  });

  clearBtn.addEventListener("click", () => {
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-location").value = "";
    document.getElementById("filter-sort").value = "asc";
    loadActivities();
  });

  logoutBtn.addEventListener("click", async () => {
    try {
      await CircleUpAPI.logout();
    } catch (_) {
      // Logout is client-side regardless of whether this call succeeds.
    }
    Auth.clearToken();
    window.location.href = "login.html";
  });

  loadActivities();
});