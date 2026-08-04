import { CircleUpAPI, Auth } from "../api.js";
import { state } from "./state.js";
import { showMessage, openModal, closeModal } from "./dom-utils.js";
import { switchView } from "./navigation.js";

const navLoggedIn = document.getElementById("nav-logged-in");
const authLoggedOut = document.getElementById("auth-actions-logged-out");
const authLoggedIn = document.getElementById("auth-actions-logged-in");
const modalLogin = document.getElementById("modal-login");
const modalRegister = document.getElementById("modal-register");

export async function checkAuthStatus() {
  if (Auth.isLoggedIn()) {
    try {
      state.currentUser = await CircleUpAPI.getCurrentUser();
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

export function setAuthState(isLoggedIn) {
  if (isLoggedIn) {
    navLoggedIn.classList.remove("hidden");
    authLoggedIn.classList.remove("hidden");
    authLoggedOut.classList.add("hidden");
  } else {
    navLoggedIn.classList.add("hidden");
    authLoggedIn.classList.add("hidden");
    authLoggedOut.classList.remove("hidden");
    state.currentUser = null;
  }
}

export function initAuth() {
  document.getElementById("btn-show-login").addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modalLogin);
  });

  document.getElementById("link-to-register").addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modalRegister);
  });

  document.getElementById("link-to-login").addEventListener("click", (e) => {
    e.preventDefault();
    openModal(modalLogin);
  });

  document.getElementById("btn-logout").addEventListener("click", async () => {
    try { await CircleUpAPI.logout(); } catch (_) {}
    Auth.clearToken();
    setAuthState(false);
    switchView("browse");
  });

  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const btn = document.getElementById("btn-submit-login");
    btn.disabled = true;
    btn.textContent = "Logging in...";
    
    try {
      const result = await CircleUpAPI.login(email, password);
      Auth.setToken(result.access_token);
      state.currentUser = await CircleUpAPI.getCurrentUser();
      closeModal();
      setAuthState(true);
      document.getElementById("login-form").reset();
      switchView("browse");
    } catch (err) {
      showMessage(err.message, true, document.getElementById("login-alert"));
    } finally {
      btn.disabled = false;
      btn.textContent = "Log In";
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

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    const phoneRegex = /^\d{10}$/;
    
    if (name.length < 3) return showMessage("Name must be at least 3 characters long.", true, alertBox);
    if (!emailRegex.test(email)) return showMessage("Email must be a @gmail.com address.", true, alertBox);
    if (!passwordRegex.test(password)) return showMessage("Password must be at least 8 characters, with 1 uppercase, 1 lowercase, and 1 special character.", true, alertBox);
    if (!phoneRegex.test(phone_number)) return showMessage("Phone number must be exactly 10 digits.", true, alertBox);
    if (!city) return showMessage("Please select a city.", true, alertBox);
    
    btn.disabled = true;
    btn.textContent = "Signing up...";
    
    try {
      await CircleUpAPI.register({ name, email, password, phone_number, city, bio });
      document.getElementById("register-form").reset();
      openModal(modalLogin);
      showMessage("Account created! Please log in.", false, document.getElementById("login-alert"));
    } catch (err) {
      showMessage(err.message, true, alertBox);
    } finally {
      btn.disabled = false;
      btn.textContent = "Sign Up";
    }
  });

  // live validation passwd
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
      if (checks[rule]) {
        li.classList.add("met");
      } else {
        li.classList.remove("met");
      }
    });
  });
}