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
  localStorage.setItem('role', role);
  document.getElementById('roleDisplay').innerText = `Role: ${role}`;
  if (role === 'Organizer') {
    window.location.href = 'organizer.html';
  }else if (role === 'Participant') {
    window.location.href = 'participant.html';
  }

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
          <button class="ticket-btn" onclick="alert('Booking tickets for ${e.title}')">Book Ticket</button>
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

// Load events on page load
loadEvents();

