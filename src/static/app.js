document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const activityCardTemplate = document.getElementById("activity-card-template");
  const participantItemTemplate = document.getElementById("participant-item-template");

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        await fetchActivities();
      } else {
        showMessage(result.detail || "Failed to unregister participant", "error");
      }
    } catch (error) {
      showMessage("Failed to unregister participant. Please try again.", "error");
      console.error("Error unregistering participant:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities", { cache: "no-store" });
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = activityCardTemplate.content.firstElementChild.cloneNode(true);

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsList = activityCard.querySelector(".participants-list");
        const participantsEmpty = activityCard.querySelector(".participants-empty");

        activityCard.querySelector(".activity-title").textContent = name;
        activityCard.querySelector(".activity-description").textContent = details.description;
        activityCard.querySelector(".activity-schedule").textContent = details.schedule;
        activityCard.querySelector(".activity-availability").textContent = `${spotsLeft} spots left`;

        if (details.participants.length) {
          details.participants.forEach((participant) => {
            const participantItem = participantItemTemplate.content.firstElementChild.cloneNode(true);
            const removeBtn = participantItem.querySelector(".participant-remove-btn");

            participantItem.querySelector(".participant-email").textContent = participant;
            removeBtn.setAttribute("aria-label", `Unregister ${participant}`);
            removeBtn.addEventListener("click", () => unregisterParticipant(name, participant));

            participantsList.appendChild(participantItem);
          });
          participantsList.classList.remove("hidden");
          participantsEmpty.classList.add("hidden");
        } else {
          participantsList.classList.add("hidden");
          participantsEmpty.classList.remove("hidden");
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, "success");
        signupForm.reset();
        await fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
