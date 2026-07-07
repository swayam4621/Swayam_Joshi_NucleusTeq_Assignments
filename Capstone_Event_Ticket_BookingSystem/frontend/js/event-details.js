const EVENT_API_URL = 'http://localhost:8082/api/events';
const BOOKING_API_URL = 'http://localhost:8082/api/bookings';

let currentEventId = null;
let currentEventPrice = 0;
let currentEventName = '';
let currentAvailableSeats = 10;
let currentEventDetails = null;

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    if (!token || localStorage.getItem('userRole') !== 'CUSTOMER') {
        globalThis.location.href = 'index.html';
        return;
    }
    if (token) {
        setupSessionTimeout(token);
    }

    loadEventDetails();
});

async function loadEventDetails() {
    const urlParams = new URLSearchParams(globalThis.location.search);
    const eventId = urlParams.get('id');

    const loadingDiv = document.getElementById('details-loading');
    const contentDiv = document.getElementById('event-content');

    if (!eventId) {
        loadingDiv.textContent = "Event not found.";
        return;
    }

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch(`${EVENT_API_URL}/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) throw new Error("Event not found");
            throw new Error("Failed to load details");
        }

        const event = await response.json();
        currentEventDetails = event;
        currentEventName = event.name;

        document.getElementById('detail-title').textContent = event.name;
        document.getElementById('detail-location').textContent = event.venue;
        document.getElementById('detail-price').textContent = event.ticketPrice;
        document.getElementById('detail-seats').textContent = event.availableSeats;
        document.getElementById('detail-description').textContent = event.description || "No description provided by the organizer.";

        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
        document.getElementById('detail-date').textContent = new Date(event.eventDateTime).toLocaleString('en-US', dateOptions);

        //display image
        const defaultImg = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200';
        document.getElementById('detail-image').src = event.imageUrl || defaultImg;

        const statusEl = document.getElementById('detail-status');
        if (event.status === 'ACTIVE') {
            statusEl.textContent = "ACTIVE";
            statusEl.className = "badge badge-rounded badge-active";
        } else {
            statusEl.textContent = "CANCELLED";
            statusEl.className = "badge badge-rounded badge-cancelled";
        }

        //hide loading show content
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');

        //Booking button logic
        const bookBtn = document.getElementById('book-ticket-btn');
        if (event.status === 'CANCELLED_BY_ORGANIZER') {
            bookBtn.textContent = "Event Cancelled";
            bookBtn.disabled = true;
            bookBtn.classList.add('btn-disabled');
        } else if (event.availableSeats <= 0) {
            bookBtn.textContent = "Sold Out";
            bookBtn.disabled = true;
            bookBtn.classList.add('btn-disabled');
        } else {
            bookBtn.addEventListener('click', () => {
                openPaymentModal(eventId, event.name, event.ticketPrice);
            });
        }

    } catch (error) {
        console.error(error);
        const loadingDiv = document.getElementById('details-loading');
        loadingDiv.textContent = `Could not load event details. ${error.message}`;
        loadingDiv.className = 'error-msg';
    }
}


function openPaymentModal(eventId, eventName, ticketPrice) {
    currentEventId = eventId;
    currentEventPrice = ticketPrice;
    currentEventName = eventName;
    currentAvailableSeats = currentEventDetails.availableSeats;

    document.getElementById('ticket-quantity').value = 1;
    document.getElementById('payment-event-name').textContent = eventName;
    document.getElementById('ticket-quantity').value = "1";
    calculateTotal();

    const paymentModal = document.getElementById('payment-modal');
    paymentModal.classList.remove('hidden');
    paymentModal.style.display = 'flex';
}

function closePaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    paymentModal.classList.add('hidden');
    paymentModal.style.display = 'none';

    document.getElementById('payment-form').reset();
    document.getElementById('payment-error').classList.add('hidden');
    document.getElementById('payment-success')?.classList.add('hidden');
    document.getElementById('payment-form').style.display = 'block';
    resetPayButton();
}

function calculateTotal() {
    const qty = parseInt(document.getElementById('ticket-quantity').value);
    const total = qty * currentEventPrice;
    document.getElementById('payment-total').textContent = total.toFixed(2);
}

//Handle the fake payment submission

//---- Payment form listeners ----
document.getElementById('payment-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const qty = parseInt(document.getElementById('ticket-quantity').value);
    const totalAmount = qty * currentEventPrice;
    const errorDiv = document.getElementById('payment-error');

    //fake loading spinner
    const btnText = document.getElementById('pay-btn-text');
    const spinner = document.getElementById('pay-spinner');
    const payBtn = document.getElementById('pay-btn');

    btnText.textContent = "Processing...";
    spinner.classList.remove('hidden');
    payBtn.disabled = true;
    errorDiv.classList.add('hidden');

    //simulating a 2 second bank processing delay
    setTimeout(async () => {
        try {
            const token = localStorage.getItem('jwtToken');

            const bookingRequest = {
                eventId: currentEventId,
                numberOfTickets: qty,
                totalAmount: totalAmount
            };

            const response = await fetch(`${BOOKING_API_URL}/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingRequest)
            });

            const responseText = await response.text();
            let responseData = {};

            if (responseText) {
                try {
                    responseData = JSON.parse(responseText);
                } catch (parseError) {
                    console.warn("Backend didn't send JSON. Raw response:", responseText);
                }
            }
            // Handle Errors
            if (!response.ok) {
                throw new Error(responseData.error || responseText || "Payment failed or seats unavailable.");
            }

            closePaymentModal();

            showBookingSuccess(currentEventName);

        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
            resetPayButton();
        }
    }, 2000);
});

function resetPayButton() {
    document.getElementById('pay-btn-text').textContent = "Pay Now";
    document.getElementById('pay-spinner').classList.add('hidden');
    document.getElementById('pay-btn').disabled = false;
}

const paymentModal = document.getElementById('payment-modal');
if (paymentModal) {
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) closePaymentModal();
    });
}

function updateQuantity(change) {
    const input = document.getElementById('ticket-quantity');
    let currentValue = parseInt(input.value) || 1;
    let newValue = currentValue + change;
    if (newValue < 1) {
        newValue = 1;
    }
    else if (newValue > currentAvailableSeats) {
        newValue = currentAvailableSeats;

        if (typeof showToast === 'function') {
            showToast(`Only ${currentAvailableSeats} seats left!`, true);
        } else {
            alert(`Only ${currentAvailableSeats} seats left!`);
        }
    }

    if (newValue !== currentValue) {
        input.value = newValue;
        calculateTotal();
    }
}

function showBookingSuccess(eventName) {
    document.getElementById('success-event-name').textContent = eventName;

    const successModal = document.getElementById('booking-success-modal');
    successModal.classList.remove('hidden');
    successModal.style.display = 'flex';

    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#20c997', '#ffffff', '#14aa84']
    });
}

function closeSuccessModal() {
    const successModal = document.getElementById('booking-success-modal');
    successModal.classList.add('hidden');
    successModal.style.display = 'none';
}

function logout() {
    localStorage.clear();
    globalThis.location.href = 'index.html';
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