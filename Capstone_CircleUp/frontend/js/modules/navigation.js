import { loadBrowseActivities } from "./activities.js";
import { loadMyActivities } from "./participation.js";
import { loadProfile } from "./profile.js";
import { closeModal } from "./dom-utils.js";

const views = {
  browse: () => document.getElementById("view-browse"),
  create: () => document.getElementById("view-create"),
  "my-activities": () => document.getElementById("view-my-activities"),
  profile: () => document.getElementById("view-profile"),
};

export function switchView(viewName) {
  Object.keys(views).forEach((name) => views[name]().classList.add("hidden"));
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));

  views[viewName]().classList.remove("hidden");
  const activeBtn = document.querySelector(`.nav-btn[data-target="view-${viewName}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  if (viewName === "browse") loadBrowseActivities();
  if (viewName === "my-activities") loadMyActivities();
  if (viewName === "profile") loadProfile();
}

export function initNavigation() {
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  document.getElementById("nav-brand").addEventListener("click", (e) => {
    e.preventDefault();
    switchView("browse");
  });

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const target = e.target.getAttribute("data-target").replace("view-", "");
      switchView(target);
    });
  });
}