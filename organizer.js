// Check authentication and role on page load
const token = localStorage.getItem("token");
const userId = localStorage.getItem("user_id");
const role = localStorage.getItem("role");
const name = localStorage.getItem("name");

const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");

if (!token || !userId) {
  alert("Please login first to access this page.");
  window.location.href = "organizer-login.html";
} else if (role !== "Organizer") {
  alert("Access Denied!\n\nThis page is only accessible to Organizers.\nYou are currently logged in as: " + role + "\n\nPlease logout and login with an Organizer account.");
  window.location.href = "participant.html";
}

if (userInfo) userInfo.innerText = name ? `Hello, ${name}` : "";

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("You have successfully logged out!");
    window.location.href = "index.html";
  });
}

// If authenticated and authorized, load events
window.onload = function() {
  loadEvents();
};



// Load events from backend API and display with Edit/Delete
async function loadEvents() {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = '<p>Loading events...</p>';
  try {
    const res = await fetch('http://localhost:3000/api/events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      container.innerHTML = '';
      data.data.forEach(e => {
        const card = document.createElement('div');
        card.className = 'card';
        const priceDisplay = e.price && parseFloat(e.price) > 0 ? `₹ ${parseFloat(e.price).toFixed(2)}` : 'Free';
        card.innerHTML = `
          <h3>${e.title}</h3>
          <p><span style="color:#353563;">Date:</span> ${new Date(e.date).toLocaleDateString()}</p>
          <p><span style="color:#353563;">Venue:</span> ${e.venue}</p>
          <p><span style="color:#353563;">Price:</span> <strong style="color:#667eea;">${priceDisplay}</strong></p>
          <p>${e.description ? e.description : ''}</p>
          <button onclick="showEdit(${e.event_id})">Edit</button>
          <button onclick="deleteEvent(${e.event_id})">Delete</button>
          <div id="editForm-${e.event_id}" class="edit-form" style="display:none; margin-top:8px;">
            <input type="text" id="editTitle-${e.event_id}" value="${e.title}" />
            <input type="date" id="editDate-${e.event_id}" value="${e.date.split('T')[0]}" />
            <input type="text" id="editVenue-${e.event_id}" value="${e.venue}" />
            <textarea id="editDesc-${e.event_id}">${e.description ? e.description : ''}</textarea>
            <label>Price (₹): <input type="number" id="editPrice-${e.event_id}" value="${e.price || 0}" min="0" step="0.01" /></label>
            <button onclick="updateEvent(${e.event_id})">Save</button>
            <button onclick="hideEdit(${e.event_id})">Cancel</button>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = '<p>No events found.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p>Error loading events.</p>';
  }
}

// Show Edit Form
window.showEdit = function(id) {
  document.getElementById(`editForm-${id}`).style.display = 'block';
};
window.hideEdit = function(id) {
  document.getElementById(`editForm-${id}`).style.display = 'none';
};

// Delete Event
window.deleteEvent = async function(id) {
  if (!confirm('Delete this event?')) return;
  try {
    const res = await fetch(`http://localhost:3000/api/events/${id}`, { 
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const out = await res.json();
    if (out.success) {
      loadEvents();
    } else {
      alert('Delete failed');
    }
  } catch {
    alert('Error deleting.');
  }
};

// Edit (Update) Event
window.updateEvent = async function(id) {
  const title = document.getElementById(`editTitle-${id}`).value;
  const date = document.getElementById(`editDate-${id}`).value;
  const venue = document.getElementById(`editVenue-${id}`).value;
  const description = document.getElementById(`editDesc-${id}`).value;
  const price = document.getElementById(`editPrice-${id}`).value;
  try {
    const res = await fetch(`http://localhost:3000/api/events/${id}`, {
      method: 'PUT',
      headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, date, venue, description, price: parseFloat(price) || 0 })
    });
    const out = await res.json();
    if (out.success) {
      window.hideEdit(id);
      loadEvents();
    } else {
      alert('Update failed');
    }
  } catch {
    alert('Error updating.');
  }
};


// Add New Event
const addEventForm = document.getElementById('addEventForm');
addEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const date = document.getElementById('date').value;
  const venue = document.getElementById('venue').value;
  const description = document.getElementById('description').value;
  const price = document.getElementById('price').value;
  
  // Validate price
  if (parseFloat(price) < 0) {
    alert('Price cannot be negative');
    return;
  }
  
  try {
    const res = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, date, venue, description, price: parseFloat(price) || 0 })
    });
    const out = await res.json();
    if (out.success) {
      addEventForm.reset();
      loadEvents();
    } else {
      alert(out.message || 'Add failed');
    }
  } catch {
    alert('Error creating.');
  }
});


// Initial load
loadEvents();

