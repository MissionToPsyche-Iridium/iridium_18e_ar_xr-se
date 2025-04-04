/**
 * showFinale.js
 * @author Nicole Garcia, Ryan Dinville
 */

/**
 * showFinale
 * Shows the Psyche logo, which is a link to the psyche.edu website,
 * and shows a button to restart the expereince
 * @param finaleBool boolean used to determine if this phase should run
 */
export default function showFinale(finaleBool) {
    if (!finaleBool) {
        finaleBool = true;

        console.log("Psyche Lore Journey complete!");

        // modal container
        const finaleDiv = document.createElement("div");
        finaleDiv.setAttribute("id", "finale-modal");
        finaleDiv.setAttribute(
            "style",
            "display: flex; flex-direction: column; align-items: center; justify-content: center;" +
            " position: fixed; z-index: 9999; left: 0; top: 0; width: 100vw; height: 100vh;" +
            " background-color: rgba(0, 0, 0, 0.8); overflow: hidden; transition: 1.5s;" +
            " font-family: 'Comfortaa', Arial, sans-serif; text-align: center; color: white;"
        );

        // logo image
        const logo = document.createElement("img");
        logo.setAttribute("src", "../assets/images/smp/Psyche_Icon_Color-SVG.svg");
        logo.setAttribute("id", "phase");
        logo.setAttribute(
            "style",
            "background-color: transparent; width: 30vw; max-width: 200px; height: auto;" +
            " pointer-events: auto; z-index: 999; cursor: pointer;" +
            " border-radius: 12px; padding: 2vh;" +
            " transition: 1.5s ease-in-out;"
        );

        // message
        const finaleText = document.createElement("p");
        finaleText.innerText = "You have come to the end of this experience.";
        finaleText.setAttribute(
            "style",
            "font-size: 2vh; margin-top: 2vh; margin-bottom: 2vh; max-width: 60vw;" +
            " color: white; text-align: center; font-weight: bold;"
        );

        // restart button
        const restartButton = document.createElement("button");
        restartButton.innerText = "Restart the Journey";
        restartButton.setAttribute(
            "style",
            "margin-top: 4vh; width: 30vw; max-width: 200px; padding: 1.5vh 2vw;" +
            " font-size: 1.8vh; font-weight: bold; color: white;" +
            " background-color: #f98400; border: none; border-radius: 8px; cursor: pointer; transition: 0.3s ease;" +
            " font-family: 'Comfortaa', Arial, sans-serif;"
        );

        // Hover effects
        restartButton.addEventListener("mouseover", () => {
            restartButton.style.backgroundColor = "#e09309";
        });

        restartButton.addEventListener("mouseout", () => {
            restartButton.style.backgroundColor = "#f98400";
        });

        // Redirect on click
        restartButton.addEventListener("click", () => {
            window.location.href = "../pages/index.html"; // Change to your desired page
        });

        // Append elements
        finaleDiv.appendChild(logo);
        finaleDiv.appendChild(finaleText); // Add the new text element
        finaleDiv.appendChild(restartButton);
        document.body.appendChild(finaleDiv);

        logo.addEventListener("click", function() {
            window.top.location.href = "https://psyche.asu.edu/";
        });
    }
}
