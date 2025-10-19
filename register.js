const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);
      if (role === "Organizer") window.location.href = "organizer.html";
      else window.location.href = "participant.html";
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
});  // ✅ Correct closing

