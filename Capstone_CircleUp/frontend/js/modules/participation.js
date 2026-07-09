import { CircleUpAPI } from "../api.js";
import { state } from "./state.js";
import { showMessage, openModal, formatDateTime } from "./dom-utils.js";
import { createEventCard, loadBrowseActivities } from "./activities.js";

export function openActivityDetailsModal(act) {
  state.currentActivityForModal = act;
  state.requestCounter = 1;
  document.getElementById("counter-value").textContent = state.requestCounter;

  document.getElementById("detail-title").textContent = act.title;
  
  const badge = document.getElementById("detail-badge");
  badge.className = `status-badge status-${act.status.toLowerCase()}`;
  badge.textContent = act.status;

  // populate the meta information section
  const metaContainer = document.getElementById("detail-meta");
  metaContainer.replaceChildren();
  
  const locSpan = document.createElement("span");
  locSpan.textContent = ` ${act.location}`;
  const dateSpan = document.createElement("span");
  dateSpan.textContent = ` ${formatDateTime(act.date)}`;
  const catSpan = document.createElement("span");
  catSpan.textContent = ` ${act.category}`;
  const partSpan = document.createElement("span");
  partSpan.textContent = ` ${act.approved_count || 0} / ${act.max_participants} Participants`;
  
  metaContainer.append(locSpan, dateSpan, catSpan, partSpan);

  document.getElementById("detail-desc").textContent = act.description || "No description provided.";

  const joinSection = document.getElementById("detail-join-section");
  const statusMsg = document.getElementById("detail-status-message");
  const contactInfoBox = document.getElementById("activity-contact-info");
  const contactPhoneSpan = document.getElementById("detail-contact-phone");

  joinSection.classList.add("hidden");
  statusMsg.classList.add("hidden");
  contactInfoBox.classList.add("hidden");
  statusMsg.replaceChildren(); 
  if (!state.currentUser) {
    const textPre = document.createTextNode("Please ");
    const loginLink = document.createElement("a");
    loginLink.href = "#";
    loginLink.id = "prompt-login-link";
    loginLink.className = "link-accent";
    loginLink.textContent = "log in";
    const textPost = document.createTextNode(" to join this activity.");
    
    statusMsg.append(textPre, loginLink, textPost);
    statusMsg.classList.remove("hidden");
    joinSection.classList.add("hidden");

    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(document.getElementById("modal-login"));
    });

  } else if (act.creator_id === state.currentUser.id) {
    statusMsg.textContent = "You are the organizer of this activity.";
    statusMsg.classList.remove("hidden");
    joinSection.classList.add("hidden");

  } else if (act.user_request_status?.toLowerCase() === "approved") {
    statusMsg.textContent = "You are approved to join this activity!";
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
    const rejectedBadgeSpan = document.createElement("span");
    rejectedBadgeSpan.className = "text-danger font-bold";
    rejectedBadgeSpan.textContent = "Request Denied: ";
    const rejectedText = document.createTextNode("You've been denied from joining this activity.");
    
    statusMsg.append(rejectedBadgeSpan, rejectedText);
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

  openModal(document.getElementById("modal-activity-details"));
}

