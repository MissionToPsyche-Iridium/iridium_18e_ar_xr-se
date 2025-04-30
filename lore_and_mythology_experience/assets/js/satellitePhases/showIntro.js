/**
 * showIntro.js
 * @author Nicole Garcia, Emily Dinaro
 */

import { AudioManager } from '../AudioManager.js';
/**
* showIntro
* display info about Psyche satellite launch date and time in a typing animation
* takes in a callback function so that phases displays only when the prior one is completed
 */
export default function showIntro(introBool, audioManager, callback) {
    console.log('Transitioning to satellite intro');
    audioManager.play("typing");
    if (!introBool) {
        const text = "Psyche launched at \n10:19 a.m. EDT\nFriday, October 13, 2023.";

        const introDiv = document.createElement("div");
        introDiv.setAttribute("id", "intro-modal");
        introDiv.setAttribute("style", "display: block; position: fixed;" +
            " z-index: 20; width: 100%; height: 100%; padding: 2vh; ");

        introDiv.innerHTML = "";
        document.body.appendChild(introDiv);

        Object.assign(introDiv.style, {
            top: "80%",
            left: "50%",
            color: "#C9FFFC",
            background: "rgba(0, 0, 0, 0.2)",
            transform: "translate(-50%, -50%)",
            fontSize: "24px",
            fontFamily: "Comfortaa, Arial, sans-serif",
            textAlign: "center",
            whiteSpace: "pre-line",
            borderRight: "2px solid #C9FFFC", // Cursor effect
            padding: "5px",
            overflow: "hidden",
            transition: "1.5s",
            fontWeight: "bold"
        });

        let index = 0;

        /**
         * typeText
         * Animates the line of text in a typing style.
         * To update how fast the typing animation is, modify the number in the
         * setTimeout (the line with the 'typing speed' comment.
         */
        function typeText() {
            if (index < text.length) {
                introDiv.innerHTML += text[index] === "\n" ? "<br>" : text[index];
                index++;
                setTimeout(typeText, 75); // typing speed
            } else {
                introDiv.style.borderRight = "none";
            }
        }

        // call the typeText function to animate the text
        typeText();

        setTimeout(() => {
            // hide phase modal and remove the phase images
            document.getElementById("intro-modal").remove();

            introBool = false;
            callback();
        }, 5000);
    } else { // else the applicaiton is not on this phase, so do not display it.
        document.getElementById("intro-modal").setAttribute("style", "display: none;");
        introBool = false;
        callback();
    }
}
