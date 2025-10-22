// Role Selection Function
function selectRole(role) {
    // Store the selected role and redirect to appropriate login page
    if (role === 'organizer') {
        window.location.href = 'organizer-login.html';
    } else if (role === 'participant') {
        window.location.href = 'participant-login.html';
    }
}
// Load events and display on the homepage
async function loadEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    container.innerHTML = '<p style="text-align: center; color: #666;">Loading events...</p>';
    
    try {
        const res = await fetch('http://localhost:3000/api/events');
        const data = await res.json();

        if (data.success && data.data.length > 0) {
            container.innerHTML = '';
            
            // Client-side fallback: sort by date ascending (server should already do this)
            const sortedEvents = data.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            sortedEvents.forEach(event => {
                // Check if event is past (defensive check)
                const eventDate = new Date(event.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = eventDate < today;
                
                const card = document.createElement('div');
                card.className = isPast ? 'card event-past' : 'card';
                
                // Format price
                const priceDisplay = event.price && event.price > 0 
                    ? `₹ ${parseFloat(event.price).toFixed(2)}` 
                    : 'Free';
                
                card.innerHTML = `
                    <h3>${event.title}</h3>
                    <p class="date">📅 ${new Date(event.date).toLocaleDateString()}</p>
                    <p class="venue">📍 ${event.venue}</p>
                    <div class="price-badge">${priceDisplay}</div>
                    ${event.description ? `<p style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>` : ''}
                    ${isPast 
                        ? '<button class="details-btn" disabled style="opacity: 0.5; cursor: not-allowed;">Event Passed</button>' 
                        : `<button class="details-btn" onclick='viewEventDetails(${JSON.stringify(event).replace(/"/g, '&quot;')})'>View Details</button>`
                    }
                `;
                container.appendChild(card);
            });
        } else {
            container.innerHTML = '<p style="text-align: center; color: #666;">No upcoming events found.</p>';
        }
    } catch (err) {
        console.error('Error loading events:', err);
        container.innerHTML = '<p style="text-align: center; color: #e74c3c;">Failed to load events. Please try again later.</p>';
    }
}

// Event Details Modal
window.viewEventDetails = function(event) {
    const modal = document.getElementById('eventModal');
    const modalContent = document.getElementById('modalContent');
    
    // Check if event is past
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = eventDate < today;
    
    // Format price
    const priceDisplay = event.price && event.price > 0 
        ? `₹ ${parseFloat(event.price).toFixed(2)}` 
        : 'Free';
    
    modalContent.innerHTML = `
        <span class="close-btn" id="closeModal">&times;</span>
        <h2>${event.title}</h2>
        ${isPast ? '<div style="background: #e74c3c; color: white; padding: 0.5rem; border-radius: 4px; text-align: center; margin: 1rem 0;">⚠️ This event has passed</div>' : ''}
        <div style="margin: 1rem 0;">
            <p><strong>📅 Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>📍 Venue:</strong> ${event.venue}</p>
            <p><strong>💰 Price:</strong> ${priceDisplay}</p>
            ${event.description ? `<p><strong>📝 Description:</strong></p><p style="margin-top: 0.5rem; line-height: 1.5;">${event.description}</p>` : ''}
        </div>
        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
            <button class="btn-primary" onclick="closeModal()">Close</button>
            ${isPast 
                ? '<button class="btn-primary" disabled style="opacity: 0.5; cursor: not-allowed;">Booking Closed</button>' 
                : `<button class="btn-primary" onclick="bookEvent(${event.event_id})">Book Event</button>`
            }
        </div>
    `;
    
    modal.style.display = "block";
    
    // Close modal handlers
    document.getElementById('closeModal').onclick = closeModal;
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
};

// Close modal function
function closeModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = "none";
}

// Book event function
function bookEvent(eventId) {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (!token) {
        showAccessDeniedModal('Please log in as a participant to book events.');
        return;
    }
    
    if (userRole !== 'Participant') {
        showAccessDeniedModal('Only participants can book events. Please log in as a participant.');
        return;
    }
    
    // Redirect to booking or show booking modal
    window.location.href = `participant.html?action=book&event_id=${eventId}`;
}

// Access Denied Modal
function showAccessDeniedModal(message) {
    const modal = document.getElementById('accessDeniedModal');
    const messageElement = document.getElementById('accessDeniedMessage');
    
    messageElement.textContent = message;
    modal.style.display = 'block';
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            closeAccessDeniedModal();
        }
    };
}

function closeAccessDeniedModal() {
    const modal = document.getElementById('accessDeniedModal');
    modal.style.display = 'none';
}

// About Modal Functions
function openAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'block';
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            closeAboutModal();
        }
    };
}

function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'none';
}

// Check authentication status on page load
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (token && userRole) {
        // User is logged in, show appropriate navigation
        const nav = document.querySelector('.main-nav');
        if (nav) {
            nav.innerHTML += `
                <a href="${userRole === 'Organizer' ? 'organizer.html' : 'participant.html'}" class="nav-link">Dashboard</a>
                <a href="#" onclick="logout()" class="nav-link">Logout</a>
            `;
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    
    // Show logout success message
    alert('You have successfully logged out!');
    
    // Reload page to update navigation
    window.location.reload();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    checkAuthStatus();
    
    // Add event listener for About modal close button
    const closeAboutBtn = document.getElementById('closeAboutModal');
    if (closeAboutBtn) {
        closeAboutBtn.onclick = closeAboutModal;
    }
});

