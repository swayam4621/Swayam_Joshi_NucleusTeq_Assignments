const EVENT_API_URL = 'http://localhost:8082/api/events';
const AUTH_API_URL = 'http://localhost:8081/api/auth';

let currentSlide = 0;
let slideInterval;
let currentSearchQuery = '';
let currentTimeframe = 'All';
let currentCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');
    
    if (token) {
        setupSessionTimeout(token);
    }

    if (token && role === 'ORGANIZER') {
        window.location.href = 'organizer-dash.html';
    }
    if (localStorage.getItem('showLoginToast') === 'true') {
        showToast("Login Successful! Welcome back.");

        localStorage.removeItem('showLoginToast');
    }
    updateNavbarState();

    const loginBtn = document.getElementById('nav-login-btn');
    if (loginBtn) loginBtn.addEventListener('click', openLoginModal);

    const signupBtn = document.getElementById('nav-signup-btn');
    if (signupBtn) signupBtn.addEventListener('click', openSignupModal);

    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Login form submit button listener 
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');

            try {
                const response = await fetch(`${AUTH_API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || "Invalid credentials");
                }

                const data = await response.json();

                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userEmail', email);

                localStorage.setItem('showLoginToast', 'true');

                if (data.role === 'ORGANIZER') {
                    window.location.href = 'organizer-dash.html';
                } else {
                    window.location.reload();
                }
            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }

    // Signup form submit button listner and register validations on frontend 
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const phone = document.getElementById('signup-phone').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const role = document.getElementById('signup-role').value;
            const errorDiv = document.getElementById('signup-error');
            const successDiv = document.getElementById('signup-success');

            //frontend validation for register form
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(phone)) {
                errorDiv.textContent = "Phone number must be exactly 10 digits.";
                errorDiv.classList.remove('hidden');
                return;
            }

            if (!email.toLowerCase().endsWith('@gmail.com')) {
                errorDiv.textContent = "Please use a valid @gmail.com email address.";
                errorDiv.classList.remove('hidden');
                return;
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,12}$/;
            if (!passwordRegex.test(password)) {
                errorDiv.textContent = "Password must be 8-12 characters and include an uppercase letter, lowercase letter, and special character.";
                errorDiv.classList.remove('hidden');
                return;
            }

            try {
                const response = await fetch(`${AUTH_API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, email, password, role })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    let errorMessage = "Registration failed. Check inputs.";

                    if (errorData.message) errorMessage = errorData.message;
                    else if (errorData.error) errorMessage = errorData.error;
                    else if (typeof errorData === 'object') errorMessage = Object.values(errorData)[0];

                    throw new Error(errorMessage);
                }

                errorDiv.classList.add('hidden');
                successDiv.textContent = "Account created! Please log in.";
                successDiv.classList.remove('hidden');
                document.getElementById('signup-form').reset();
                showToast("Registration Successful! Please log in.");
                setTimeout(() => {
                    openLoginModal();
                    successDiv.classList.add('hidden');
                }, 1500);

            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }

    fetchPublicEvents(false);

    //search bar listeners
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-trigger-btn');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            currentSearchQuery = searchInput.value;
            fetchPublicEvents(true);
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearchQuery = searchInput.value;
                fetchPublicEvents(true);
            }
        });
        searchInput.addEventListener('input', () => {
            currentSearchQuery = searchInput.value;
            fetchPublicEvents(true);
        });
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                currentSearchQuery = '';
                fetchPublicEvents(true);
            }
        });
    }

    //filter button listeners and output
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.getAttribute('data-type');
            const filterValue = e.target.getAttribute('data-value');

            if (!filterType) return;

            if (filterType === 'timeframe') {
                document.querySelectorAll('.filter-btn[data-type="timeframe"]').forEach(b => b.classList.remove('active-filter'));
                currentTimeframe = filterValue;
            } else if (filterType === 'category') {
                if (currentCategory === filterValue) {
                    currentCategory = 'All';
                    e.target.classList.remove('active-filter');
                } else {
                    document.querySelectorAll('.filter-btn[data-type="category"]').forEach(b => b.classList.remove('active-filter'));
                    currentCategory = filterValue;
                    e.target.classList.add('active-filter');
                }
            } else {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
                e.target.classList.add('active-filter');
                currentTimeframe = 'All';
                currentCategory = 'All';
                currentSearchQuery = '';
                if (document.getElementById('search-input')) document.getElementById('search-input').value = '';
            }

            if (filterType !== 'category' || currentCategory !== 'All') {
                e.target.classList.add('active-filter');
            }

            fetchPublicEvents(true);
        });
    });

    //close boxes when clicking outside
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) closeAuthModals();
        });
    }

    if (signupModal) {
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) closeAuthModals();
        });
    }
});

