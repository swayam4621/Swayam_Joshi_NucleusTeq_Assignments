import { CircleUpAPI } from "../api.js";
import { state } from "./state.js";
import { 
  showMessage, 
  openModal, 
  closeModal, 
  formatDateTime, 
  localDateTimeInputToIso, 
  isoToLocalDateTimeInput, 
  getMinDateTime, 
  getCategoryValue, 
  applyCategoryToForm 
} from "./dom-utils.js";
import { switchView } from "./navigation.js";
import { openRequestsModal, openActivityDetailsModal, loadMyActivities } from "./participation.js";

export function createEventCard(act, context) {
  const card = document.createElement("div");
  card.className = "event-card card-clickable"; 

  const header = document.createElement("div"); 
  header.className = "event-card-header";
  
  const title = document.createElement("h3"); 
  title.className = "event-card-title"; 
  title.textContent = act.title;
  
  const badge = document.createElement("span"); 
  badge.className = `status-badge status-${act.status.toLowerCase()}`; 
  badge.textContent = act.status;
  
  header.append(title, badge);

  const meta = document.createElement("div"); 
  meta.className = "event-meta";
  
  const loc = document.createElement("span");
  const locIcon = document.createElement("i");
  locIcon.className = "fa-solid fa-location-dot";
  loc.append(locIcon, ` ${act.location}`);
  
  const date = document.createElement("span");
  const dateIcon = document.createElement("i");
  dateIcon.className = "fa-regular fa-calendar";
  date.append(dateIcon, ` ${formatDateTime(act.date)}`);
  
  const capacity = document.createElement("span");
  const capIcon = document.createElement("i");
  capIcon.className = "fa-solid fa-user-group";
  capacity.append(capIcon, ` ${act.approved_count || 0} / ${act.max_participants}`);
  
  meta.append(loc, date, capacity);

  const actions = document.createElement("div"); 
  actions.className = "event-actions";

  if (state.currentUser && act.creator_id === state.currentUser.id && context === "created") {
    if (act.status.toUpperCase() !== "CANCELLED") {
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-secondary btn-small"; 
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        setupEditModal(act); 
      });
      actions.appendChild(editBtn);

      const reqBtn = document.createElement("button");
      if (act.pending_request_count > 0) {
        reqBtn.className = "btn btn-small"; 
        reqBtn.textContent = `Manage (${act.pending_request_count})`;
      } else {
        reqBtn.className = "btn btn-secondary btn-small"; 
        reqBtn.textContent = `Manage Requests`;
      }
      reqBtn.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        openRequestsModal(act); 
      });
      actions.appendChild(reqBtn);

      if (act.status.toUpperCase() !== "COMPLETED") {
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-small btn-danger"; // Replaced inline danger styles
        cancelBtn.textContent = "Cancel Activity";
        cancelBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (confirm("Are you sure you want to cancel this activity? This cannot be undone.")) {
            try {
              await CircleUpAPI.cancelActivity(act.id);
              loadMyActivities(); 
            } catch (err) {
              alert("Failed to cancel activity: " + err.message);
            }
          }
        });
        actions.appendChild(cancelBtn);
      }
    } else {
      actions.classList.add("hidden");
    }
  } else {
    const reqStatus = act.user_request_status ? act.user_request_status.toLowerCase() : null;
    if (reqStatus) {
      const statusBadge = document.createElement("span");
      statusBadge.className = `status-badge ${reqStatus} right-margin`;
      
      if (reqStatus === 'rejected') statusBadge.textContent = "Request Denied";
      else if (reqStatus === 'approved') statusBadge.textContent = "Joined";
      else if (reqStatus === 'pending') statusBadge.textContent = "Pending";
      
      actions.appendChild(statusBadge);
    }

    const viewBtn = document.createElement("button"); 
    viewBtn.className = "btn btn-secondary btn-small";
    viewBtn.textContent = "View Details";
    actions.appendChild(viewBtn);
  }

  card.append(header, meta, actions);
  card.addEventListener("click", () => openActivityDetailsModal(act));
  return card;
}

export async function loadBrowseActivities(appliedFilters = {}) {
  const grid = document.getElementById("grid-browse");
  const loader = document.getElementById("browse-loading");
  
  grid.replaceChildren();
  loader.classList.remove("hidden");

  try {
    const rawActivities = await CircleUpAPI.listActivities(appliedFilters);
    const activities = rawActivities.filter(act => act.status.toUpperCase() === "OPEN");
    
    if (activities.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.textContent = "No activities found matching your criteria.";
      grid.appendChild(emptyState);
    } else {
      activities.forEach(act => grid.appendChild(createEventCard(act, "browse")));
    }
  } catch (err) {
    console.error(err);
    showMessage("Could not load activities", true);
  } finally {
    loader.classList.add("hidden");
  }
}

