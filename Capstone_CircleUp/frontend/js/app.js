import { 
  populateCategorySelect, 
  getMinDateTime, 
  setupCategoryToggle, 
  setupTitleLiveHint, 
  setupMaxParticipantsLiveHint,
  setupPhoneLiveHint 
} from "./modules/dom-utils.js";
import { initNavigation } from "./modules/navigation.js";
import { initAuth, checkAuthStatus } from "./modules/auth.js";
import { initActivities } from "./modules/activities.js";
import { initParticipation } from "./modules/participation.js";
import { initProfile } from "./modules/profile.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Filters dates dropdowns
  populateCategorySelect(document.getElementById("filter-category"), { includeAllOption: true });
  populateCategorySelect(document.getElementById("create-category"));
  populateCategorySelect(document.getElementById("edit-category"));
  
  document.getElementById("create-date").min = getMinDateTime();
  
  setupCategoryToggle("create-category", "create-category-other");
  setupCategoryToggle("edit-category", "edit-category-other");
  
  setupTitleLiveHint("create-title", "create-title-hint");
  setupTitleLiveHint("edit-title", "edit-title-hint");
  setupTitleLiveHint("register-name", "register-name-hint");
  setupTitleLiveHint("profile-name", "profile-name-hint");
  setupPhoneLiveHint("profile-phone", "profile-phone-hint");
  
  setupMaxParticipantsLiveHint("create-max", "create-max-hint");
  setupMaxParticipantsLiveHint("edit-max", "edit-max-hint");

  // module event listeners
  initNavigation();
  initAuth();
  initActivities();
  initParticipation();
  initProfile();

  // authenticate users
  await checkAuthStatus();
});