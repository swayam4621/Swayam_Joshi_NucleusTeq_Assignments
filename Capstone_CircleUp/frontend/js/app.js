document.addEventListener("DOMContentLoaded", () => {
  const CATEGORIES = ["Sports", "Meetups", "Hobbies", "Music", "Others"];

  function populateCategorySelect(selectEl, { includeAllOption = false } = {}) {
    selectEl.innerHTML = "";
    if (includeAllOption) {
      const allOpt = document.createElement("option");
      allOpt.value = "";
      allOpt.textContent = "All Categories";
      selectEl.appendChild(allOpt);
    } else {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.disabled = true;
      placeholder.selected = true;
      placeholder.textContent = "Select a category";
      selectEl.appendChild(placeholder);
    }
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      selectEl.appendChild(opt);
    });
  }

  //  DOM elements
  const navLoggedIn = document.getElementById("nav-logged-in");
  const authLoggedOut = document.getElementById("auth-actions-logged-out");
  const authLoggedIn = document.getElementById("auth-actions-logged-in");
  
  const modalOverlay = document.getElementById("modal-overlay");
  const modalLogin = document.getElementById("modal-login");
  const modalRegister = document.getElementById("modal-register");
  const modalEdit = document.getElementById("modal-edit");
  const modalRequests = document.getElementById("modal-requests");
  const modalActivityDetails = document.getElementById("modal-activity-details");
  
  const globalAlert = document.getElementById("global-alert");
  
  const views = {
    "browse": document.getElementById("view-browse"),
    "create": document.getElementById("view-create"),
    "my-activities": document.getElementById("view-my-activities"),
    "profile": document.getElementById("view-profile")
  };

  let currentUser = null;
  let currentActivityForModal = null;
  let requestCounter = 1;

  async function init() {
    populateCategorySelect(document.getElementById("filter-category"), { includeAllOption: true });
    populateCategorySelect(document.getElementById("create-category"));
    populateCategorySelect(document.getElementById("edit-category"));
    document.getElementById("create-date").min = getMinDateTime();
    if (Auth.isLoggedIn()) {
      try {
        currentUser = await CircleUpAPI.getCurrentUser();
        setAuthState(true);
        switchView("browse");
      } catch (err) {
        Auth.clearToken();
        setAuthState(false);
        switchView("browse");
      }
    } else {
      setAuthState(false);
      switchView("browse");
    }
  }

  function setAuthState(isLoggedIn) {
    if (isLoggedIn) {
      navLoggedIn.classList.remove("hidden");
      authLoggedIn.classList.remove("hidden");
      authLoggedOut.classList.add("hidden");
    } else {
      navLoggedIn.classList.add("hidden");
      authLoggedIn.classList.add("hidden");
      authLoggedOut.classList.remove("hidden");
      currentUser = null;
    }
  }

  function switchView(viewName) {
    Object.values(views).forEach(v => v.classList.add("hidden"));
    document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
    
    views[viewName].classList.remove("hidden");
    const activeBtn = document.querySelector(`.nav-btn[data-target="view-${viewName}"]`);
    if(activeBtn) activeBtn.classList.add("active");

    if (viewName === "browse") loadBrowseActivities();
    if (viewName === "my-activities") loadMyActivities();
    if (viewName === "profile") loadProfile();
  }

  function showMessage(msg, isError = true, targetElement = globalAlert) {
    targetElement.textContent = msg;
    targetElement.className = `alert ${isError ? 'alert-error' : 'alert-success'}`;
    targetElement.classList.remove("hidden");
    if (!isError) setTimeout(() => targetElement.classList.add("hidden"), 4000);
  }

  function openModal(modalEl) {
    document.querySelectorAll(".modal-box").forEach(m => m.classList.add("hidden"));
    document.querySelectorAll(".alert").forEach(a => a.classList.add("hidden"));
    modalOverlay.classList.remove("hidden");
    modalEl.classList.remove("hidden");
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
    currentActivityForModal = null;
  }

  document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", closeModal);
  });

  document.getElementById("btn-show-login").addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modalLogin)
  });
  document.getElementById("link-to-register").addEventListener("click", (e) => { e.preventDefault(); openModal(modalRegister); });
  document.getElementById("link-to-login").addEventListener("click", (e) => { e.preventDefault(); openModal(modalLogin); });

  document.getElementById("nav-brand").addEventListener("click", (e) => { e.preventDefault(); switchView("browse"); });
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = e.target.getAttribute("data-target").replace("view-", "");
      switchView(target);
    });
  });

  document.getElementById("btn-logout").addEventListener("click", async () => {
    try { await CircleUpAPI.logout(); } catch (_) {}
    Auth.clearToken();
    setAuthState(false);
    switchView("browse");
  });

  //  Auth Forms 
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const btn = document.getElementById("btn-submit-login");
    btn.disabled = true; btn.textContent = "Logging in...";
    
    try {
      const result = await CircleUpAPI.login(email, password);
      Auth.setToken(result.access_token);
      currentUser = await CircleUpAPI.getCurrentUser();
      closeModal();
      setAuthState(true);
      document.getElementById("login-form").reset();
      switchView("browse");
    } catch (err) {
      showMessage(err.message, true, document.getElementById("login-alert"));
    } finally {
      btn.disabled = false; btn.textContent = "Log In";
    }
  });

  document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const phone_number = document.getElementById("register-phone").value.trim();
    const city = document.getElementById("register-city").value;
    const bio = document.getElementById("register-bio").value.trim();
    
    const btn = document.getElementById("btn-submit-register");
    const alertBox = document.getElementById("register-alert");

    // frontend password validation
    const emailRegex = /^[a-zA-Z0-9_.+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    const phoneRegex = /^\d{10}$/;
    
    if (name.length < 3) {
    return showMessage("Name must be at least 3 characters long.", true, alertBox);
    }
    if (!emailRegex.test(email)) {
      return showMessage("Email must be a @gmail.com address.", true, alertBox);
    }
    if (!passwordRegex.test(password)) {
      return showMessage("Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 special character.", true, alertBox);
    }
    if (!phoneRegex.test(phone_number)) {
      return showMessage("Phone number must be exactly 10 digits.", true, alertBox);
    }
    
    btn.disabled = true; btn.textContent = "Signing up...";
    try {
      await CircleUpAPI.register({ name, email, password, phone_number, city, bio });
      document.getElementById("register-form").reset();
      openModal(modalLogin);
      showMessage("Account created! Please log in.", false, document.getElementById("login-alert"));
    } catch (err) {
      showMessage(err.message, true, alertBox);
    } finally {
      btn.disabled = false; btn.textContent = "Sign Up";
    }
  });

  // Helpers
  function formatDateTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function localDateTimeInputToIso(value) {
    if (!value) return null;
    return new Date(value).toISOString();
  }
  function isoToLocalDateTimeInput(isoString) {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function getMinDateTime() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function setupCategoryToggle(selectId, otherId) {
    const select = document.getElementById(selectId);
    const other = document.getElementById(otherId);
    select.addEventListener("change", () => {
      if (select.value === "Others") {
        other.classList.remove("hidden");
        other.required = true;
      } else {
        other.classList.add("hidden");
        other.required = false;
        other.value = "";
      }
    });
  }
  setupCategoryToggle("create-category", "create-category-other");
  setupCategoryToggle("edit-category", "edit-category-other");

  function getCategoryValue(selectId, otherId) {
    const select = document.getElementById(selectId);
    const other = document.getElementById(otherId);
    if (select.value === "Others") return other.value.trim();
    return select.value;
  }

  function applyCategoryToForm(selectId, otherId, category) {
    const select = document.getElementById(selectId);
    const other = document.getElementById(otherId);
    const known = Array.from(select.options).some((o) => o.value === category);
    if (known) {
      select.value = category;
      other.classList.add("hidden");
      other.required = false;
      other.value = "";
    } else {
      select.value = "Others";
      other.classList.remove("hidden");
      other.required = true;
      other.value = category;
    }
  }

  //at least 3 characters for title fields
  function setupTitleLiveHint(inputId, hintId) {
    const input = document.getElementById(inputId);
    const hint = document.getElementById(hintId);
    input.addEventListener("input", () => {
      const len = input.value.trim().length;
      if (len === 0) {
        hint.textContent = "At least 3 characters.";
        hint.className = "field-hint";
      } else if (len < 3) {
        hint.textContent = `At least 3 characters (${len}/3).`;
        hint.className = "field-error";
      } else {
        hint.textContent = "Looks good.";
        hint.className = "field-hint";
      }
    });
  }
  setupTitleLiveHint("create-title", "create-title-hint");
  setupTitleLiveHint("edit-title", "edit-title-hint");
  setupTitleLiveHint("register-name", "register-name-hint");

  function setupMaxParticipantsLiveHint(inputId, hintId) {
  const input = document.getElementById(inputId);
  const hint = document.getElementById(hintId);
  input.addEventListener("input", () => {
    const raw = input.value;
    const n = parseInt(raw, 10);
    if (raw === "") {
      hint.textContent = "Must be at least 1.";
      hint.className = "field-hint";
    } else if (!Number.isInteger(n) || n < 1) {
      hint.textContent = "Must be a whole number greater than 0.";
      hint.className = "field-error";
    } else {
      hint.textContent = "Looks good.";
      hint.className = "field-hint";
    }
  });
}
setupMaxParticipantsLiveHint("create-max", "create-max-hint");
setupMaxParticipantsLiveHint("edit-max", "edit-max-hint");

  const passwordInput = document.getElementById("register-password");
  const passwordRequirementItems = document.querySelectorAll("#password-requirements li");
  passwordInput.addEventListener("input", () => {
    const value = passwordInput.value;
    const checks = {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      special: /[^a-zA-Z0-9]/.test(value),
    };
    passwordRequirementItems.forEach((li) => {
      const rule = li.getAttribute("data-rule");
      li.classList.toggle("met", Boolean(checks[rule]));
    });
  });

  //  Card modal logic
  function createEventCard(act, context) {
    const card = document.createElement("div");
    card.className = "event-card";
    card.style.cursor = "pointer";

    const header = document.createElement("div"); header.className = "event-card-header";
    const title = document.createElement("h3"); title.className = "event-card-title"; title.textContent = act.title;
    const badge = document.createElement("span"); badge.className = `status-badge status-${act.status.toLowerCase()}`; badge.textContent = act.status;
    header.append(title, badge);

    const meta = document.createElement("div"); meta.className = "event-meta";
    const loc = document.createElement("span"); loc.textContent = ` ${act.location}`;
    const date = document.createElement("span"); date.textContent = ` ${formatDateTime(act.date)}`;
    const capacity = document.createElement("span"); capacity.textContent = ` ${act.approved_count || 0} / ${act.max_participants}`;
    meta.append(loc, date, capacity);

    const actions = document.createElement("div"); actions.className = "event-actions";
    
    //Check if user is owner to show edit or manage button 
    if (currentUser && act.creator_id === currentUser.id && context === "created") {
      
      if (act.status.toUpperCase() !== "CANCELLED") {
        
        const editBtn = document.createElement("button"); editBtn.className = "btn btn-secondary btn-small"; editBtn.textContent = "Edit";
        editBtn.addEventListener("click", (e) => { e.stopPropagation(); setupEditModal(act); });
        actions.appendChild(editBtn);

        if (act.pending_request_count > 0) {
          const reqBtn = document.createElement("button"); reqBtn.className = "btn btn-small"; reqBtn.textContent = `Manage (${act.pending_request_count})`;
          reqBtn.addEventListener("click", (e) => { e.stopPropagation(); openRequestsModal(act); });
          actions.appendChild(reqBtn);
        } else {
          const reqBtn = document.createElement("button"); reqBtn.className = "btn btn-secondary btn-small"; reqBtn.textContent = `Manage Requests`;
          reqBtn.addEventListener("click", (e) => { e.stopPropagation(); openRequestsModal(act); });
          actions.appendChild(reqBtn);
        }

        if (act.status.toUpperCase() !== "COMPLETED") {
          const cancelBtn = document.createElement("button");
          cancelBtn.className = "btn btn-small";
          cancelBtn.style.backgroundColor = "var(--color-danger)"; 
          cancelBtn.style.borderColor = "var(--color-danger)";
          cancelBtn.style.color = "white";
          cancelBtn.textContent = "Cancel Activity";
          cancelBtn.onclick = async (e) => {
            e.stopPropagation(); 
            if (confirm("Are you sure you want to cancel this activity? This cannot be undone.")) {
              try {
                await CircleUpAPI.cancelActivity(act.id);
                loadMyActivities(); 
              } catch (err) {
                alert("Failed to cancel activity: " + err.message);
              }
            }
          };
          actions.appendChild(cancelBtn);
        }

      } else {
        actions.classList.add("hidden");
      }

    } else {
        // Display status badges on the card for participants
        const reqStatus = act.user_request_status ? act.user_request_status.toLowerCase() : null;
        
        if (reqStatus === 'rejected') {
            const statusBadge = document.createElement("span");
            statusBadge.className = "status-badge rejected";
            statusBadge.textContent = "Request Denied";
            statusBadge.style.marginRight = "10px";
            actions.appendChild(statusBadge);
        } else if (reqStatus === 'approved') {
            const statusBadge = document.createElement("span");
            statusBadge.className = "status-badge approved";
            statusBadge.textContent = "Joined";
            statusBadge.style.marginRight = "10px";
            actions.appendChild(statusBadge);
        } else if (reqStatus === 'pending') {
            const statusBadge = document.createElement("span");
            statusBadge.className = "status-badge pending";
            statusBadge.textContent = "Pending";
            statusBadge.style.marginRight = "10px";
            actions.appendChild(statusBadge);
        }

        const viewBtn = document.createElement("button"); viewBtn.className = "btn btn-secondary btn-small"; viewBtn.textContent = "View Details";
        actions.appendChild(viewBtn);
    }

    card.append(header, meta, actions);
    card.addEventListener("click", () => openActivityDetailsModal(act));
    return card;
  }

  function openActivityDetailsModal(act) {
    currentActivityForModal = act;
    requestCounter = 1;
    document.getElementById("counter-value").textContent = requestCounter;

    document.getElementById("detail-title").textContent = act.title;
    document.getElementById("detail-badge").className = `status-badge status-${act.status.toLowerCase()}`;
    document.getElementById("detail-badge").textContent = act.status;
    
    document.getElementById("detail-meta").innerHTML = `
      <span> ${act.location}</span>
      <span> ${formatDateTime(act.date)}</span>
      <span> ${act.category}</span>
      <span> ${act.approved_count || 0} / ${act.max_participants} Participants</span>
    `;
    
    document.getElementById("detail-desc").textContent = act.description || "No description provided.";

    const joinSection = document.getElementById("detail-join-section");
    const statusMsg = document.getElementById("detail-status-message");
    const contactInfoBox = document.getElementById("activity-contact-info");
    const contactPhoneSpan = document.getElementById("detail-contact-phone");

    joinSection.classList.add("hidden");
    statusMsg.classList.add("hidden");
    contactInfoBox.classList.add("hidden");

    if (!currentUser) {
      statusMsg.innerHTML = `Please <a href="#" id="prompt-login-link" style="color: var(--color-accent-dark); text-decoration: underline; font-weight: 600;">log in</a> to join this activity.`;
      statusMsg.classList.remove("hidden");
      joinSection.classList.add("hidden");

      document.getElementById("prompt-login-link").addEventListener("click", (e) => {
        e.preventDefault();
        openModal(modalLogin); 
      });
    } else if (act.creator_id === currentUser.id) {
      statusMsg.textContent = "You are the organizer of this activity.";
      statusMsg.classList.remove("hidden");
      joinSection.classList.add("hidden");

    } else if (act.user_request_status?.toLowerCase() === "approved") {
      const phone1 = act.contact_phone || act.organizer_phone; 
      
      if (phone1) {
        statusMsg.innerHTML = `You are approved to join this activity!<br><br><span style="color: var(--color-ink);"><strong>Organizer Contact:</strong> ${phone1}</span>`;
      } else {
        statusMsg.textContent = "You are approved to join this activity!";
      }
      
      statusMsg.classList.remove("hidden");
      joinSection.classList.add("hidden");
      contactInfoBox.classList.add("hidden");
      
      const phone = act.contact_phone || act.organizer_phone; 
      if (phone) {
        contactPhoneSpan.textContent = phone;
        contactInfoBox.classList.remove("hidden");
      }
    } else if (act.user_request_status?.toLowerCase() === "pending") {
      statusMsg.textContent = "You've already requested to join this activity.";
      statusMsg.classList.remove("hidden");
      joinSection.classList.add("hidden");
    } else if (act.user_request_status?.toLowerCase() === "rejected") {
      // Updated this line to clearly show "Request Denied"
      statusMsg.innerHTML = "<span style='color: #d32f2f; font-weight: 600;'>Request Denied:</span> You've been denied from joining this activity.";
      statusMsg.classList.remove("hidden");
      joinSection.classList.add("hidden");
    } else if (act.status.toLowerCase() !== "open") {
      statusMsg.textContent = `This activity is currently ${act.status.toLowerCase()}.`;
      statusMsg.classList.remove("hidden");
      joinSection.classList.add("hidden");
    } else {
      joinSection.classList.remove("hidden");
      statusMsg.classList.add("hidden");
    }

    openModal(modalActivityDetails);
  }

  //  Counter logic 
  document.getElementById("counter-plus").addEventListener("click", () => {
    if(!currentActivityForModal) return;
    const spotsLeft = currentActivityForModal.max_participants - (currentActivityForModal.approved_count || 0);
    if (requestCounter < spotsLeft) {
      requestCounter++;
      document.getElementById("counter-value").textContent = requestCounter;
    }
  });

  document.getElementById("counter-minus").addEventListener("click", () => {
    if (requestCounter > 1) {
      requestCounter--;
      document.getElementById("counter-value").textContent = requestCounter;
    }
  });

  document.getElementById("btn-submit-join").addEventListener("click", async () => {
    const btn = document.getElementById("btn-submit-join");
    btn.disabled = true; btn.textContent = "Sending...";
    try {
      await CircleUpAPI.requestParticipation(currentActivityForModal.id, requestCounter);
      showMessage("Request sent successfully!", false, document.getElementById("join-alert"));
      setTimeout(() => {
        closeModal();
        loadBrowseActivities();
        btn.disabled = false; 
        btn.textContent = "Request to Join";
      }, 1500);
    } catch (err) {
      showMessage(err.message, true, document.getElementById("join-alert"));
      btn.disabled = false; btn.textContent = "Request to Join";
    }
  });

  //   Activities browse
  async function loadBrowseActivities(appliedFilters = {}) {
    const grid = document.getElementById("grid-browse");
    const loader = document.getElementById("browse-loading");
    
    grid.replaceChildren();
    loader.classList.remove("hidden");

    try {
      const rawActivities = await CircleUpAPI.listActivities(appliedFilters);
      const activities = rawActivities.filter(act => act.status.toUpperCase() === "OPEN");
      
      if (activities.length === 0) {
        grid.innerHTML = "<p>No activities found matching your criteria.</p>";
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


  //  My activities 
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.add("hidden"));
      
      e.target.classList.add("active");
      const tabId = e.target.getAttribute("data-tab");
      document.getElementById(`tab-${tabId}`).classList.remove("hidden");
    });
  });

  async function loadMyActivities() {
    const gridCreated = document.getElementById("grid-created");
    const gridJoined = document.getElementById("grid-joined");
    const gridPending = document.getElementById("grid-pending");
    const gridRejected = document.getElementById("grid-rejected");
    const loader = document.getElementById("my-activities-loading");
    
    gridCreated.replaceChildren(); gridJoined.replaceChildren(); gridPending.replaceChildren();
    loader.classList.remove("hidden");

    try {
      const activities = await CircleUpAPI.listActivities();
      
      const created = activities.filter(a => a.creator_id === currentUser?.id);
      const joined = activities.filter(a => a.creator_id !== currentUser?.id && String(a.user_request_status).toLowerCase() === "approved");
      const pending = activities.filter(a => a.creator_id !== currentUser?.id && String(a.user_request_status).toLowerCase() === "pending");
      const rejected = activities.filter(a => a.creator_id !== currentUser?.id && String(a.user_request_status).toLowerCase() === "rejected");


      const buildGrid = (gridEl, items, context) => {
        if(items.length === 0) {
           const p = document.createElement("p"); p.textContent = "Nothing to show here."; gridEl.appendChild(p);
        } else {
           items.forEach(act => gridEl.appendChild(createEventCard(act, context)));
        }
      };

      buildGrid(gridCreated, created, "created");
      buildGrid(gridJoined, joined, "joined");
      buildGrid(gridPending, pending, "pending");
      buildGrid(gridRejected, rejected, "rejected");
    } catch (err) {
      console.error("Error inside loadMyActivities:", err);
      showMessage("Could not load your activities", true);
    } finally {
      loader.classList.add("hidden");
    }
  }


  //  Manage requests logic 
  async function openRequestsModal(act) {
    const list = document.getElementById("requests-list");
    const appList = document.getElementById("approved-list");
    
    list.replaceChildren();
    appList.replaceChildren();
    
    const p = document.createElement("p"); p.textContent = "Loading requests..."; list.appendChild(p);
    openModal(modalRequests);

    try {
      const requests = await CircleUpAPI.listActivityRequests(act.id);
      list.replaceChildren();
      appList.replaceChildren();

      if (requests.length === 0) {
        list.innerHTML = "<p>No pending requests.</p>";
        appList.innerHTML = "<p class='text-muted'>No approved participants yet.</p>";
        return;
      }

      let hasPending = false;
      let hasApproved = false;

      requests.forEach(req => {
        const isApproved = req.status.toLowerCase() === "approved";
        
        const reqDiv = document.createElement("div"); 
        reqDiv.style.borderBottom = "1px solid var(--color-line)";
        reqDiv.style.paddingBottom = "1rem";
        reqDiv.style.marginBottom = "1rem";
        
        const reqCount = req.participant_count || 1;

        if (isApproved) {
          hasApproved = true;
          const userPhone = req.requester_phone || "No phone provided";
          reqDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>${req.requester_name || req.requester?.full_name || "User"} (${reqCount} joining)</strong>
              <span style="color: var(--color-success); font-weight: 600;">${userPhone}</span>
            </div>
          `;
          appList.appendChild(reqDiv);
        } 
        else if (req.status.toLowerCase() === "pending") {
          hasPending = true;
          reqDiv.innerHTML = `<p style="margin-bottom:0.5rem;"><strong>${req.requester_name || req.requester?.full_name || "User"}</strong> wants to join (${reqCount} participants).</p>`;

          const btnDiv = document.createElement("div"); 
          btnDiv.style.marginTop = "0.5rem"; 
          btnDiv.style.display = "flex"; 
          btnDiv.style.gap = "0.5rem";

          const appBtn = document.createElement("button"); appBtn.className = "btn btn-small"; appBtn.textContent = "Approve";
          appBtn.addEventListener("click", async () => {
            try {
              await CircleUpAPI.approveParticipationRequest(req.id);
              reqDiv.innerHTML = `<span class="text-success">Approved!</span>`;
              loadMyActivities(); 
            } catch (e) { alert(e.message); }
          });

          const rejBtn = document.createElement("button"); rejBtn.className = "btn btn-secondary btn-small"; rejBtn.textContent = "Reject";
          rejBtn.addEventListener("click", async () => {
            try {
              await CircleUpAPI.rejectParticipationRequest(req.id);
              reqDiv.innerHTML = `<span class="text-danger">Rejected</span>`;
              loadMyActivities(); 
            } catch (e) { alert(e.message); }
          });

          btnDiv.append(appBtn, rejBtn);
          reqDiv.appendChild(btnDiv);
          list.appendChild(reqDiv);
        }
      });

      if (!hasPending) list.innerHTML = "<p class='text-muted'>No pending requests.</p>";
      if (!hasApproved) appList.innerHTML = "<p class='text-muted'>No approved participants yet.</p>";

    } catch (e) {
      list.innerHTML = "<p>Error loading requests.</p>";
    }
  }


  // Create activity logic
  document.getElementById("create-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const isoDate = localDateTimeInputToIso(document.getElementById("create-date").value);
    const maxPart = parseInt(document.getElementById("create-max").value, 10);
    const btn = document.getElementById("btn-submit-create");
    const title = document.getElementById("create-title").value.trim();
    const category = getCategoryValue("create-category", "create-category-other");

    if (title.length < 3) {
      return showMessage("Title must be at least 3 characters.", true);
    }
    if (!category) {
      return showMessage("Please choose or enter a category.", true);
    }
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

    btn.disabled = true; btn.textContent = "Creating...";
    try {
      await CircleUpAPI.createActivity(payload);
      document.getElementById("create-form").reset();
      switchView("my-activities");
      showMessage("Activity created successfully!", false);
    } catch(err) {
      showMessage(err.message, true);
    } finally {
      btn.disabled = false; btn.textContent = "Create Activity";
    }
  });


  // edit activity logic
  function setupEditModal(act) {
    document.getElementById("edit-id").value = act.id;
    document.getElementById("edit-title").value = act.title;
    document.getElementById("edit-description").value = act.description || "";
    applyCategoryToForm("edit-category", "edit-category-other", act.category);
    document.getElementById("edit-location").value = act.location;
    document.getElementById("edit-date").value = isoToLocalDateTimeInput(act.date);
    document.getElementById("edit-max").value = act.max_participants;
    const editDateInput = document.getElementById("edit-date");
    editDateInput.value = isoToLocalDateTimeInput(act.date);
    
    editDateInput.min = getMinDateTime(); 
    
    document.getElementById("edit-max").value = act.max_participants;
    openModal(modalEdit);
  }

  document.getElementById("edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const actId = document.getElementById("edit-id").value;
    const isoDate = localDateTimeInputToIso(document.getElementById("edit-date").value);
    const btn = document.getElementById("btn-submit-edit");
    const title = document.getElementById("edit-title").value.trim();
    const category = getCategoryValue("edit-category", "edit-category-other");
    const editMaxPart = parseInt(document.getElementById("edit-max").value, 10);

    if (title.length < 3) {
      return showMessage("Title must be at least 3 characters.", true, document.getElementById("edit-alert"));
    }
    if (!category) {
      return showMessage("Please choose or enter a category.", true, document.getElementById("edit-alert"));
    }
    if (!Number.isInteger(editMaxPart) || editMaxPart < 1) {
      const hint = document.getElementById("edit-max-hint");
      hint.textContent = "Must be a whole number greater than 0.";
      hint.className = "field-error";
    }

    const payload = {
      title,
      description: document.getElementById("edit-description").value.trim() || null,
      category,
      location: document.getElementById("edit-location").value.trim(),
      date: isoDate,
      max_participants: editMaxPart
    };

    btn.disabled = true; btn.textContent = "Saving...";
    try {
      await CircleUpAPI.updateActivity(actId, payload);
      closeModal();
      loadMyActivities(); 
      showMessage("Activity updated!", false);
    } catch(err) {
      showMessage(err.message, true, document.getElementById("edit-alert"));
    } finally {
      btn.disabled = false; btn.textContent = "Save Changes";
    }
  });


  // profile view logic
  async function loadProfile() {
    if(!currentUser) return;
    document.getElementById("profile-name").value = currentUser.name || "";
    document.getElementById("profile-phone").value = currentUser.phone_number || "";
    document.getElementById("profile-city").value = currentUser.city || "";
    document.getElementById("profile-bio").value = currentUser.bio || "";
  }

  document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btn-submit-profile");
    const phoneVal = document.getElementById("profile-phone").value.trim();
    
    if (phoneVal && !/^\d{10}$/.test(phoneVal)) {
      return showMessage("Phone number must be exactly 10 digits.", true);
    }
    
    const payload = {
      name: document.getElementById("profile-name").value.trim(),
      phone_number: document.getElementById("profile-phone").value.trim() || null,
      city: document.getElementById("profile-city").value.trim() || null,
      bio: document.getElementById("profile-bio").value.trim() || null,
    };

    btn.disabled = true; btn.textContent = "Saving...";
    try {
      currentUser = await CircleUpAPI.updateProfile(payload);
      showMessage("Profile updated!", false);
    } catch(err) {
      showMessage(err.message, true);
    } finally {
      btn.disabled = false; btn.textContent = "Save Changes";
    }
  });

  init();
});