// --- Navbar state display logic ---
function updateNavbarState() {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    const loggedOutNav = document.getElementById('nav-logged-out');
    const loggedInNav = document.getElementById('nav-logged-in');
    const greeting = document.getElementById('user-greeting');

    if (token && role === 'CUSTOMER') {
        loggedOutNav.classList.add('hidden');
        loggedInNav.classList.remove('hidden');

        const namePart = email.split('@')[0];
        greeting.textContent = `Hello, ${namePart.charAt(0).toUpperCase() + namePart.slice(1)}`;
    } else {
        loggedOutNav.classList.remove('hidden');
        loggedInNav.classList.add('hidden');
    }
}

function logout() {
    localStorage.clear();
    window.location.reload();
}

function handleBookClick(eventId) {
    const token = localStorage.getItem('jwtToken');
    const role = localStorage.getItem('userRole');

    if (token && role === 'CUSTOMER') {
        window.location.href = `event-details.html?id=${eventId}`;
    } else {
        promptLogin();
    }
}

// --- Fetching events and rendering them ---
async function fetchPublicEvents(isFilterUpdate = false) {
    const grid = document.getElementById('public-events-grid');
    const artistContainer = document.getElementById('dynamic-artists-container');
    const carousel = document.getElementById('hero-carousel');
    const dotsContainer = document.getElementById('carousel-dots');

    const eventTemplate = document.getElementById('public-event-card-template');
    const slideTemplate = document.getElementById('hero-slide-template');
    const artistTemplate = document.getElementById('artist-item-template');

    try {
        // Api call to backend 8082 eventservice
        const url = new URL(`${EVENT_API_URL}/search?`);
        url.searchParams.append('keyword', currentSearchQuery || '');
        url.searchParams.append('category', currentCategory === 'All' ? '' : currentCategory);
        url.searchParams.append('timeframe', currentTimeframe === 'All' ? '' : currentTimeframe);

        const response = await fetch(url.toString());

        if (!response.ok) throw new Error("Failed to load events");

        const events = await response.json();

        grid.replaceChildren();
        if (!isFilterUpdate) {
            artistContainer.replaceChildren();
            carousel.replaceChildren();
            dotsContainer.replaceChildren();
        }

        if (events.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'status-message';
            emptyMsg.style.gridColumn = '1/-1';
            emptyMsg.textContent = 'No events found matching your criteria.';
            grid.appendChild(emptyMsg);
            return;
        }

        if (!isFilterUpdate) {

            //render hero carousel
            const featuredEvents = events.slice(0, 4);
            featuredEvents.forEach((event, index) => {
                const defaultImg = 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200';
                const bgImage = event.imageUrl || defaultImg;

                const slideClone = slideTemplate.content.cloneNode(true);
                const slideDiv = slideClone.querySelector('.hero-slide');

                slideDiv.style.backgroundImage = `url('${bgImage}')`;
                slideClone.querySelector('.slide-title').textContent = event.name;

                const dateStr = new Date(event.eventDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                slideClone.querySelector('.slide-subtitle').textContent = `${dateStr} | ${event.venue}`;

                carousel.appendChild(slideClone);

                const dot = document.createElement('div');
                dot.className = index === 0 ? 'dot active' : 'dot';
                dot.onclick = () => goToSlide(index);
                dotsContainer.appendChild(dot);
            });

            if (featuredEvents.length > 1) {
                slideInterval = setInterval(() => {
                    let nextSlide = (currentSlide + 1) % featuredEvents.length;
                    goToSlide(nextSlide);
                }, 4000);
            }
        }

        //Render events grid 
        events.forEach((event) => {
            const cardClone = eventTemplate.content.cloneNode(true);
            const imgEl = cardClone.querySelector('.card-img');
            imgEl.src = event.imageUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600';

            const dateObj = new Date(event.eventDateTime);
            cardClone.querySelector('.card-date').textContent = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            cardClone.querySelector('.card-title').textContent = event.name;
            cardClone.querySelector('.card-venue').textContent = event.venue;
            cardClone.querySelector('.card-price span').textContent = event.ticketPrice;

            const bookBtn = cardClone.querySelector('.book-tickets-btn');
            bookBtn.addEventListener('click', () => handleBookClick(event.id));

            grid.appendChild(cardClone);
        });

        //Render artists
        if (!isFilterUpdate) {
            try {
                const artistResponse = await fetch(`${EVENT_API_URL}?filter=artists`);
                if (!artistResponse.ok) throw new Error("Failed to fetch artists");
                const artistEvents = await artistResponse.json();

                const uniqueArtists = new Map();
                artistEvents.forEach(event => {
                    if (event.artistName && event.artistName.trim()) {
                        if (!uniqueArtists.has(event.artistName)) {
                            uniqueArtists.set(event.artistName, {
                                name: event.artistName,
                                image: event.imageUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'
                            });
                        }
                    }
                });

                const artistsHeading = document.getElementById('artists-heading');
                if (uniqueArtists.size === 0) {
                    if (artistsHeading) artistsHeading.style.display = 'none';
                    artistContainer.style.display = 'none';
                } else {
                    if (artistsHeading) artistsHeading.style.display = 'block';
                    artistContainer.style.display = 'flex';

                    uniqueArtists.forEach(artist => {
                        const artistClone = artistTemplate.content.cloneNode(true);
                        const imgEl = artistClone.querySelector('.artist-img');

                        imgEl.src = artist.image;
                        imgEl.alt = artist.name;
                        artistClone.querySelector('.artist-name').textContent = artist.name;

                        artistContainer.appendChild(artistClone);
                    });
                }
            } catch (artistError) {
                console.error("Artist fetch error:", artistError);
            }
        }

    } catch (error) {
        console.error("Public fetch error:", error);
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-msg';
        errorMsg.style.gridColumn = '1/-1';
        errorMsg.textContent = 'Unable to load events at this time.';
        grid.replaceChildren(errorMsg);
    }
}

// Carousel working and sliding method
function goToSlide(index) {
    const carousel = document.getElementById('hero-carousel');
    const dots = document.querySelectorAll('.dot');

    if (!carousel || dots.length === 0) return;

    currentSlide = index;
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach(d => d.classList.remove('active'));
    if (dots[currentSlide]) dots[currentSlide].classList.add('active');
}

// Auth dialogs opening and closing functions
function promptLogin() {
    alert("Please log in or sign up to book tickets!");
    openLoginModal();
}

function openLoginModal() {
    document.getElementById('signup-modal').classList.add('hidden');
    document.getElementById('login-modal').classList.remove('hidden');
}

function openSignupModal() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('signup-modal').classList.remove('hidden');
}

function closeAuthModals() {
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('signup-modal').classList.add('hidden');
}

// Toast box function for success and error message
function showToast(message, isError = false) {
    const toast = document.getElementById('toast-container');
    const msgElement = document.getElementById('toast-message');

    if (!toast || !msgElement) return;

    const icon = isError ? '<i class="fa-solid fa-circle-exclamation"></i>' : '<i class="fa-solid fa-circle-check"></i>';
    msgElement.innerHTML = `${icon} ${message}`;

    if (isError) {
        toast.classList.add('toast-error');
    } else {
        toast.classList.remove('toast-error');
    }

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
    alert("Your session has expired for security reasons. Please log in again.");
    window.location.href = 'index.html'; 
}