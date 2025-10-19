// async function loadEvents() {
//   const container = document.getElementById('eventsContainer');
//   container.innerHTML = '<p>Loading events...</p>';
//   try {
//     const res = await fetch('http://localhost:3000/api/events');
//     const data = await res.json();

//     if (data.success && data.data.length > 0) {
//       container.innerHTML = '';
//       data.data.forEach(e => {
//         const card = document.createElement('div');
//         card.className = 'card';
//         card.innerHTML = `
//           <h3>${e.title}</h3>
//           <p><span style="color:#353563;">Date:</span> ${new Date(e.date).toDateString()}</p>
//           <p><span style="color:#353563;">Venue:</span> ${e.venue}</p>
//           <button class="ticket-btn" onclick="alert('Booking tickets for ${e.title}')">Book Ticket</button>
//         `;
//         container.appendChild(card);
//       });
//     } else {
//       container.innerHTML = '<p>No upcoming events found.</p>';
//     }
//   } catch (err) {
//     console.error('Error loading events:', err);
//     container.innerHTML = '<p>Failed to load events.</p>';
//   }
// }

// loadEvents();
function setRole(role) {
  // Don't set role in localStorage yet - user must login first
  // Store the intended role temporarily to show appropriate login message or redirect after login
  localStorage.setItem('intended_role', role);
  document.getElementById('roleDisplay').innerText = `Role: ${role}`;
  
  // Redirect to login page instead of directly to dashboard
  window.location.href = 'login.html';
}

// Load events and display on the homepage
async function loadEvents() {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '<p>Loading events...</p>';
  try {
    const res = await fetch('http://localhost:3000/api/events');
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      container.innerHTML = '';
      data.data.forEach(e => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
  <h3>${e.title}</h3>
  <p><span style="color:#353563;">Date:</span> ${new Date(e.date).toDateString()}</p>
  <p><span style="color:#353563;">Venue:</span> ${e.venue}</p>
  <button class="details-btn" onclick='viewEventDetails(${JSON.stringify(JSON.stringify(e))})'>View Details</button>
`;

        container.appendChild(card);
      });
    } else {
      container.innerHTML = '<p>No upcoming events found.</p>';
    }
  } catch (err) {
    console.error('Error loading events:', err);
    container.innerHTML = '<p>Failed to load events.</p>';
  }
}
document.getElementById("loginRegisterBtn").onclick = function() {
  window.location.href = "login.html";  // or "register.html" if you want
};
function viewEventDetails(eventId) {
  window.location.href = `event-details.html?event_id=${eventId}`;
  // Later, you can create event-details.html and display info using eventId from URL
}
window.viewEventDetails = function(eventObjStr) {
  const event = JSON.parse(decodeURIComponent(eventObjStr));
  const modal = document.getElementById('eventModal');
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `
    <span class="close-btn" id="closeModal">&times;</span>
    <h2>${event.title}</h2>
    <p><strong>Date:</strong> ${new Date(event.date).toDateString()}</p>
    <p><strong>Venue:</strong> ${event.venue}</p>
    <p>${event.description || ""}</p>
  `;
  modal.style.display = "block";

  document.getElementById('closeModal').onclick = function() {
    modal.style.display = "none";
  };
  // Hide modal when clicking outside the box
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
};




// Load events on page load
loadEvents();

