import { CATEGORIES, state } from "./state.js";

export function populateCategorySelect(selectEl, { includeAllOption = false } = {}) {
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

export function showMessage(msg, isError = true, targetElement = document.getElementById("global-alert")) {
  targetElement.textContent = msg;
  targetElement.className = `alert ${isError ? "alert-error" : "alert-success"}`;
  targetElement.classList.remove("hidden");
  if (!isError) setTimeout(() => targetElement.classList.add("hidden"), 4000);
}

export function openModal(modalEl) {
  document.querySelectorAll(".modal-box").forEach((m) => m.classList.add("hidden"));
  document.querySelectorAll(".alert").forEach((a) => a.classList.add("hidden"));
  document.getElementById("modal-overlay").classList.remove("hidden");
  modalEl.classList.remove("hidden");
}

export function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  state.currentActivityForModal = null;
}

export function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function localDateTimeInputToIso(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function isoToLocalDateTimeInput(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function getMinDateTime() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Category select and freetext Others field
export function setupCategoryToggle(selectId, otherId) {
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

export function getCategoryValue(selectId, otherId) {
  const select = document.getElementById(selectId);
  const other = document.getElementById(otherId);
  if (select.value === "Others") return other.value.trim();
  return select.value;
}

export function applyCategoryToForm(selectId, otherId, category) {
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

// live "at least 3 characters" hint for title/name fields
export function setupTitleLiveHint(inputId, hintId) {
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

// live "must be at least 1" hint for max-participants fields
export function setupMaxParticipantsLiveHint(inputId, hintId) {
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