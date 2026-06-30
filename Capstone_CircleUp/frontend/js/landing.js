document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    window.location.href = "activities.html";
    return;
  }

  const grid = document.getElementById("landing-grid");
  const loadingMsg = document.getElementById("loading-msg");

  function formatDateTime(isoString) {
    const d = new Date(isoString);
    return d.toLocaleString(undefined, { 
      weekday: "short", 
      month: "short", 
      day: "numeric", 
      hour: "numeric", 
      minute: "2-digit" 
    });
  }

  async function loadPublicActivities() {
    loadingMsg.classList.remove("hidden");
    
    try {
      const activities = await apiRequest("/activities", { method: "GET", auth: false });
      
      // Clear the grid cleanly
      grid.replaceChildren();
      
      if (activities.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No activities found right now. Be the first to host one!";
        grid.appendChild(emptyMessage);
      } else {
        activities.forEach(act => {
          // 1. Create Card Container
          const card = document.createElement("div");
          card.className = "event-card";

          // 2. Create Header
          const header = document.createElement("div");
          header.className = "event-card-header";
          
          const title = document.createElement("h3");
          title.className = "event-card-title";
          title.textContent = act.title;
          
          header.appendChild(title);

          // 3. Create Meta Section
          const meta = document.createElement("div");
          meta.className = "event-meta";
          
          const locSpan = document.createElement("span");
          locSpan.textContent = `Location: ${act.location}`;
          
          const dateSpan = document.createElement("span");
          dateSpan.textContent = `Date: ${formatDateTime(act.date)}`;
          
          const catSpan = document.createElement("span");
          catSpan.textContent = `Category: ${act.category}`;
          
          meta.append(locSpan, dateSpan, catSpan);

          // 4. Create Actions
          const actions = document.createElement("div");
          actions.className = "event-actions";
          
          const promptBtn = document.createElement("button");
          promptBtn.className = "btn btn-secondary login-prompt-btn";
          promptBtn.textContent = "View Details & Join";
          
          promptBtn.addEventListener('click', () => {
            window.location.href = "login.html";
          });

          actions.appendChild(promptBtn);

          // Assemble the card
          card.append(header, meta, actions);
          grid.appendChild(card);
        });
      }
      grid.classList.remove("hidden");
    } catch (err) {
      grid.replaceChildren();
      
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";
      
      const h3 = document.createElement("h3");
      h3.textContent = "Log in to see activities";
      
      const p = document.createElement("p");
      
      const loginLink = document.createElement("a");
      loginLink.href = "login.html";
      loginLink.textContent = "Log in";
      
      const orText = document.createTextNode(" or ");
      
      const registerLink = document.createElement("a");
      registerLink.href = "register.html";
      registerLink.textContent = "Register";
      
      const suffixText = document.createTextNode(" to explore what is happening around you.");
      
      p.append(loginLink, orText, registerLink, suffixText);
      emptyState.append(h3, p);
      
      grid.appendChild(emptyState);
      grid.classList.remove("hidden");
    } finally {
      loadingMsg.classList.add("hidden");
    }
  }

  loadPublicActivities();
});