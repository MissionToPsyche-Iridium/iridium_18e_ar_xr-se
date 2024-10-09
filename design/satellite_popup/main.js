// Fetch JSON data from the file
fetch("data.json")
  .then((response) => response.json())
  .then((data) => {
    console.log("Loaded JSON:", data); // Debugging the JSON content
    const popups = data.popups;

    popups.forEach((popupData, index) => {
      const popupId = `popup${index + 1}`; // Generates popup1, popup2, popup3...
      const popupTitle = document.querySelector(`#${popupId} .popup-title`);
      const popupDescription = document.querySelector(
        `#${popupId} .popup-description`,
      );
      const button = document.querySelector(
        `.open-popup[data-popup="${popupId}"]`,
      );

      if (popupTitle && popupDescription) {
        popupTitle.textContent = popupData.title;
        popupDescription.textContent = popupData.description;
        button.textContent = popupData.title; // Set button text to the title
      } else {
        console.error(`Could not find elements for ${popupId}`);
      }
    });

    // Call the createStars function with the desired number of stars
    createStars(100);
  })
  .catch((error) => console.error("Error loading JSON:", error));

// Function to create stars
function createStars(numStars) {
  const starContainer = document.createElement("div");
  starContainer.className = "star-container";
  document.body.appendChild(starContainer);

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.className = "star";

    // Random size for stars
    const size = Math.random() * 3 + 2; // Random size between 2px and 5px
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;

    // Random position for stars
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;

    starContainer.appendChild(star);
  }
}

// Popup functionality for all popups
const popupElements = document.querySelectorAll(".popup");
const openPopupButtons = document.querySelectorAll(".open-popup");
const closeButtons = document.querySelectorAll(".close");

// Add event listeners to each button to open the corresponding popup
openPopupButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const popupId = button.getAttribute("data-popup");
    const popupElement = document.getElementById(popupId);
    popupElement.style.display = "block";
  });
});

// Add event listeners to each close button to close the popups
closeButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const popup = event.target.closest(".popup");
    popup.style.display = "none";
  });
});

// Close the popup when clicking outside the content
window.addEventListener("click", (event) => {
  popupElements.forEach((popup) => {
    if (event.target == popup) {
      popup.style.display = "none";
    }
  });
});
