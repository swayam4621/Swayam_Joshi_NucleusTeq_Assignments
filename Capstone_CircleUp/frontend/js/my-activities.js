document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) { 
    window.location.href = "login.html"; 
    return; 
  }

  const loadingMsg = document.getElementById("loading-msg");
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

  function switchTab(name) {
    Object.keys(tabs).forEach((key) => {
      if (key === name) {
        tabs[key].classList.add("active");
        panels[key].classList.remove("hidden");
      } else {
        tabs[key].classList.remove("active");
        panels[key].classList.add("hidden");
      }
    });
  }

  Object.keys(tabs).forEach(key => {
    tabs[key].addEventListener("click", () => switchTab(key));
  });

  function createActivityCard(activity, isOwner) {
    const card = document.createElement("div");
    card.className = "event-card";

    const header = document.createElement("div");
    header.className = "event-card-header";
    
    const title = document.createElement("h3");
    title.className = "event-card-title";
    title.textContent = activity.title;

    const badge = document.createElement("span");
    badge.className = `status-badge status-${activity.status}`;
    badge.textContent = window.STATUS_LABELS ? (window.STATUS_LABELS[activity.status] || activity.status) : activity.status;

    header.append(title, badge);

    const meta = document.createElement("div");
    meta.className = "event-meta";
    
    const locSpan = document.createElement("span");
    locSpan.textContent = `Location: ${activity.location}`;
    
    const dateSpan = document.createElement("span");
    dateSpan.textContent = `Date: ${formatDateTime(activity.date)}`;
    
    meta.append(locSpan, dateSpan);

    if (activity.user_request_status) {
        const reqStatusSpan = document.createElement("span");
        reqStatusSpan.textContent = `Status: ${activity.user_request_status}`;
        meta.appendChild(reqStatusSpan);
    }
    
    if (activity.pending_request_count) {
        const pendingCountSpan = document.createElement("span");
        pendingCountSpan.textContent = `Pending Requests: ${activity.pending_request_count}`;
        meta.appendChild(pendingCountSpan);
    }

    const actions = document.createElement("div");
    actions.className = "event-actions";
    
    const actionBtn = document.createElement("button");
    actionBtn.className = "btn btn-secondary action-btn";
    actionBtn.textContent = isOwner ? "Update Activity" : "View Details";
    
    actionBtn.addEventListener('click', () => {
      window.location.href = `activity-detail.html?id=${activity.id}`;
    });
    
    actions.appendChild(actionBtn);
    card.append(header, meta, actions);

    return card;
  }

  function renderGrid(grid, emptyState, activities, isOwner) {
  while (grid.firstChild) {
    grid.removeChild(grid.firstChild);
  }
  
  if (activities.length === 0) {
    grid.classList.add("hidden");
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    grid.classList.remove("hidden");
    activities.forEach(act => {
      grid.appendChild(createActivityCard(act, isOwner));
    });
  }
}

  async function loadCreatedActivities() {
    loadingMsg.classList.remove("hidden");
    try {
      const [allActivities, currentUser] = await Promise.all([
        CircleUpAPI.listActivities(),
        CircleUpAPI.getCurrentUser(),
      ]);

      const mine = allActivities.filter(a => a.creator_id === currentUser.id);
      const joined = allActivities.filter(a => a.creator_id !== currentUser.id && a.user_request_status === "approved");
      const pendingOutgoing = allActivities.filter(a => a.creator_id !== currentUser.id && a.user_request_status === "pending");
      const pendingIncoming = mine.filter(a => a.pending_request_count > 0);

      renderGrid(document.getElementById("created-grid"), document.getElementById("created-empty"), mine, true);
      renderGrid(document.getElementById("joined-grid"), document.getElementById("joined-empty"), joined, false);
      renderGrid(document.getElementById("pending-outgoing-grid"), document.getElementById("pending-outgoing-empty"), pendingOutgoing, false);
      renderGrid(document.getElementById("pending-incoming-grid"), document.getElementById("pending-incoming-empty"), pendingIncoming, true);
    } catch (err) {
      if (err.status === 401) { Auth.clearToken(); window.location.href = "login.html"; }
    } finally {
      loadingMsg.classList.add("hidden");
      switchTab("created");
    }
  }
  

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try { await CircleUpAPI.logout(); } catch (_) {}
    Auth.clearToken(); 
    window.location.href = "login.html";
  });

  loadCreatedActivities();
});