export async function loadMyActivities() {
  const gridCreated = document.getElementById("grid-created");
  const gridJoined = document.getElementById("grid-joined");
  const gridPending = document.getElementById("grid-pending");
  const gridRejected = document.getElementById("grid-rejected");
  const loader = document.getElementById("my-activities-loading");

  gridCreated.replaceChildren();
  gridJoined.replaceChildren();
  gridPending.replaceChildren();
  gridRejected.replaceChildren();
  loader.classList.remove("hidden");

  try {
    const activities = await CircleUpAPI.listActivities();
    const created = activities.filter((a) => a.creator_id === state.currentUser?.id);
    const joined = activities.filter(
      (a) => a.creator_id !== state.currentUser?.id && String(a.user_request_status).toLowerCase() === "approved"
    );
    const pending = activities.filter(
      (a) => a.creator_id !== state.currentUser?.id && String(a.user_request_status).toLowerCase() === "pending"
    );
    const rejected = activities.filter(
      (a) => a.creator_id !== state.currentUser?.id && String(a.user_request_status).toLowerCase() === "rejected"
    );

    const buildGrid = (gridEl, items, context) => {
      if (items.length === 0) {
        const p = document.createElement("p");
        p.textContent = "Nothing to show here.";
        gridEl.appendChild(p);
      } else {
        items.forEach((act) => gridEl.appendChild(createEventCard(act, context)));
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

export async function openRequestsModal(act) {
  const list = document.getElementById("requests-list");
  const appList = document.getElementById("approved-list");

  list.replaceChildren();
  appList.replaceChildren();

  const loadingText = document.createElement("p");
  loadingText.textContent = "Loading requests...";
  list.appendChild(loadingText);
  
  openModal(document.getElementById("modal-requests"));

  try {
    const requests = await CircleUpAPI.listActivityRequests(act.id);
    list.replaceChildren();
    appList.replaceChildren();

    if (requests.length === 0) {
      const emptyPending = document.createElement("p");
      emptyPending.textContent = "No pending requests.";
      list.appendChild(emptyPending);
      
      const emptyApproved = document.createElement("p");
      emptyApproved.className = "text-muted";
      emptyApproved.textContent = "No approved participants yet.";
      appList.appendChild(emptyApproved);
      return;
    }

    let hasPending = false;
    let hasApproved = false;

    requests.forEach((req) => {
      const isApproved = req.status.toLowerCase() === "approved";
      const reqCount = req.participant_count || 1;
      const userName = req.requester_name || req.requester?.full_name || "User";

      const reqDiv = document.createElement("div");
      reqDiv.className = "req-item";

      if (isApproved) {
        hasApproved = true;
        const userPhone = req.requester_phone || "No phone provided";
        
        const innerFlex = document.createElement("div");
        innerFlex.className = "flex-between";

        const nameLabel = document.createElement("strong");
        nameLabel.textContent = `${userName} (${reqCount} joining)`;

        const phoneLabel = document.createElement("span");
        phoneLabel.className = "text-success font-bold";
        phoneLabel.textContent = userPhone;

        innerFlex.append(nameLabel, phoneLabel);
        reqDiv.appendChild(innerFlex);
        appList.appendChild(reqDiv);
      } else if (req.status.toLowerCase() === "pending") {
        hasPending = true;
        
        const descText = document.createElement("p");
        descText.className = "mb-05";
        
        const nameStrong = document.createElement("strong");
        nameStrong.textContent = userName;
        
        const joinText = document.createTextNode(` wants to join (${reqCount} participants).`);
        descText.append(nameStrong, joinText);

        const btnDiv = document.createElement("div");
        btnDiv.className = "btn-group-sm mt-05";

        const appBtn = document.createElement("button");
        appBtn.className = "btn btn-small";
        appBtn.textContent = "Approve";
        appBtn.addEventListener("click", async () => {
          try {
            await CircleUpAPI.approveParticipationRequest(req.id);
            reqDiv.replaceChildren();
            const successSpan = document.createElement("span");
            successSpan.className = "text-success";
            successSpan.textContent = "Approved!";
            reqDiv.appendChild(successSpan);
            loadMyActivities();
          } catch (e) {
            alert(e.message);
          }
        });

        const rejBtn = document.createElement("button");
        rejBtn.className = "btn btn-secondary btn-small";
        rejBtn.textContent = "Reject";
        rejBtn.addEventListener("click", async () => {
          try {
            await CircleUpAPI.rejectParticipationRequest(req.id);
            reqDiv.replaceChildren();
            const dangerSpan = document.createElement("span");
            dangerSpan.className = "text-danger";
            dangerSpan.textContent = "Rejected";
            reqDiv.appendChild(dangerSpan);
            loadMyActivities();
          } catch (e) {
            alert(e.message);
          }
        });

        btnDiv.append(appBtn, rejBtn);
        reqDiv.append(descText, btnDiv);
        list.appendChild(reqDiv);
      }
    });

    if (!hasPending) {
      const emptyPending = document.createElement("p");
      emptyPending.className = "text-muted";
      emptyPending.textContent = "No pending requests.";
      list.appendChild(emptyPending);
    }
    
    if (!hasApproved) {
      const emptyApproved = document.createElement("p");
      emptyApproved.className = "text-muted";
      emptyApproved.textContent = "No approved participants yet.";
      appList.appendChild(emptyApproved);
    }
  } catch (e) {
    const errText = document.createElement("p");
    errText.textContent = "Error loading requests.";
    list.appendChild(errText);
  }
}

export function initParticipation() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.add("hidden"));

      e.target.classList.add("active");
      const tabId = e.target.getAttribute("data-tab");
      document.getElementById(`tab-${tabId}`).classList.remove("hidden");
    });
  });

  document.getElementById("counter-plus").addEventListener("click", () => {
    if (!state.currentActivityForModal) return;
    const spotsLeft = state.currentActivityForModal.max_participants - (state.currentActivityForModal.approved_count || 0);
    if (state.requestCounter < spotsLeft) {
      state.requestCounter++;
      document.getElementById("counter-value").textContent = state.requestCounter;
    }
  });

  document.getElementById("counter-minus").addEventListener("click", () => {
    if (state.requestCounter > 1) {
      state.requestCounter--;
      document.getElementById("counter-value").textContent = state.requestCounter;
    }
  });

  document.getElementById("btn-submit-join").addEventListener("click", async () => {
    const btn = document.getElementById("btn-submit-join");
    btn.disabled = true;
    btn.textContent = "Sending...";
    try {
      await CircleUpAPI.requestParticipation(state.currentActivityForModal.id, state.requestCounter);
      showMessage("Request sent successfully!", false, document.getElementById("join-alert"));
      setTimeout(() => {
        document.getElementById("modal-overlay").classList.add("hidden");
        loadBrowseActivities();
        btn.disabled = false;
        btn.textContent = "Request to Join";
      }, 1500);
    } catch (err) {
      showMessage(err.message, true, document.getElementById("join-alert"));
      btn.disabled = false;
      btn.textContent = "Request to Join";
    }
  });
}