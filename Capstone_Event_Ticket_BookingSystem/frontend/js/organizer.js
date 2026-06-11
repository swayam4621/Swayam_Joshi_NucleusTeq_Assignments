const EVENT_API_URL = 'http://localhost:8082/api/events';
let currentSubTab = 'upcoming';
let currentEventAttendees = [];

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || localStorage.getItem('userRole') !== 'ORGANIZER') {
        globalThis.location.href = 'index.html';
        return;
    }
    if (token) {
        setupSessionTimeout(token);
    }
    document.getElementById('user-display-name').innerText = localStorage.getItem('userEmail');
    fetchMyEvents();
    
    if (localStorage.getItem('showLoginToast') === 'true') {
        showToast("Login Successful! Welcome to your dashboard.");
        localStorage.removeItem('showLoginToast');
    }

    document.getElementById('logout-btn').addEventListener('click', logout);

    document.querySelectorAll('.main-tab-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => switchMainTab(e.target.getAttribute('data-target')));
    });

    document.querySelectorAll('.subtab-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => switchSubTab(e.target.getAttribute('data-subtab')));
    });

    document.getElementById('close-update-modal').addEventListener('click', closeUpdateModal);
    document.getElementById('close-details-modal').addEventListener('click', closeDetailsModal);

    // Close modals when clicking on backdrop
    const updateModal = document.getElementById('update-modal');
    const detailsModal = document.getElementById('details-modal');

    if (updateModal) {
        updateModal.addEventListener('click', (e) => {
            if (e.target === updateModal) closeUpdateModal();
        });
    }

    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target === detailsModal) closeDetailsModal();
        });
    }

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);
    const createDateInput = document.getElementById('event-date');
    const updateDateInput = document.getElementById('update-event-date');

    if (createDateInput) createDateInput.min = minDateTime;
    if (updateDateInput) updateDateInput.min = minDateTime;
});

function logout() {
    localStorage.clear();
    globalThis.location.href = 'index.html';
}

// Main tab switching 
function switchMainTab(tabId) {
    const myEventsSection = document.getElementById('my-events-section');
    const createSection = document.getElementById('create-section');
    const tabMyEvents = document.getElementById('tab-my-events');
    const tabCreate = document.getElementById('tab-create');

    myEventsSection.classList.add('hidden');
    createSection.classList.add('hidden');
    tabMyEvents.classList.replace('active-tab', 'inactive-tab');
    tabCreate.classList.replace('active-tab', 'inactive-tab');

    if (tabId === 'my-events') {
        myEventsSection.classList.remove('hidden');
        tabMyEvents.classList.replace('inactive-tab', 'active-tab');
        fetchMyEvents();
    } else if (tabId === 'create') {
        createSection.classList.remove('hidden');
        tabCreate.classList.replace('inactive-tab', 'active-tab');
    }
}

// Sub tab switching for Past, upcoming and cancelled 
function switchSubTab(subTabName) {
    const grids = ['upcoming-grid', 'past-grid', 'cancelled-grid'];
    const subTabs = ['subtab-upcoming', 'subtab-past', 'subtab-cancelled'];

    grids.forEach(id => document.getElementById(id).classList.add('hidden'));
    subTabs.forEach(id => document.getElementById(id).classList.replace('active-tab', 'inactive-tab'));

    document.getElementById(`${subTabName}-grid`).classList.remove('hidden');
    document.getElementById(`subtab-${subTabName}`).classList.replace('inactive-tab', 'active-tab');

    currentSubTab = subTabName;
    fetchMyEvents();
}