export function setupEditModal(act) {
  document.getElementById("edit-id").value = act.id;
  document.getElementById("edit-title").value = act.title;
  document.getElementById("edit-description").value = act.description || "";
  applyCategoryToForm("edit-category", "edit-category-other", act.category);
  document.getElementById("edit-location").value = act.location;
  
  const editDateInput = document.getElementById("edit-date");
  editDateInput.value = isoToLocalDateTimeInput(act.date);
  editDateInput.min = getMinDateTime(); 
  
  document.getElementById("edit-max").value = act.max_participants;
  openModal(document.getElementById("modal-edit"));
}

export function initActivities() {
  document.getElementById("btn-apply-filters").addEventListener("click", () => {
    const filters = {
      category: document.getElementById("filter-category").value,
      location: document.getElementById("filter-location").value,
      date_from: document.getElementById("filter-date-from").value,
      date_to: document.getElementById("filter-date-to").value,
      sort: document.getElementById("filter-sort").value
    };
    
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });
    loadBrowseActivities(filters);
  });

  document.getElementById("btn-clear-filters").addEventListener("click", () => {
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-location").value = "";
    document.getElementById("filter-date-from").value = "";
    document.getElementById("filter-date-to").value = "";
    document.getElementById("filter-sort").value = "asc";
    loadBrowseActivities();
  });

  document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const isoDate = localDateTimeInputToIso(document.getElementById("create-date").value);
    const maxPart = parseInt(document.getElementById("create-max").value, 10);
    const btn = document.getElementById("btn-submit-create");
    const title = document.getElementById("create-title").value.trim();
    const category = getCategoryValue("create-category", "create-category-other");

    if (title.length < 3) return showMessage("Title must be at least 3 characters.", true);
    if (!category) return showMessage("Please choose or enter a category.", true);
    if (!location) return showMessage("Please select a location.", true);
    if (!Number.isInteger(maxPart) || maxPart < 1) {
      const hint = document.getElementById("create-max-hint");
      hint.textContent = "Must be a whole number greater than 0.";
      hint.className = "field-error";
      return;
    }

    const payload = {
      title,
      description: document.getElementById("create-description").value.trim() || null,
      category,
      location: document.getElementById("create-location").value.trim(),
      date: isoDate,
      max_participants: maxPart
    };

    btn.disabled = true; 
    btn.textContent = "Creating...";
    try {
      await CircleUpAPI.createActivity(payload);
      document.getElementById("create-form").reset();
      switchView("my-activities");
      showMessage("Activity created successfully!", false);
    } catch(err) {
      showMessage(err.message, true);
    } finally {
      btn.disabled = false; 
      btn.textContent = "Create Activity";
    }
  });

  document.getElementById("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const actId = document.getElementById("edit-id").value;
    const isoDate = localDateTimeInputToIso(document.getElementById("edit-date").value);
    const btn = document.getElementById("btn-submit-edit");
    const title = document.getElementById("edit-title").value.trim();
    const category = getCategoryValue("edit-category", "edit-category-other");
    const editMaxPart = parseInt(document.getElementById("edit-max").value, 10);

    if (title.length < 3) return showMessage("Title must be at least 3 characters.", true, document.getElementById("edit-alert"));
    if (!category) return showMessage("Please choose or enter a category.", true, document.getElementById("edit-alert"));
    if (!Number.isInteger(editMaxPart) || editMaxPart < 1) {
      const hint = document.getElementById("edit-max-hint");
      hint.textContent = "Must be a whole number greater than 0.";
      hint.className = "field-error";
      return;
    }

    const payload = {
      title,
      description: document.getElementById("edit-description").value.trim() || null,
      category,
      location: document.getElementById("edit-location").value.trim(),
      date: isoDate,
      max_participants: editMaxPart
    };

    btn.disabled = true; 
    btn.textContent = "Saving...";
    try {
      await CircleUpAPI.updateActivity(actId, payload);
      closeModal();
      loadMyActivities();
      showMessage("Activity updated!", false);
    } catch(err) {
      showMessage(err.message, true, document.getElementById("edit-alert"));
    } finally {
      btn.disabled = false; 
      btn.textContent = "Save Changes";
    }
  });
}