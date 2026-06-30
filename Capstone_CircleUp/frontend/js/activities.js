document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const grid = document.getElementById("activity-grid");
  const emptyState = document.getElementById("empty-state");
  const loadingMsg = document.getElementById("loading-msg");
  const filterForm = document.getElementById("filter-form");
  const clearBtn = document.getElementById("clear-filters-btn");
  let currentUser = null;

  async function loadActivities(filters = {}) {
    loadingMsg.classList.remove("hidden");
    grid.classList.add("hidden");
    emptyState.classList.add("hidden");

    try {
      if (!currentUser) currentUser = await CircleUpAPI.getCurrentUser();
      const activities = await CircleUpAPI.listActivities(filters);
      
      // Clear the grid using pure JS
      grid.replaceChildren();
      
      if (activities.length === 0) {
        emptyState.classList.remove("hidden");
      } else {
        activities.forEach((act) => {
          const isOwner = act.creator_id === currentUser.id;
          
          // 1. Create Card Container
          const card = document.createElement("div");
          card.className = "event-card";

          // 2. Create Header
          const header = document.createElement("div");
          header.className = "event-card-header";
          
          const title = document.createElement("h3");
          title.className = "event-card-title";
          title.textContent = act.title;

          const badge = document.createElement("span");
          badge.className = `status-badge status-${act.status}`;
          // Assumes STATUS_LABELS is available from activity-helpers.js
          badge.textContent = window.STATUS_LABELS ? (window.STATUS_LABELS[act.status] || act.status) : act.status;
          
          header.append(title, badge);

          // 3. Create Meta Section
          const meta = document.createElement("div");
          meta.className = "event-meta";
          
          const locSpan = document.createElement("span");
          locSpan.textContent = `Location: ${act.location}`;
          
          const dateSpan = document.createElement("span");
          dateSpan.textContent = `Date: ${formatDateTime(act.date)}`;
          
          const catSpan = document.createElement("span");
          catSpan.textContent = `Category: ${act.category}`;
          
          const maxSpan = document.createElement("span");
          maxSpan.textContent = `Max Participants: ${act.max_participants}`;
          
          meta.append(locSpan, dateSpan, catSpan, maxSpan);
          
          // 4. Create Expand Actions
          const actions = document.createElement("div");
          actions.className = "event-actions";
          
          const expandBtn = document.createElement("button");
          expandBtn.className = "btn btn-secondary";
          expandBtn.textContent = "Expand Details";
          
          actions.append(expandBtn);

          // 5. Create Expanded Details Section
          const detailsPanel = document.createElement("div");
          detailsPanel.className = "event-details hidden";
          
          const desc = document.createElement("p");
          desc.className = "event-desc";
          desc.textContent = act.description || "No description provided.";
          
          const actionContainer = document.createElement("div");
          actionContainer.className = "mt-1 action-container";
          
          const statusMsg = document.createElement("div");
          statusMsg.className = "join-status-msg text-muted";
          
          detailsPanel.append(desc, actionContainer, statusMsg);

          // Assemble the card
          card.append(header, meta, actions, detailsPanel);

          // 6. Bind Events
          expandBtn.addEventListener('click', () => {
            detailsPanel.classList.toggle('hidden');
            expandBtn.textContent = detailsPanel.classList.contains('hidden') ? "Expand Details" : "Hide Details";
          });

          if (isOwner) {
            const updateBtn = document.createElement("button");
            updateBtn.className = "btn";
            updateBtn.textContent = "Update / Manage";
            updateBtn.addEventListener('click', () => {
               window.location.href = `activity-detail.html?id=${act.id}`;
            });
            actionContainer.appendChild(updateBtn);
          } else {
             const joinBtn = document.createElement("button");
             joinBtn.className = "btn";
             joinBtn.textContent = "Request to Join";
             
             if (act.status !== 'open') {
                 joinBtn.disabled = true;
             }

             if (act.user_request_status) {
                 statusMsg.textContent = `You have already requested this activity. Status: ${act.user_request_status}`;
             } else {
                 actionContainer.appendChild(joinBtn);
             }
             
             joinBtn.addEventListener('click', async () => {
                joinBtn.disabled = true;
                joinBtn.textContent = "Requesting...";
                try {
                  await CircleUpAPI.requestParticipation(act.id);
                  joinBtn.classList.add("hidden");
                  statusMsg.textContent = "Success! Your join request is pending approval.";
                  statusMsg.classList.add("text-success");
                  statusMsg.classList.remove("text-muted", "text-danger");
                } catch (err) {
                  statusMsg.textContent = err.message;
                  statusMsg.classList.add("text-danger");
                  statusMsg.classList.remove("text-muted", "text-success");
                  joinBtn.disabled = false;
                  joinBtn.textContent = "Request to Join";
                }
             });
          }

          grid.appendChild(card);
        });
        grid.classList.remove("hidden");
      }
    } catch (err) {
      if (err.status === 401) {
        Auth.clearToken();
        window.location.href = "login.html";
      }
    } finally {
      loadingMsg.classList.add("hidden");
    }
  }

  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loadActivities({
      category: document.getElementById("filter-category").value.trim() || undefined,
      location: document.getElementById("filter-location").value.trim() || undefined,
      sort: document.getElementById("filter-sort").value
    });
  });

  clearBtn.addEventListener("click", () => {
    filterForm.reset();
    loadActivities();
  });

  document.getElementById("logout-btn").addEventListener("click", async () => {
    try { await CircleUpAPI.logout(); } catch (_) {}
    Auth.clearToken();
    window.location.href = "login.html";
  });

  loadActivities();
});