//Fetch events
async function fetchMyEvents() {
    const token = localStorage.getItem('jwtToken');
    const gridId = `${currentSubTab}-grid`;
    const sectionTitle = currentSubTab.charAt(0).toUpperCase() + currentSubTab.slice(1);

    try {
        const response = await fetch(`${EVENT_API_URL}/my-events?filter=${currentSubTab}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load events");

        const events = await response.json();
        const grid = document.getElementById(gridId);
        grid.innerHTML = '';

        if (events.length === 0) {
            document.getElementById('no-events-msg').classList.remove('hidden');
        } else {
            document.getElementById('no-events-msg').classList.add('hidden');
            renderEvents(events, gridId, sectionTitle);
        }
    } catch (error) {
        console.error(`Error fetching ${currentSubTab} events:`, error);
    }
}

// Render events in the grids
function renderEvents(events, gridId, sectionTitle) {
    const grid = document.getElementById(gridId);
    const template = document.getElementById('event-card-template');

    if (!grid || !template) return;

    events.forEach(event => {
        const cardClone = template.content.cloneNode(true);
        const eventJson = encodeURIComponent(JSON.stringify(event));

        cardClone.querySelector('.card-title').textContent = event.name;
        cardClone.querySelector('.date-text span').textContent = new Date(event.eventDateTime).toLocaleString();
        cardClone.querySelector('.venue-text span').textContent = event.venue;
        cardClone.querySelector('.price-text span').textContent = event.ticketPrice;
        cardClone.querySelector('.seats-text span').textContent = `${event.availableSeats} / ${event.totalSeats} Available`;

        const header = cardClone.querySelector('.card-header');
        const badge = document.createElement('span');
        badge.className = event.status === 'ACTIVE' ? 'badge badge-active' : 'badge badge-cancelled';
        badge.textContent = event.status;
        header.appendChild(badge);

        const actionsContainer = cardClone.querySelector('.card-actions');

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn primary-btn btn-view-details';
        viewBtn.textContent = 'View Details';
        viewBtn.addEventListener('click', () => openDetailsModal(eventJson));
        actionsContainer.appendChild(viewBtn);

        if (sectionTitle === 'Upcoming') {
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group-row';

            const editBtn = document.createElement('button');
            editBtn.className = 'btn-edit';
            editBtn.textContent = 'Edit';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-cancel';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.addEventListener('click', () => cancelEvent(event.id));

            const now = new Date().getTime();
            const eventTime = new Date(event.eventDateTime).getTime();
            const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);

            if (hoursUntilEvent < 4) {
                editBtn.disabled = true;
                editBtn.classList.add('btn-locked');
                editBtn.textContent = 'Locked';
                editBtn.title = "Cannot modify within 4 hours of start time";
            } else {
                editBtn.addEventListener('click', () => openUpdateModal(eventJson));
            }

            btnGroup.appendChild(editBtn);
            btnGroup.appendChild(cancelBtn);
            actionsContainer.appendChild(btnGroup);

        } else if (sectionTitle === 'Past') {
            const completedBadge = document.createElement('span');
            completedBadge.className = 'badge badge-completed-full';
            completedBadge.textContent = 'COMPLETED';
            actionsContainer.appendChild(completedBadge);
        }

        grid.appendChild(cardClone);
    });
}

// Create Event form listeners ---
document.getElementById('create-event-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('event-title').value,
        description: document.getElementById('event-desc').value,
        eventDate: document.getElementById('event-date').value,
        location: document.getElementById('event-location').value,
        price: Number.parseFloat(document.getElementById('event-price').value),
        totalTickets: Number.parseInt(document.getElementById('event-tickets').value),
        artistName: document.getElementById('event-artist').value,
        imageUrl: document.getElementById('event-image').value,
        category: document.getElementById('event-category').value
    };

    if (eventData.title.trim() === '') {
        showToast("Event title cannot be empty.", true);
        document.getElementById('event-title').focus();
        return;
    }

    try {
        const response = await fetch(`${EVENT_API_URL}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
            const successMsg = document.getElementById('event-success');
            successMsg.innerText = "Event published successfully!";
            successMsg.classList.remove('hidden');
            this.reset();
            setTimeout(() => {
                successMsg.classList.add('hidden');
                switchMainTab('my-events');
            }, 1500);
        }
    } catch (error) {
        console.error("Error creating event:", error);
    }
});

// ---- Update Event form listeners --- 
function openUpdateModal(eventJsonEncoded) {
    const event = JSON.parse(decodeURIComponent(eventJsonEncoded));
    const dateObj = new Date(event.eventDateTime);
    const tzOffset = dateObj.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(dateObj - tzOffset)).toISOString().slice(0, 16);

    document.getElementById('update-event-id').value = event.id;
    document.getElementById('upd-title').value = event.name;
    document.getElementById('upd-desc').value = event.description;
    document.getElementById('upd-tickets').value = event.totalSeats;
    document.getElementById('upd-date').value = localISOTime;
    document.getElementById('upd-location').value = event.venue;
    document.getElementById('upd-price').value = event.ticketPrice;
    document.getElementById('upd-image').value = event.imageUrl || '';
    document.getElementById('upd-artist').value = event.artistName || '';
    document.getElementById('update-event-category').value = event.category || 'Other';
    
    document.getElementById('update-modal').classList.remove('hidden');
}

function closeUpdateModal() {
    document.getElementById('update-modal').classList.add('hidden');
}

