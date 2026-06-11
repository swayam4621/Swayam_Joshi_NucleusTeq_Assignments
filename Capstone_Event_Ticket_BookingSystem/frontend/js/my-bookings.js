const BOOKING_API_URL = 'http://localhost:8082/api/bookings';
const EVENT_API_URL = 'http://localhost:8082/api/events';
let currentSortOrder = 'asc';
let currentTab= 'UPCOMING';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');

    if (token) {
        setupSessionTimeout(token);
    }
    if (!token || role !== 'CUSTOMER') {
        globalThis.location.href = 'index.html';
        return;
    }

    const email = localStorage.getItem('userEmail');
    if (email) {
        document.getElementById('user-display-name').textContent = `Hello, ${email.split('@')[0]}`;
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-filter'));
            e.target.classList.add('active-filter');
            
            currentTab = e.target.getAttribute('data-status'); 
            fetchMyBookings();
        });
    });

    const sortSelect = document.getElementById('sort-date-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSortOrder = e.target.value;
            fetchMyBookings();
        });
    }

    fetchMyBookings();

    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('close-qr-btn').addEventListener('click', closeQrModal);

    const qrModal = document.getElementById('qr-modal');
    qrModal.addEventListener('click', (e) => {
        if (e.target === qrModal) {
            closeQrModal();
        }
    });
});

function logout() {
    localStorage.clear();
    globalThis.location.href = 'index.html';
}

// Fetch bookings and associated event details for the logged-in user from backend 8082 
async function fetchMyBookings() {
    const grid = document.getElementById('bookings-grid');
    grid.textContent = 'Loading your tickets...';
    grid.className = 'status-message';

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${BOOKING_API_URL}/my-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Failed to load bookings");

        const bookings = await response.json();

        const allMyBookings = await Promise.all(bookings.map(async (booking) => {
            try {
                const eventRes = await fetch(`${EVENT_API_URL}/${booking.eventId}`);
                if (!eventRes.ok) return { ...booking, event: null };
                const eventData = await eventRes.json();
                return { ...booking, event: eventData };
            } catch (e) {
                return { ...booking, event: null };
            }
        }));

        const now = new Date().getTime();

        let displayBookings = allMyBookings.filter(b => {
            if (!b.event) return false;
            
            const eventTime = new Date(b.event.eventDateTime).getTime();
            
            const isEventCancelled = b.event.status === 'CANCELLED_BY_ORGANIZER';

            if (currentTab === 'UPCOMING') {
                return b.status === 'CONFIRMED' && !isEventCancelled && eventTime >= now; 
                
            } else if (currentTab === 'PAST') {
                return b.status === 'CONFIRMED' && !isEventCancelled && eventTime < now;
                
            } else if (currentTab === 'CANCELLED') {
                return b.status === 'CANCELLED' || isEventCancelled; 
            }
            return false;
        });

        displayBookings.sort((a, b) => {
            if (!a.event || !b.event) return 0;
            const dateA = new Date(a.event.eventDateTime).getTime();
            const dateB = new Date(b.event.eventDateTime).getTime();
            return currentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        grid.textContent = '';
        grid.className = 'district-grid';

        if (displayBookings.length === 0) {
            document.getElementById('no-bookings-msg').classList.remove('hidden');
            return;
        }

        document.getElementById('no-bookings-msg').classList.add('hidden');
        const template = document.getElementById('booking-card-template');

        for (const data of displayBookings) {
            if (!data.event) continue;

            const cardClone = template.content.cloneNode(true);
            const cardElement = cardClone.querySelector('.event-card');

            const eventName = data.event.name;
            const eventDateStr = data.event.eventDateTime;
            const eventDate = new Date(eventDateStr).toLocaleString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
            });

            cardElement.querySelector('.booking-event-name').textContent = eventName;
            cardElement.querySelector('.booking-date-val').textContent = eventDate;
            cardElement.querySelector('.booking-qty-val').textContent = data.numberOfTickets;
            cardElement.querySelector('.booking-price-val').textContent = data.totalAmount.toFixed(2);

            const badge = cardElement.querySelector('.booking-status-badge');
            const isEventCancelled = data.event.status === 'CANCELLED_BY_ORGANIZER';
            const isBookingCancelled = data.status === 'CANCELLED';

            if (isEventCancelled) {
                if (badge) {
                    badge.textContent = 'CANCELLED BY ORGANIZER';
                    badge.classList.add('badge-cancelled');
                }
                cardElement.querySelector('.btn-group-row').classList.add('d-none');
                
            } else if (isBookingCancelled) {
                if (badge) {
                    badge.textContent = 'CANCELLED';
                    badge.classList.add('badge-cancelled');
                }
                cardElement.querySelector('.btn-group-row').classList.add('d-none');
                
            } else {
                if (badge) {
                    badge.textContent = data.status; 
                }

                const hoursUntilEvent = (new Date(eventDateStr) - new Date()) / (1000 * 60 * 60);
                const cancelBtn = cardElement.querySelector('.btn-cancel-booking');

                if (hoursUntilEvent <= 3) {
                    cancelBtn.disabled = true;
                    cancelBtn.classList.add('btn-locked');
                    cancelBtn.textContent = 'Locked';
                    cancelBtn.title = "Cannot cancel within 3 hours of start time";
                } else {
                    cancelBtn.addEventListener('click', async () => {
                        if (confirm(`Are you sure you want to cancel your tickets for ${eventName}? This cannot be undone.`)) {
                            cancelBooking(data.id, cardElement);
                        }
                    });
                }
                
                // QR generator logic 
                const secureQrData = `EVENT-${data.eventId}-TICKET-${data.id}-${data.userEmail}`;
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(secureQrData)}`;

                const viewBtn = cardElement.querySelector('.btn-view-qr');
                viewBtn.addEventListener('click', () => {
                    openQrModal(eventName, eventDate, data.id, data.numberOfTickets, qrUrl);
                });
            }
            grid.appendChild(cardElement);
        }

    } catch (error) {
        console.error("Error:", error);
        grid.textContent = 'Failed to load bookings. Please try again.';
        grid.className = 'error-msg';
    }
}

// qr modal functions
function openQrModal(eventName, eventDate, ticketId, qty, qrUrl) {
    document.getElementById('qr-event-name').textContent = `Entry Pass - ${eventName}`;
    document.getElementById('qr-event-date').textContent = eventDate;
    document.getElementById('qr-ticket-id').textContent = ticketId;
    document.getElementById('qr-ticket-qty').textContent = `Admit ${qty} Person(s)`;

    document.getElementById('qr-code-img').src = qrUrl;
    document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQrModal() {
    document.getElementById('qr-modal').classList.add('hidden');
    setTimeout(() => {
        const qrImg = document.getElementById('qr-code-img');
        if (qrImg) qrImg.src = '';
    }, 200);
}

//Cancel booking function
async function cancelBooking(bookingId, cardElement) {
    const cancelBtn = cardElement.querySelector('.btn-cancel-booking');
    try {
        const token = localStorage.getItem('jwtToken');
        cancelBtn.disabled = true;
        cancelBtn.textContent = 'Cancelling...';

        const response = await fetch(`${BOOKING_API_URL}/cancel/${bookingId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to cancel booking");
        }
        cardElement.classList.add('fade-out-scale');
        setTimeout(() => {
            fetchMyBookings();
        }, 400);

    } catch (error) {
        alert(error.message);
        cancelBtn.disabled = false;
        cancelBtn.textContent = 'Cancel';
    }
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
    alert("Your session has expired for security reasons. Please log in again.");
    window.location.href = 'index.html'; 
}