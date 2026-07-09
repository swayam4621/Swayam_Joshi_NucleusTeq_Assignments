import { CircleUpAPI } from "../api.js";
import { state } from "./state.js";
import { showMessage } from "./dom-utils.js";

export async function loadProfile() {
  if (!state.currentUser) return;
  document.getElementById("profile-name").value = state.currentUser.name || "";
  document.getElementById("profile-phone").value = state.currentUser.phone_number || "";
  document.getElementById("profile-city").value = state.currentUser.city || "";
  document.getElementById("profile-bio").value = state.currentUser.bio || "";
}

export function initProfile() {
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

    btn.disabled = true;
    btn.textContent = "Saving...";
    try {
      state.currentUser = await CircleUpAPI.updateProfile(payload);
      showMessage("Profile updated!", false);
    } catch (err) {
      showMessage(err.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = "Save Changes";
    }
  });
}