//Update event logic
document.getElementById('update-event-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const eventId = document.getElementById('update-event-id').value;
    const updateData = {
        title: document.getElementById('upd-title').value,
        category: document.getElementById('update-event-category').value,
        description: document.getElementById('upd-desc').value,
        eventDate: document.getElementById('upd-date').value,
        location: document.getElementById('upd-location').value,
        price: Number.parseFloat(document.getElementById('upd-price').value),
        totalTickets: Number.parseInt(document.getElementById('upd-tickets').value),
        imageUrl: document.getElementById('upd-image').value,
        artistName: document.getElementById('upd-artist').value
    };

    try {
        const response = await fetch(`${EVENT_API_URL}/update/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            closeUpdateModal();
            fetchMyEvents();
        } else {
            const text = await response.text();
            let errorMessage = "Forbidden: Your token was rejected.";
            try {
                const errorData = JSON.parse(text);
                errorMessage = errorData.error || errorMessage;
            } catch (error_) {
                console.error("Error parsing error response:", error_);
            }
            const errorEl = document.getElementById('upd-error');
            errorEl.innerText = errorMessage;
            errorEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error updating event:", error);
    }
});

//View details of event and attenders table
async function openDetailsModal(eventJsonEncoded) {
    const event = JSON.parse(decodeURIComponent(eventJsonEncoded));
    document.getElementById('det-title').innerText = event.name;
    document.getElementById('det-desc').innerText = event.description;
    document.getElementById('det-date').innerText = new Date(event.eventDateTime).toLocaleString();
    document.getElementById('det-venue').innerText = event.venue;
    document.getElementById('det-price').innerText = event.ticketPrice;
    document.getElementById('det-avail').innerText = event.availableSeats;
    document.getElementById('det-total').innerText = event.totalSeats;

    const statusEl = document.getElementById('det-status');
    statusEl.innerText = event.status;
    statusEl.className = `badge badge-rounded ${event.status === 'ACTIVE' ? 'badge-active' : 'badge-cancelled'}`;

    document.getElementById('det-tickets-sold').innerText = '...';
    document.getElementById('det-revenue').innerText = '...';
    document.getElementById('attendee-table-body').innerHTML = '';
    document.getElementById('no-attendees-msg').classList.add('hidden');
    currentEventAttendees = []; 

    document.getElementById('details-modal').classList.remove('hidden');
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`http://localhost:8082/api/bookings/event/${event.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const bookings = await response.json();
            currentEventAttendees = bookings;

            let totalSold = 0;
            let totalRevenue = 0;
            const tbody = document.getElementById('attendee-table-body');

            if (bookings.length === 0) {
                document.getElementById('no-attendees-msg').classList.remove('hidden');
                document.getElementById('det-tickets-sold').innerText = '0';
                document.getElementById('det-revenue').innerText = '0.00';
            } else {
                bookings.forEach(b => {
                    //Calculate totals
                    totalSold += b.numberOfTickets;
                    totalRevenue += b.totalAmount;
                    
                    const tr = document.createElement('tr');
                    
                    const tdEmail = document.createElement('td');
                    tdEmail.textContent = b.userEmail;
                    
                    const tdTickets = document.createElement('td');
                    tdTickets.textContent = b.numberOfTickets;
                    
                    const tdAmount = document.createElement('td');
                    tdAmount.textContent = `₹${b.totalAmount.toFixed(2)}`;
                    
                    const tdDate = document.createElement('td');
                    tdDate.className = 'date-col';
                    tdDate.textContent = new Date(b.bookingDate).toLocaleDateString();
                    
                    tr.appendChild(tdEmail);
                    tr.appendChild(tdTickets);
                    tr.appendChild(tdAmount);
                    tr.appendChild(tdDate);
                    
                    tbody.appendChild(tr);
                });

                document.getElementById('det-tickets-sold').innerText = totalSold;
                document.getElementById('det-revenue').innerText = totalRevenue.toFixed(2);
            }
        }
    } catch (error) {
        console.error("Failed to load analytics:", error);
    }
}

//csv download
document.getElementById('download-csv-btn').addEventListener('click', () => {
    if (currentEventAttendees.length === 0) {
        alert("There are no attendees to download for this event.");
        return;
    }

    let csvContent = "Customer Email,Tickets Bought,Total Paid (INR),Booking Date,Status\n";

    currentEventAttendees.forEach(b => {
        const dateStr = new Date(b.bookingDate).toLocaleString().replace(/,/g, '');
        csvContent += `${b.userEmail},${b.numberOfTickets},${b.totalAmount},${dateStr},${b.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendees_event_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

function closeDetailsModal() {
    document.getElementById('details-modal').classList.add('hidden');
}

// Cancel event logic
async function cancelEvent(eventId) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
        const response = await fetch(`${EVENT_API_URL}/cancel/${eventId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
        });
        if (response.ok) {
            alert("Event cancelled.");
            fetchMyEvents();
        }
    } catch (error) {
        console.error("Error cancelling event:", error);
        alert("Server connection failed.");
    }
}

// ---Login successful toast box ---
function showToast(message, isError = false) {
    const toast = document.getElementById('toast-container');
    const msgElement = document.getElementById('toast-message');

    if (!toast || !msgElement) return;

    const icon = isError ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
    msgElement.innerHTML = `${icon} ${message}`;

    if (isError) toast.classList.add('toast-error');
    else toast.classList.remove('toast-error');

    toast.classList.remove('toast-hidden');
    toast.classList.add('toast-visible');

    setTimeout(() => {
        toast.classList.remove('toast-visible');
        toast.classList.add('toast-hidden');
    }, 3000);
}

// Session timeout
function setupSessionTimeout(token) {
    if (!token) return;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; 
        const currentTime = Date.now();
        const timeRemaining = expirationTime - currentTime;

        if (timeRemaining <= 0) {
            handleSessionExpiry();
        } else {
            setTimeout(handleSessionExpiry, timeRemaining);
        }
    } catch (e) {
        console.error("Invalid token format", e);
        handleSessionExpiry();
    }
}

function handleSessionExpiry() {
    localStorage.clear();
    alert("Your session has expired. Please log in again.");
    window.location.href = 'index.html'; 
}