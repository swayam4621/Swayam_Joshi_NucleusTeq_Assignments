const STATUS_LABELS = {
  open: "Open",
  full: "Full",
  cancelled: "Cancelled",
  completed: "Completed",
};

function statusBadgeHtml(status) {
  const label = STATUS_LABELS[status] || status;
  return `<span class="status-badge status-${status}">${label}</span>`;
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}